import type { TreeItemData } from './TreeItem.svelte';
/** What `Tree`'s `onReorder` receives when an item is dropped in a new place. */
export interface TreeReorderEvent {
    /** The item that moved. */
    item: TreeItemData;
    /** Its index among `siblings` before the move. */
    from: number;
    /** Its index among `siblings` after the move. */
    to: number;
    /** The item's siblings, in their order before the move. Includes any that can't be reordered. */
    siblings: TreeItemData[];
}
interface TreeReorderOptions {
    reorderable?: (item: TreeItemData) => boolean;
    onReorder?: (event: TreeReorderEvent) => void;
}
interface TreeDragState {
    id: string;
    index: number;
    offsetY: number;
    slot: number;
    shiftY: number;
    siblings: TreeItemData[];
}
/**
 * Drag-to-reorder state shared by a `Tree` and its `TreeItem`s through context. The pointer maths
 * lives in `utils/reorderDrag.ts` (shared with the Wysiwyg task items). The tree's data is not
 * touched while dragging: the dragged row follows the pointer and the rows it passes slide aside
 * with CSS transforms. On drop `onReorder` is called once, and the consumer reorders its items.
 */
export declare class TreeReorder {
    #private;
    /** The drag in progress, or null. */
    drag: TreeDragState | null;
    constructor(options: () => TreeReorderOptions);
    /** Whether this item shows a drag handle. Off unless the consumer passes `onReorder`. */
    canReorder(item: TreeItemData): boolean;
    /** Called from a handle's `pointerdown`. */
    start({ item, siblings, row, event }: {
        item: TreeItemData;
        siblings: TreeItemData[];
        row: HTMLElement;
        event: PointerEvent;
    }): void;
    /** Latest keyboard move, worded for a screen reader. Shown in a live region by `Tree`. */
    announcement: string;
    /**
     * Moves an item one place up or down from the keyboard (arrow keys on its handle). It stops at
     * the first and last item that can be reordered, like the drag. Focus returns to the item's
     * handle afterwards, because moving the row can drop it.
     */
    moveBy({ item, siblings, row, delta }: {
        item: TreeItemData;
        siblings: TreeItemData[];
        row: HTMLElement;
        delta: -1 | 1;
    }): Promise<void>;
    /** Transform for an item's `<li>` while a drag is under way, or undefined when it stays put. */
    transformFor(item: TreeItemData, siblings: TreeItemData[]): {
        role: "dragged";
        y: number;
    } | {
        role: "shifting";
        y: number;
    } | undefined;
}
export declare const setTreeReorder: (reorder: TreeReorder) => TreeReorder;
export declare const getTreeReorder: () => TreeReorder | undefined;
export {};
