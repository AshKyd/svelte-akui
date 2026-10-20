<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '../Button/Button.svelte';
	import Glow from '../Glow/Glow.svelte';
	import { ElementStore } from './ElementStore.svelte';
	import { toSvgMarkup } from './elements/registry';
	import { unionBounds } from './elements/geometry';
	import { createPointerGestures } from './pointerGestures';
	import { elementsToSvg, svgToElements } from './svgDocument';
	import { createEraseTool } from './tools/eraseTool';
	import { createPenTool } from './tools/penTool';
	import { DEFAULT_CUSTOM_COLOUR, PEN_COLOURS } from './penColours';
	import type { ToolContext, ToolId } from './tools/types';
	import { fitView, IDENTITY_VIEW, type View } from './viewTransform';

	interface Props {
		/** Saved SVG to load when the component mounts. Later changes to this prop are ignored. */
		svg?: string;
		/** The active tool. */
		tool?: ToolId;
		/** Pen diameter in world units (bindable). It scales with zoom like the strokes themselves. */
		penSize?: number;
		/** Brush sizes offered in the size menu, in world units. */
		penSizes?: number[];
		/** Hex colour for new strokes (bindable). Undefined is the default ink, which follows the theme. */
		penColour?: string;
		/** Called after every committed change: stroke added, strokes erased, undo, redo or clear. */
		onchange?: () => void;
	}

	let {
		svg = '',
		tool = $bindable('pen'),
		penSize = $bindable(3),
		penSizes = [3, 6, 12],
		penColour = $bindable(),
		onchange
	}: Props = $props();

	/** Last colour picked with the custom swatch, so reselecting it brings that colour back. */
	let customColour = $state(DEFAULT_CUSTOM_COLOUR);
	const isCustomColour = $derived(
		penColour !== undefined && !PEN_COLOURS.some(({ value }) => value === penColour)
	);

	/** Eraser radius on screen, so it feels the same at any zoom. */
	const ERASER_RADIUS_PX = 12;

	/** Opened by choosing the pen, closed by choosing another tool or the pen again. */
	let isSizeMenuOpen = $state(false);
	const showSizeMenu = $derived(tool === 'pen' && isSizeMenuOpen);

	function selectPen() {
		isSizeMenuOpen = tool === 'pen' ? !isSizeMenuOpen : true;
		tool = 'pen';
	}

	function selectEraser() {
		isSizeMenuOpen = false;
		tool = 'erase';
	}

	/** Dot diameter in px for a size button, so the choices read as small to large. */
	const dotDiameter = (size: number) => Math.round(4 + size * 1.5);

	const store = new ElementStore();

	let view = $state<View>(IDENTITY_VIEW);
	let viewportWidth = $state(0);
	let viewportHeight = $state(0);
	let pendingErase = $state<ReadonlySet<string>>(new Set());

	let viewportElement = $state<HTMLElement>();
	let canvasElement = $state<HTMLCanvasElement>();
	let redrawFrame = 0;

	// Export-only helpers below are called by the owner via `bind:this`.

	/** Serialises the drawing as a standalone SVG. */
	export const getSvg = () => elementsToSvg(store.elements);

	/** True when there is nothing drawn, e.g. to disable a Save button. */
	export const isEmpty = () => store.elements.length === 0;

	export function undo() {
		store.undo();
		onchange?.();
	}

	export function redo() {
		store.redo();
		onchange?.();
	}

	export function clear() {
		store.clear();
		onchange?.();
	}

	/** Centres the whole drawing in the viewport. */
	export function resetView() {
		const bounds = store.elements.length
			? unionBounds(store.elements.map((element) => element.bounds))
			: null;
		view = fitView(bounds, { width: viewportWidth, height: viewportHeight });
	}

	// ---- Live canvas: only ever paints the gesture in progress ----

	const requestRedraw = () => {
		if (redrawFrame) return;
		redrawFrame = requestAnimationFrame(() => {
			redrawFrame = 0;
			paintLiveLayer();
		});
	};

	function paintLiveLayer() {
		const canvasContext = canvasElement?.getContext('2d');
		if (!canvasContext || !canvasElement || !viewportElement) return;
		const ratio = window.devicePixelRatio || 1;
		canvasContext.setTransform(1, 0, 0, 1, 0, 0);
		canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);
		canvasContext.setTransform(
			ratio * view.k,
			0,
			0,
			ratio * view.k,
			ratio * view.x,
			ratio * view.y
		);
		const ink = getComputedStyle(viewportElement).color;
		// Only the tool with a gesture in progress paints anything, and which one that is was
		// decided when the press landed (Alt can swap it), so every tool is asked.
		Object.values(tools).forEach((drawingTool) => {
			canvasContext.save();
			canvasContext.globalAlpha = 1;
			canvasContext.fillStyle = ink;
			drawingTool.draw(canvasContext);
			canvasContext.restore();
		});
	}

	// ---- Tools and gestures ----

	const toolContext: ToolContext = {
		store,
		getPenSize: () => penSize,
		getPenColour: () => penColour,
		getScale: () => view.k,
		eraserRadiusPx: ERASER_RADIUS_PX,
		setPendingErase: (ids) => (pendingErase = ids),
		requestRedraw,
		notifyChange: () => onchange?.()
	};

	const tools = {
		pen: createPenTool(toolContext),
		erase: createEraseTool(toolContext)
	};

	const gestures = createPointerGestures({
		// Holding Alt as a press lands erases with whichever tool is selected.
		getTool: (useEraser) => (useEraser ? tools.erase : tools[tool]),
		getView: () => view,
		setView: (nextView) => (view = nextView)
	});

	// ---- Lifecycle ----

	onMount(() => {
		if (svg) store.load(svgToElements(svg));
		resetView();
	});

	// Keep the canvas's pixel size matched to its box (and the screen's pixel density).
	$effect(() => {
		if (!canvasElement) return;
		const ratio = window.devicePixelRatio || 1;
		canvasElement.width = Math.round(viewportWidth * ratio);
		canvasElement.height = Math.round(viewportHeight * ratio);
		paintLiveLayer();
	});

	// Pan and zoom move the in-progress stroke too.
	$effect(() => {
		void view;
		requestRedraw();
	});

	/** True while Alt is down, so the toolbar can show the eraser is what a press will use. */
	let isAltHeld = $state(false);
	const activeToolId = $derived(isAltHeld ? 'erase' : tool);

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Alt') isAltHeld = true;

		// Shortcuts must never steal keys from a text field elsewhere on the page.
		const target = event.target;
		const isTyping =
			target instanceof HTMLElement &&
			(target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
		if (isTyping) return;

		const hasCommandKey = event.metaKey || event.ctrlKey;
		if (hasCommandKey && event.key.toLowerCase() === 'z') {
			event.preventDefault();
			if (event.shiftKey) redo();
			else undo();
			return;
		}

		// 1 and 2 pick the tools in toolbar order. Plain keys only, so browser shortcuts such as
		// Cmd+1 (switch tab) and Alt+1 are left alone, and a held key doesn't repeat the choice.
		if (hasCommandKey || event.altKey || event.repeat) return;
		if (event.key === '1') tool = 'pen';
		else if (event.key === '2') selectEraser();
	}
</script>

<!-- Alt released while the window was unfocused would otherwise leave the eraser showing. -->
<svelte:window
	onkeydown={handleKeydown}
	onkeyup={(event) => event.key === 'Alt' && (isAltHeld = false)}
	onblur={() => (isAltHeld = false)}
/>

<div
	class="drawing-freehand"
	bind:this={viewportElement}
	bind:clientWidth={viewportWidth}
	bind:clientHeight={viewportHeight}
	{@attach gestures.attach}
>
	<svg class="layer" role="img" aria-label="Drawing">
		<g transform="translate({view.x} {view.y}) scale({view.k})">
			{#each store.elements as element (element.id)}
				<g class={['element', pendingErase.has(element.id) && 'pending']}>
					{@html toSvgMarkup(element)}
				</g>
			{/each}
		</g>
	</svg>
	<canvas class="layer" bind:this={canvasElement}></canvas>

	<!-- The gesture handlers ignore presses inside data-gesture-ignore, so a click doesn't draw a dot. -->
	<div class="controls" data-gesture-ignore>
		{#if showSizeMenu}
			<div class="panel pen-options">
				<div class="row" role="group" aria-label="Brush size">
					{#each penSizes as size (size)}
						<Button
							variant={size === penSize ? 'accent' : 'ghost'}
							class="icon-only"
							aria-label={`Brush size ${size}`}
							aria-pressed={size === penSize}
							onclick={() => (penSize = size)}
						>
							<!-- Fills the button so the glow follows its corners. Only the chosen size is sunken. -->
							<span class="brush">
								{#if size === penSize}<Glow inset />{/if}
								<span
									class="size-dot"
									style:width="{dotDiameter(size)}px"
									style:height="{dotDiameter(size)}px"
									style:background-color={penColour}
								></span>
							</span>
						</Button>
					{/each}
				</div>

				<div class="colours" role="group" aria-label="Colour">
					{#each PEN_COLOURS as { name, value } (name)}
						<button
							type="button"
							class="swatch"
							style:background-color={value ?? 'currentColor'}
							aria-label={name}
							aria-pressed={value === penColour}
							onclick={() => (penColour = value)}
						>
							<Glow inset={value === penColour} />
						</button>
					{/each}
					<!-- The rainbow swatch wraps a native colour input, so it opens the system picker. -->
					<label class="swatch custom">
						<Glow inset={isCustomColour} />
						<input
							type="color"
							aria-label="Custom colour"
							value={customColour}
							onclick={() => (penColour = customColour)}
							oninput={(event) => {
								customColour = event.currentTarget.value;
								penColour = customColour;
							}}
						/>
					</label>
				</div>
			</div>
		{/if}

		<div class="panel" role="toolbar" aria-label="Drawing tools">
			<Button
				variant={activeToolId === 'pen' ? 'accent' : 'ghost'}
				icon="pencil"
				iconPosition="only"
				aria-label="Pen"
				aria-pressed={tool === 'pen'}
				aria-expanded={tool === 'pen' ? showSizeMenu : undefined}
				onclick={selectPen}
			/>
			<Button
				variant={activeToolId === 'erase' ? 'accent' : 'ghost'}
				icon="eraser"
				iconPosition="only"
				aria-label="Eraser"
				aria-pressed={tool === 'erase'}
				onclick={selectEraser}
			/>
			<Button
				variant="ghost"
				icon="arrow-counterclockwise"
				iconPosition="only"
				aria-label="Undo"
				disabled={!store.canUndo}
				onclick={undo}
			/>
			<Button
				variant="ghost"
				icon="arrow-clockwise"
				iconPosition="only"
				aria-label="Redo"
				disabled={!store.canRedo}
				onclick={redo}
			/>
			<Button
				variant="ghost"
				icon="fullscreen"
				iconPosition="only"
				aria-label="Fit drawing to view"
				onclick={resetView}
			/>
		</div>
	</div>
</div>

<style>
	.drawing-freehand {
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 200px;
		overflow: hidden;
		color: var(--akui-fg);
		background-color: var(--akui-bg);
		/* Pointer events do the panning and zooming, so the browser must not. */
		touch-action: none;
		user-select: none;
		-webkit-user-select: none;
	}

	.layer {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

	svg.layer {
		fill: currentColor;
	}

	.element.pending {
		opacity: 0.25;
	}

	.controls {
		position: absolute;
		bottom: var(--akui-space-m);
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--akui-space-xs);
	}

	.brush {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		border-radius: var(--akui-radius-m);
	}

	.size-dot {
		display: block;
		border-radius: 50%;
		background-color: currentColor;
	}

	.pen-options {
		align-items: center;
		gap: var(--akui-space-s);
	}

	.row {
		display: flex;
		align-items: center;
		gap: var(--akui-space-xs);
	}

	/* Six swatches in two rows of three, beside the sizes. */
	.colours {
		display: grid;
		grid-template-columns: repeat(3, auto);
		align-items: center;
		justify-items: center;
		gap: var(--akui-space-xs);
		padding-left: var(--akui-space-s);
		border-left: 1px solid var(--akui-border-input);
	}

	.swatch {
		position: relative;
		box-sizing: border-box;
		width: 1.5rem;
		height: 1.5rem;
		padding: 0;
		border: 1px solid var(--akui-border-input);
		border-radius: 50%;
		cursor: pointer;
	}

	.swatch.custom {
		background: conic-gradient(red, yellow, lime, cyan, blue, magenta, red);
	}

	.swatch input[type='color'] {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		opacity: 0;
		cursor: pointer;
	}

	.panel {
		display: flex;
		gap: var(--akui-space-xs);
		padding: var(--akui-space-xs);
		border-radius: var(--akui-radius-l);
		background-color: var(--akui-bg-secondary);
		border: 1px solid var(--akui-border-input);
	}
</style>
