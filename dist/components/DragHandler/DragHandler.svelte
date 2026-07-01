<script lang="ts">
	interface Props {
		/** Event handler called with movement details during drag */
		onDrag?: (detail: { deltaX: number; deltaY: number; offsetX: number; offsetY: number }) => void;
		/** Callback triggered when dragging begins */
		onDragStart?: () => void;
		/** Callback triggered when dragging finishes */
		onDragEnd?: () => void;
		/** Layout alignment of the handle. Defaults to 'vertical'. */
		orientation?: 'vertical' | 'horizontal';
		/** Externally force the visual active/dragging styling */
		active?: boolean;
		/** Custom CSS classes to add to the wrapper */
		class?: string;
	}

	let {
		onDrag,
		onDragStart,
		onDragEnd,
		orientation = 'vertical',
		active = false,
		class: className = ''
	}: Props = $props();

	const id = 'akui-drag-' + Math.random().toString(36).slice(2, 9);

	let isDragging = $state(false);
	let startX = 0;
	let startY = 0;

	function handlePointerDown(event: PointerEvent) {
		// Only handle primary button clicks
		if (event.button !== 0) return;

		event.preventDefault();
		const target = event.currentTarget as HTMLElement;
		target.setPointerCapture(event.pointerId);
		
		startX = event.clientX;
		startY = event.clientY;
		isDragging = true;
		onDragStart?.();
	}

	function handlePointerMove(event: PointerEvent) {
		if (!isDragging) return;
		
		onDrag?.({
			deltaX: event.movementX,
			deltaY: event.movementY,
			offsetX: event.clientX - startX,
			offsetY: event.clientY - startY
		});
	}

	function handlePointerUp(event: PointerEvent) {
		if (!isDragging) return;

		const target = event.currentTarget as HTMLElement;
		target.releasePointerCapture(event.pointerId);
		
		isDragging = false;
		onDragEnd?.();
	}

	function handleKeyDown(event: KeyboardEvent) {
		let deltaX = 0;
		let deltaY = 0;
		const step = 10;

		if (orientation === 'vertical') {
			if (event.key === 'ArrowLeft') {
				deltaX = -step;
			} else if (event.key === 'ArrowRight') {
				deltaX = step;
			} else {
				return;
			}
		} else {
			if (event.key === 'ArrowUp') {
				deltaY = -step;
			} else if (event.key === 'ArrowDown') {
				deltaY = step;
			} else {
				return;
			}
		}

		event.preventDefault();
		onDragStart?.();
		onDrag?.({
			deltaX,
			deltaY,
			offsetX: deltaX,
			offsetY: deltaY
		});
		onDragEnd?.();
	}
</script>

<button
	type="button"
	class="akui-drag-handler {orientation} {className}"
	class:active={active || isDragging}
	class:dragging={isDragging}
	onpointerdown={handlePointerDown}
	onpointermove={handlePointerMove}
	onpointerup={handlePointerUp}
	onpointercancel={handlePointerUp}
	onkeydown={handleKeyDown}
	aria-label="Resize"
	aria-describedby="{id}-instructions"
>
	<span id="{id}-instructions" class="akui-sr-only">
		{orientation === 'vertical' ? 'Use Left and Right arrow keys to resize' : 'Use Up and Down arrow keys to resize'}
	</span>
	<div class="akui-drag-visual-bar">
		<div class="akui-drag-knob">
			<span class="akui-drag-dot"></span>
			<span class="akui-drag-dot"></span>
			<span class="akui-drag-dot"></span>
		</div>
	</div>
</button>

<style>
	.akui-drag-handler {
		position: relative;
		user-select: none;
		touch-action: none;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background-color 0.2s ease, opacity 0.2s ease;
		background-color: transparent;
		z-index: 10;
		border: none;
		padding: 0;
		outline: none;
	}

	.akui-drag-handler:focus-visible {
		outline: 2px solid var(--akui-bg-accent, #2563eb);
		outline-offset: -2px;
	}

	/* Layout directions (Increased interactive target size to 16px) */
	.akui-drag-handler.vertical {
		width: 16px;
		height: 100%;
		cursor: col-resize;
		/* Center alignment helper */
		margin: 0 -8px;
	}

	.akui-drag-handler.horizontal {
		height: 16px;
		width: 100%;
		cursor: row-resize;
		margin: -8px 0;
	}

	/* Visual track bar - hidden by default, transitions opacity and styles */
	.akui-drag-visual-bar {
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: opacity 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
		z-index: 1;
	}

	.vertical .akui-drag-visual-bar {
		width: 2px;
		height: 100%;
		background-color: var(--akui-border-input, #e5e7eb);
	}

	.horizontal .akui-drag-visual-bar {
		height: 2px;
		width: 100%;
		background-color: var(--akui-border-input, #e5e7eb);
	}

	/* Hover and active states (fades in, retains normal gray border visual style) */
	.akui-drag-handler:hover .akui-drag-visual-bar,
	.akui-drag-handler.active .akui-drag-visual-bar {
		opacity: 1;
		background-color: var(--akui-border-input, #e5e7eb);
		box-shadow: none;
	}

	.akui-drag-handler:hover,
	.akui-drag-handler.active {
		background-color: var(--akui-bg-secondary-hover, rgba(0, 0, 0, 0.02));
	}

	/* Actively dragging (mouse down) - visual bar shifts to blue active color + glow */
	.akui-drag-handler.dragging .akui-drag-visual-bar {
		opacity: 1;
		background-color: var(--akui-bg-accent, #2563eb);
		box-shadow: 0 0 12px var(--akui-bg-accent-glow, rgba(37, 99, 235, 0.8)), 0 0 4px var(--akui-bg-accent-glow, rgba(37, 99, 235, 0.6));
	}

	/* Draggable knob affordance - hidden by default */
	.akui-drag-knob {
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--akui-bg, #ffffff);
		border: 1px solid var(--akui-border-input, #e5e7eb);
		border-radius: 6px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8);
		opacity: 0;
		transition: opacity 0.2s ease, border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
		pointer-events: none;
		z-index: 2;
	}

	.vertical .akui-drag-knob {
		width: 12px;
		height: 24px;
		flex-direction: column;
		gap: 2px;
	}

	.horizontal .akui-drag-knob {
		width: 24px;
		height: 12px;
		flex-direction: row;
		gap: 2px;
	}

	/* Knob state transitions on hover/active (normal border styling, slightly zoomed) */
	.akui-drag-handler:hover .akui-drag-knob,
	.akui-drag-handler.active .akui-drag-knob {
		opacity: 1;
		border-color: var(--akui-border-input, #e5e7eb);
		transform: scale(1.05);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8);
	}

	/* Pressed/sunken feedback during active dragging session (turns blue + sunken + blue glow) */
	.akui-drag-handler.dragging .akui-drag-knob {
		opacity: 1;
		border-color: var(--akui-bg-accent-hover, #1d4ed8);
		transform: scale(0.96);
		box-shadow: 0 0 12px rgba(37, 99, 235, 0.5), inset 0 2px 4px rgba(0, 0, 0, 0.1), var(--akui-shadow-sunken, inset 0 1px 0 rgba(0, 0, 0, 0.05)), inset 0 1px 0 rgba(255, 255, 255, 0.8);
	}

	/* Little dots on the knob */
	.akui-drag-dot {
		width: 3px;
		height: 3px;
		border-radius: 50%;
		background-color: var(--akui-fg-secondary, #9ca3af);
		transition: background-color 0.2s ease;
	}

	.akui-drag-handler:hover .akui-drag-dot,
	.akui-drag-handler.active .akui-drag-dot {
		background-color: var(--akui-fg-secondary, #9ca3af);
	}

	.akui-drag-handler.dragging .akui-drag-dot {
		background-color: var(--akui-bg-accent, #2563eb);
	}

	.akui-sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}
</style>
