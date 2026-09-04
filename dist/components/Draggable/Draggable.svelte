<script lang="ts">
	/**
	 * @file
	 * Generic pointer-drag source. Wrap any element to make it draggable into global
	 * `DropTarget`s via the shared `DropManager`. Mirrors `DropTarget`: the mechanics
	 * live in `dragSource()`, this component adds the default drag visuals (cursor
	 * follow, optional scale, and a snap-back settle when the drag ends).
	 */
	import { onDestroy, type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		dragSource,
		type DragCancelReason,
		type DragMoveDetail,
		type DragPayload
	} from '../../hooks/dropManager.svelte.js';

	interface Props extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'children' | 'ondragstart' | 'ondragend' | 'ondrop' | 'oncancel'
	> {
		/** Builds the payload dispatched to the global DropManager when this element starts dragging */
		getPayload: (ctx: { element: HTMLElement }) => DragPayload;
		/** CSS selector for a drag handle inside the content; dragging only starts from a descendant match */
		handleSelector?: string;
		/** Blocks drag initiation while true */
		disabled?: boolean;
		/** Touch hold duration in ms before a drag begins. Defaults to 350. */
		longPressDelay?: number;
		/** Mouse pointer travel in px before a drag begins. Defaults to 4. */
		mouseThreshold?: number;
		/** Scale applied to the element while dragging, anchored on the grab point. Defaults to 1. */
		dragScale?: number;
		/** Fired once when a drag begins */
		ondragstart?: () => void;
		/** Fired on each pointer move during a drag, with cursor position and delta from the grab point */
		ondragmove?: (detail: DragMoveDetail) => void;
		/** Fired on release; handledExternally is true when a global drop target consumed the drop */
		ondrop?: (detail: { handledExternally: boolean; event: PointerEvent }) => void;
		/** Fired when a drag is aborted rather than dropped */
		oncancel?: (reason: DragCancelReason) => void;
		/** Fired after any drag ends, whether it dropped or cancelled */
		ondragend?: () => void;
		/** Content of the draggable; receives reactive drag state */
		children?: Snippet<[{ isDragging: boolean; delta: { x: number; y: number } }]>;
		/** Additional CSS classes */
		class?: string;
	}

	let {
		getPayload,
		handleSelector,
		disabled = false,
		longPressDelay,
		mouseThreshold,
		dragScale = 1,
		ondragstart,
		ondragmove,
		ondrop,
		oncancel,
		ondragend,
		children,
		class: className = '',
		...restProps
	}: Props = $props();

	// TEMP: lifecycle tracing while debugging drag/drop. Remove once the flow is confirmed.
	const DEBUG = true;
	const trace = (event: string, extra: Record<string, unknown> = {}) => {
		if (DEBUG) console.log('[Draggable]', JSON.stringify({ event, ...extra }));
	};

	// After a drag ends the element transitions back to its resting transform, then the
	// inline transform is dropped so the layout parent controls position again.
	let settling = $state(false);
	let settleTimer: ReturnType<typeof setTimeout> | null = null;
	// Grab point captured at drag start: `source.grabOffset` is reset to 0 before the
	// settle runs, and the scale-back needs to keep pivoting on the original grab point.
	let settleOrigin = $state<{ x: number; y: number }>({ x: 0, y: 0 });

	function beginSettle() {
		settling = true;
		if (settleTimer) clearTimeout(settleTimer);
		settleTimer = setTimeout(() => {
			settling = false;
			settleTimer = null;
			trace('settleEnd');
		}, 150);
	}

	onDestroy(() => {
		if (settleTimer) clearTimeout(settleTimer);
	});

	const source = dragSource({
		get getPayload() {
			return getPayload;
		},
		get handleSelector() {
			return handleSelector;
		},
		get disabled() {
			return disabled;
		},
		get longPressDelay() {
			return longPressDelay;
		},
		get mouseThreshold() {
			return mouseThreshold;
		},
		ondragstart: () => {
			settleOrigin = { ...source.grabOffset };
			trace('dragstart', { grabOffset: source.grabOffset });
			ondragstart?.();
		},
		get ondragmove() {
			return ondragmove;
		},
		ondrop: (detail) => {
			trace('drop', { handledExternally: detail.handledExternally });
			ondrop?.(detail);
		},
		oncancel: (reason) => {
			trace('cancel', { reason });
			oncancel?.(reason);
		},
		ondragend: () => {
			trace('dragend -> settle');
			beginSettle();
			ondragend?.();
		}
	});

	// Individual style properties (not a wholesale `style=` string): the layout parent
	// (e.g. Masonry) writes `left`/`top`/`width` inline on this same element, and a full
	// `style` binding would wipe them every time the drag transform changed.
	const transformValue = $derived(
		source.isDragging
			? `translate3d(${source.delta.x}px, ${source.delta.y}px, 0) scale(${dragScale})`
			: settling
				? 'translate3d(0px, 0px, 0px) scale(1)'
				: undefined
	);
	const transformOriginValue = $derived(
		source.isDragging || settling ? `${settleOrigin.x}px ${settleOrigin.y}px` : undefined
	);
	const transitionValue = $derived(
		settling ? 'transform 150ms cubic-bezier(0.2, 0, 0, 1)' : undefined
	);

	$effect(() => {
		trace('isDragging', { isDragging: source.isDragging });
	});
</script>

<div
	{@attach source.attach}
	class="akui-draggable {className}"
	class:akui-draggable-enabled={!disabled}
	class:akui-draggable-dragging={source.isDragging}
	{...restProps}
	style:transform={transformValue}
	style:transform-origin={transformOriginValue}
	style:transition={transitionValue}
>
	{@render children?.({ isDragging: source.isDragging, delta: source.delta })}
</div>

<style>
	.akui-draggable {
		box-sizing: border-box;
	}
	.akui-draggable-enabled {
		/* pan-y (not none) so a plain vertical swipe still scrolls the page; the drag
		   itself is a long-press gesture and blocks scrolling via a non-passive
		   touchmove guard in dragSource() once it is actually running. */
		touch-action: pan-y;
		user-select: none;
		-webkit-user-select: none;
		-webkit-touch-callout: none;
	}
	.akui-draggable-enabled :global(a),
	.akui-draggable-enabled :global(img) {
		-webkit-user-drag: none;
	}
	.akui-draggable-dragging {
		position: relative;
		z-index: 1000;
		opacity: 0.95;
		box-shadow: var(--akui-shadow-l, 0 14px 28px rgba(0, 0, 0, 0.22));
		pointer-events: none;
		cursor: grabbing;
	}
</style>
