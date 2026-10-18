/**
 * Pointer-driven "drag to reorder" for a vertical run of sibling elements.
 *
 * Shared by the `Wysiwyg` task items and the `Tree`. It owns the pointer maths only; the caller
 * draws the result. While dragging, `onUpdate` reports how far the dragged item has been pulled
 * (`offsetY`), the gap it would drop into (`slot`) and how far its siblings must slide to make room
 * (`shiftY`). The caller renders those as CSS transforms, so the real order never changes until
 * `onEnd` reports the drop and the caller reorders its data once. The siblings are already sitting
 * where they end up, so only the dragged item appears to move.
 *
 * Pointer events (not HTML5 drag and drop) are used so it works by touch too.
 */
export interface ReorderDragUpdate {
    /** How far the dragged item has been pulled from its resting place, in px (down is positive). */
    offsetY: number;
    /** Gap the item would drop into: 0 is before the first sibling, `items.length` is after the last. */
    slot: number;
    /** Height of the dragged item plus the gap beside it: how far passed siblings slide. */
    shiftY: number;
}
export interface ReorderDragOptions {
    /** Every sibling in order, including the dragged item and any that can't be moved. */
    items: readonly HTMLElement[];
    /** Index of the dragged item in `items`. */
    index: number;
    /** First slot the item may drop into. Defaults to 0. Keeps it below fixed items at the top. */
    minSlot?: number;
    /** One past the last slot the item may drop into. Defaults to `items.length`. */
    maxSlot?: number;
    /** The `pointerdown` that started the drag. */
    event: PointerEvent;
    onUpdate: (update: ReorderDragUpdate) => void;
    /** Called once on release (`slot` set) or cancel (null). Escape and `pointercancel` cancel. */
    onEnd: (result: {
        slot: number;
    } | null) => void;
    /** Return false to abandon the drag silently, e.g. when the data changed underneath it. */
    isActive?: () => boolean;
}
/**
 * The gap a dragged item would drop into, given its resting `index` and how far it has been pulled
 * (`offsetY`, down is positive). An item passes a sibling once its leading edge (bottom edge going
 * down, top edge going up) crosses that sibling's midpoint. Using the leading edge, not the
 * centre, means a clamped item at the end of the list still reaches the last slot. Capped at
 * `maxSlot` so the item can't pass into fixed items after it.
 */
export declare function dropSlotFromOffset(rects: readonly {
    top: number;
    bottom: number;
}[], index: number, offsetY: number, maxSlot: number): number;
/**
 * Index the dragged item ends up at once it is removed and re-inserted into `slot`, or null when
 * that leaves it where it is (dropping into the gap just before or after itself).
 */
export declare function reorderTargetIndex(fromIndex: number, slot: number): number | null;
/**
 * How far the sibling at `siblingIndex` slides while `index` is dragged into `slot`: up by `shiftY`
 * when the item passed over it going down, down by `shiftY` when going up, otherwise not at all.
 */
export declare function siblingShift({ siblingIndex, index, slot, shiftY }: {
    siblingIndex: number;
    index: number;
    slot: number;
    shiftY: number;
}): number;
/**
 * Starts a drag. Call it from the handle's `pointerdown`. Listens on the window until the pointer
 * is released or the drag is cancelled.
 *
 * @returns a function that abandons the drag without calling `onEnd`, or null if it can't start.
 */
export declare function startReorderDrag({ items, index, minSlot, maxSlot, event, onUpdate, onEnd, isActive }: ReorderDragOptions): (() => void) | null;
