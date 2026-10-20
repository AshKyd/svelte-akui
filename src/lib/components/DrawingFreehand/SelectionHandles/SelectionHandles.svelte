<script lang="ts">
	import type { Matrix } from '../elements/matrix';
	import type { Bounds } from '../elements/types';
	import { keyboardMatrix } from '../tools/keyboardTransform';
	import { HANDLE_IDS, handlePosition, type HandleId } from '../tools/selectionHandles';
	import { worldToScreen, type View } from '../viewTransform';

	interface Props {
		/** The selection's bounds in world units, including any drag preview. */
		bounds: Bounds;
		view: View;
		/** The handle being dragged with the pointer, kept highlighted until release. */
		activeHandle?: HandleId;
		/** Smallest a side can be made with the keyboard, in screen pixels. */
		minSizePx: number;
		/** An arrow key asked for this change; the owner applies it as one undo step. */
		ontransform: (matrix: Matrix) => void;
		/** Escape was pressed. */
		ondeselect: () => void;
	}

	let { bounds, view, activeHandle, minSizePx, ontransform, ondeselect }: Props = $props();

	/** Drawn handle size on screen. */
	const HANDLE_SIZE_PX = 10;

	const LABELS: Record<HandleId, string> = {
		nw: 'Resize from top left corner, keeping proportions',
		ne: 'Resize from top right corner, keeping proportions',
		se: 'Resize from bottom right corner, keeping proportions',
		sw: 'Resize from bottom left corner, keeping proportions',
		n: 'Stretch top edge',
		e: 'Stretch right edge',
		s: 'Stretch bottom edge',
		w: 'Stretch left edge'
	};

	const CURSORS: Record<HandleId, string> = {
		nw: 'nwse-resize',
		se: 'nwse-resize',
		ne: 'nesw-resize',
		sw: 'nesw-resize',
		n: 'ns-resize',
		s: 'ns-resize',
		e: 'ew-resize',
		w: 'ew-resize'
	};

	const box = $derived.by(() => {
		const [x1, y1] = worldToScreen(view, [bounds.minX, bounds.minY]);
		const [x2, y2] = worldToScreen(view, [bounds.maxX, bounds.maxY]);
		return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
	});

	/** Arrows transform (the focused handle decides how), Escape lets go of the selection. */
	function handleKeydown(event: KeyboardEvent, handle?: HandleId) {
		if (event.key === 'Escape') {
			event.preventDefault();
			ondeselect();
			return;
		}
		const matrix = keyboardMatrix({
			key: event.key,
			shiftKey: event.shiftKey,
			handle,
			bounds,
			scale: view.k,
			minSizePx
		});
		if (!matrix) return;
		// Stops the arrow scrolling the page.
		event.preventDefault();
		ontransform(matrix);
	}
</script>

<!-- Screen space, so handles keep one size at any zoom. Pointer drags are handled by the pointer
tool, which hit-tests in world space; the handles take pointer events only for hover and cursor. -->
<svg class="selection" role="group" aria-label="Selected element">
	<rect
		class="box"
		role="button"
		tabindex="0"
		aria-label="Selected element. Arrow keys move it, Shift for bigger steps, Delete removes it, Escape deselects."
		{...box}
		onkeydown={(event) => handleKeydown(event)}
	/>
	{#each HANDLE_IDS as handle (handle)}
		{@const [handleX, handleY] = worldToScreen(view, handlePosition(handle, bounds))}
		<rect
			class={['handle', activeHandle === handle && 'active']}
			role="button"
			tabindex="0"
			aria-label={LABELS[handle]}
			x={handleX - HANDLE_SIZE_PX / 2}
			y={handleY - HANDLE_SIZE_PX / 2}
			width={HANDLE_SIZE_PX}
			height={HANDLE_SIZE_PX}
			rx="2"
			style:cursor={CURSORS[handle]}
			onkeydown={(event) => handleKeydown(event, handle)}
		/>
	{/each}
</svg>

<style>
	.selection {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		/* Only the handles take pointer events. */
		pointer-events: none;
		overflow: visible;
	}

	.box {
		fill: none;
		stroke: var(--akui-color-blue-solid);
		stroke-width: 1;
		stroke-dasharray: 4 3;
	}

	.handle {
		fill: var(--akui-bg);
		stroke: var(--akui-color-blue-solid);
		stroke-width: 1.5;
		pointer-events: all;
		transition: fill 0.1s;
	}

	.handle:hover,
	.handle.active {
		fill: var(--akui-color-blue-solid);
	}

	.box:focus,
	.handle:focus {
		outline: none;
	}

	/* Keyboard focus only, so clicking never leaves a ring behind. */
	.handle:focus-visible {
		fill: var(--akui-color-blue-solid);
		outline: 2px solid var(--akui-color-blue-solid);
		outline-offset: 2px;
	}

	.box:focus-visible {
		stroke-width: 2;
		stroke-dasharray: none;
	}
</style>
