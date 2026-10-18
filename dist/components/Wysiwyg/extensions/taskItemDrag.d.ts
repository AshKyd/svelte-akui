import { Plugin } from '@tiptap/pm/state';
import { type EditorView } from '@tiptap/pm/view';
/**
 * Drag to reorder task items.
 *
 * The handle in `TaskItemView` calls `beginTaskItemDrag`. The pointer maths is shared with the
 * `Tree` (see `utils/reorderDrag.ts`); this file draws it and applies the result.
 *
 * The document only changes on drop. While dragging, the item follows the pointer and its siblings
 * slide out of the way, all with CSS transforms from node decorations (the DOM is never touched
 * directly). On drop, one transaction reorders the item. The siblings are already sitting where
 * they end up, so only the dragged item appears to move.
 *
 * Items only move within their own list. Ticked items are not dragged, and nothing can be dropped
 * into the completed section: its order is decided by ticking (see `completedTasks`).
 */
interface DragState {
    /** Position of the dragged task item. */
    itemPos: number;
    /** Gap the item would drop into: 0 is before the first sibling, `siblings.length` is after the last. */
    slot: number;
    /** How far the dragged item has been pulled from its resting place, in px (down is positive). */
    offsetY: number;
    /** Height of the dragged item plus the gap after it: how far siblings slide to make room. */
    shiftY: number;
}
/** Class on the task item holding the cursor, so its drag handle shows. */
export declare const ACTIVE_ITEM_CLASS = "akui-task-active";
/**
 * Starts dragging the task item at `itemPos`. Call it from the handle's `pointerdown`. The drag
 * ends on release, on Escape, or when the document changes underneath it (a sync, say).
 */
export declare function beginTaskItemDrag({ view, itemPos, event }: {
    view: EditorView;
    itemPos: number;
    event: PointerEvent;
}): void;
/** ProseMirror plugin: marks the active task item and runs the drag state. */
export declare function createTaskItemDragPlugin(): Plugin<DragState | null>;
export {};
