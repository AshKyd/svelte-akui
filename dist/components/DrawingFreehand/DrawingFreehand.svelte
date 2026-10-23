<script lang="ts">
	import { onMount } from 'svelte';
	import { scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { motion } from '../../hooks/reducedMotion.svelte.js';
	import Button from '../Button/Button.svelte';
	import Glow from '../Glow/Glow.svelte';
	import { ElementStore } from './ElementStore.svelte';
	import { getElementKind, toSvgMarkup } from './elements/registry';
	import { unionBounds } from './elements/geometry';
	import { createPointerGestures } from './pointerGestures';
	import { elementsToSvg, svgToElements } from './svgDocument';
	import { applyMatrixToBounds, matrixToSvg, type Matrix } from './elements/matrix';
	import { createEraseTool } from './tools/eraseTool';
	import { createPenTool } from './tools/penTool';
	import { createPointerTool, MIN_SIZE_PX } from './tools/pointerTool';
	import SelectionHandles from './SelectionHandles/SelectionHandles.svelte';
	import type { HandleId } from './tools/selectionHandles';
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
		penSizes = [3, 6, 12, 24],
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


	/** Open whenever the pen becomes the tool, including at start. Closed by another tool or the pen button again. */
	let isSizeMenuOpen = $state(true);
	const showSizeMenu = $derived(tool === 'pen' && isSizeMenuOpen);

	/** The pen button: opens the menu, or closes it if the pen was already chosen. */
	function selectPen() {
		isSizeMenuOpen = tool === 'pen' ? !isSizeMenuOpen : true;
		tool = 'pen';
	}

	function selectEraser() {
		isSizeMenuOpen = false;
		tool = 'erase';
	}

	function selectPointer() {
		isSizeMenuOpen = false;
		tool = 'pointer';
	}

	/**
	 * Dot diameter in px for a size button. Each size is double the last, so the dot grows by a fixed
	 * step per doubling (log scale) and the largest still fits inside its button.
	 */
	const dotDiameter = (size: number) => Math.round(6 + 5 * Math.log2(size / 3));

	const store = new ElementStore();

	let view = $state<View>(IDENTITY_VIEW);
	let viewportWidth = $state(0);
	let viewportHeight = $state(0);
	let pendingErase = $state<ReadonlySet<string>>(new Set());

	// ---- Selection (pointer tool) ----

	let selectedId = $state<string>();
	/** The selected element's matrix while it is being dragged. Baked into the element on release. */
	let preview = $state<{ id: string; matrix: Matrix; handle?: HandleId } | null>(null);

	const selectedElement = $derived(
		selectedId ? store.elements.find((element) => element.id === selectedId) : undefined
	);
	/** Where the selection box is drawn, following the drag preview. */
	const selectionBounds = $derived(
		selectedElement && tool === 'pointer'
			? preview?.id === selectedElement.id
				? applyMatrixToBounds(preview.matrix, selectedElement.bounds)
				: selectedElement.bounds
			: undefined
	);

	/** Applies a keyboard move or resize as one undo step, like a finished drag. */
	function commitSelectionTransform(matrix: Matrix) {
		if (!selectedElement) return;
		store.replace(getElementKind(selectedElement.type).transform(selectedElement, matrix));
		onchange?.();
	}

	// The selection goes when another tool is chosen or its element is erased or undone away.
	$effect(() => {
		if (tool !== 'pointer' || (selectedId && !selectedElement)) selectedId = undefined;
	});

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
		notifyChange: () => onchange?.(),
		getSelectedId: () => selectedId,
		setSelectedId: (id) => (selectedId = id),
		setPreview: (nextPreview) => (preview = nextPreview)
	};

	const tools = {
		pen: createPenTool(toolContext),
		erase: createEraseTool(toolContext),
		pointer: createPointerTool(toolContext)
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

		// 1, 2 and 3 pick the tools in toolbar order. Plain keys only, so browser shortcuts such as
		// Cmd+1 (switch tab) and Alt+1 are left alone, and a held key doesn't repeat the choice.
		if (hasCommandKey || event.altKey || event.repeat) return;
		if (event.key === '1') selectPointer();
		else if (event.key === '2') {
			tool = 'pen';
			isSizeMenuOpen = true;
		} else if (event.key === '3') selectEraser();
		else if ((event.key === 'Delete' || event.key === 'Backspace') && selectedId) {
			event.preventDefault();
			store.remove([selectedId]);
			onchange?.();
		}
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
				<g
					class={['element', pendingErase.has(element.id) && 'pending']}
					transform={preview?.id === element.id ? matrixToSvg(preview.matrix) : undefined}
				>
					{@html toSvgMarkup(element)}
				</g>
			{/each}
		</g>
	</svg>
	<canvas class="layer" bind:this={canvasElement}></canvas>

	{#if selectionBounds}
		<SelectionHandles
			bounds={selectionBounds}
			{view}
			activeHandle={preview?.handle}
			minSizePx={MIN_SIZE_PX}
			ontransform={commitSelectionTransform}
			ondeselect={() => (selectedId = undefined)}
		/>
	{/if}

	<!-- The gesture handlers ignore presses inside data-gesture-ignore, so a click doesn't draw a dot. -->
	<div class="controls" data-gesture-ignore>
		{#if showSizeMenu}
			<div
				class="panel pen-options"
				transition:scale={motion({ start: 0.92, duration: 150, easing: cubicOut })}
			>
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
				variant={activeToolId === 'pointer' ? 'accent' : 'ghost'}
				icon="cursor"
				iconPosition="only"
				aria-label="Select"
				aria-pressed={tool === 'pointer'}
				onclick={selectPointer}
			/>
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
		/* iPadOS: no callout or highlight flash when the Pencil or a finger presses and holds. */
		-webkit-touch-callout: none;
		-webkit-tap-highlight-color: transparent;
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
		/* The menu grows out of the pen button below it. */
		transform-origin: bottom center;
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
		/* White fades out from the centre to 60% of the radius, over the rainbow. */
		background:
			radial-gradient(circle closest-side, white, transparent 60%),
			conic-gradient(
			hsl(0 85% 70%),
			hsl(50 85% 68%),
			hsl(120 70% 68%),
			hsl(180 75% 68%),
			hsl(230 85% 72%),
			hsl(300 70% 72%),
			hsl(0 85% 70%)
			);
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
