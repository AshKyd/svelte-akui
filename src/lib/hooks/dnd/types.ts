/**
 * @file
 * Shared types for the svelte-akui drag and drop layer. No runtime — the
 * coordinator lives in `manager.svelte.ts`, the primitives in
 * `dragSource.svelte.ts` / `dropTarget.svelte.ts`.
 */

export interface DragPayload<T = unknown> {
	/** Identifier describing the type of payload (e.g. 'akui-masonry-item', 'note') */
	type: string;
	/** The payload data itself */
	data: T;
	/** Optional source identifier */
	source?: string;
}

// `T` is presently unused in the body; it is kept so the public `dropTarget<T>()` /
// `<DropTarget>` generic signature stays stable. Payload callbacks take the wide
// `DragPayload` and consumers narrow `payload.data` at the call site.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface DropTargetOptions<T = unknown> {
	/** Predicate testing if the active drag payload is acceptable */
	canDrop?: (payload: DragPayload) => boolean;
	/** Callback invoked when a valid payload is dropped onto this target */
	ondrop?: (payload: DragPayload, event?: PointerEvent | DragEvent) => void;
	/** Callback invoked when a valid drag enters this target */
	ondragenter?: (payload: DragPayload) => void;
	/** Callback invoked when a drag leaves this target */
	ondragleave?: () => void;
}

export interface DragMoveDetail {
	/** Pointer client X */
	x: number;
	/** Pointer client Y */
	y: number;
	/** Pointer X offset from where the drag began */
	dx: number;
	/** Pointer Y offset from where the drag began */
	dy: number;
}

/** Reason a drag ended without a drop. */
export type DragCancelReason = 'escape' | 'pointercancel' | 'detached';

export interface DragSourceOptions<T = unknown> {
	/** Builds the payload dispatched to the DropManager when the drag begins. Required. */
	getPayload: (ctx: { element: HTMLElement }) => DragPayload<T>;
	/** CSS selector for a drag handle; the drag only starts from a descendant that matches. */
	handleSelector?: string;
	/** Blocks drag initiation while true. */
	disabled?: boolean;
	/** Touch hold duration in milliseconds before a drag begins. Defaults to 350. */
	longPressDelay?: number;
	/** Mouse pointer travel in pixels before a drag begins. Defaults to 4. */
	mouseThreshold?: number;
	/** Invoked once, immediately after the drag begins. */
	ondragstart?: () => void;
	/** Invoked on every pointer move during a drag. */
	ondragmove?: (detail: DragMoveDetail) => void;
	/** Invoked on release. `handledExternally` is true when a drop target consumed the drop. */
	ondrop?: (detail: { handledExternally: boolean; event: PointerEvent }) => void;
	/** Invoked when a drag is aborted rather than dropped. */
	oncancel?: (reason: DragCancelReason) => void;
	/** Invoked last, after any drag ends (dropped or cancelled), once state is reset. */
	ondragend?: () => void;
}
