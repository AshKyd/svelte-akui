import { getContext, setContext } from 'svelte';
import { reorderTargetIndex, siblingShift, startReorderDrag } from '../../utils/reorderDrag';
const CONTEXT_KEY = Symbol('akui-tree-reorder');
/**
 * Drag-to-reorder state shared by a `Tree` and its `TreeItem`s through context. The pointer maths
 * lives in `utils/reorderDrag.ts` (shared with the Wysiwyg task items). The tree's data is not
 * touched while dragging: the dragged row follows the pointer and the rows it passes slide aside
 * with CSS transforms. On drop `onReorder` is called once, and the consumer reorders its items.
 */
export class TreeReorder {
    /** The drag in progress, or null. */
    drag = $state.raw(null);
    #options;
    constructor(options) {
        this.#options = options;
    }
    /** Whether this item shows a drag handle. Off unless the consumer passes `onReorder`. */
    canReorder(item) {
        const { reorderable, onReorder } = this.#options();
        return Boolean(onReorder) && (reorderable ? reorderable(item) : true);
    }
    /** Called from a handle's `pointerdown`. */
    start({ item, siblings, row, event }) {
        const index = siblings.indexOf(item);
        const container = row.closest('li');
        const items = Array.from(container?.parentElement?.children ?? []).filter((element) => element instanceof HTMLElement);
        if (index < 0 || items.length !== siblings.length)
            return;
        // Items that can't be reordered (a fixed row at either end) stay put: the drag is kept
        // between the first and last item that can.
        const movable = siblings.flatMap((sibling, siblingIndex) => this.canReorder(sibling) ? [siblingIndex] : []);
        startReorderDrag({
            items,
            index,
            minSlot: Math.min(...movable),
            maxSlot: Math.max(...movable) + 1,
            event,
            isActive: () => this.drag !== null,
            onUpdate: (update) => (this.drag = { id: item.id, index, siblings, ...update }),
            onEnd: (result) => {
                this.drag = null;
                const to = result ? reorderTargetIndex(index, result.slot) : null;
                if (to !== null)
                    this.#options().onReorder?.({ item, from: index, to, siblings });
            }
        });
    }
    /** Transform for an item's `<li>` while a drag is under way, or undefined when it stays put. */
    transformFor(item, siblings) {
        const { drag } = this;
        if (!drag || drag.siblings !== siblings)
            return undefined;
        if (drag.id === item.id)
            return { role: 'dragged', y: drag.offsetY };
        const y = siblingShift({
            siblingIndex: siblings.indexOf(item),
            index: drag.index,
            slot: drag.slot,
            shiftY: drag.shiftY
        });
        return { role: 'shifting', y };
    }
}
export const setTreeReorder = (reorder) => setContext(CONTEXT_KEY, reorder);
export const getTreeReorder = () => getContext(CONTEXT_KEY);
