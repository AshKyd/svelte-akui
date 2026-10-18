import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { reorderTargetIndex, siblingShift, startReorderDrag } from '../../../utils/reorderDrag';
import { completedSectionStart } from '../completedTasks';
const taskItemDragKey = new PluginKey('akuiTaskItemDrag');
/** Class on the task item holding the cursor, so its drag handle shows. */
export const ACTIVE_ITEM_CLASS = 'akui-task-active';
const DRAGGING_CLASS = 'akui-task-dragging';
/** Siblings of the dragged item: styled to animate their slide. */
const SHIFTING_CLASS = 'akui-task-shifting';
const isTaskItem = (node) => node.type.name === 'taskItem';
const isTicked = (node) => node.attrs.checked === true;
// ---------------------------------------------------------------------------
// Document lookups
// ---------------------------------------------------------------------------
/** The dragged item's list, its position among the siblings, and where each sibling starts. */
function describeSiblings(doc, itemPos) {
    const item = doc.nodeAt(itemPos);
    if (!item || !isTaskItem(item))
        return null;
    const resolved = doc.resolve(itemPos);
    const list = resolved.parent;
    const siblingPositions = list.children.reduce((positions, sibling, index) => [...positions, positions[index] + sibling.nodeSize], [resolved.start()]);
    return { item, list, index: resolved.index(), siblingPositions };
}
/**
 * Ends the drag in one transaction: clears the drag state and, when `slot` is given and differs
 * from the item's place, moves the item there. One transaction means one undo step.
 */
function endDrag(view, itemPos, slot) {
    const tr = view.state.tr.setMeta(taskItemDragKey, { drag: null });
    const siblings = describeSiblings(view.state.doc, itemPos);
    const targetIndex = siblings && slot !== null ? reorderTargetIndex(siblings.index, slot) : null;
    if (siblings && targetIndex !== null) {
        const { item, list, index, siblingPositions } = siblings;
        const others = list.children.filter((_, otherIndex) => otherIndex !== index);
        const insertPos = siblingPositions[0] +
            others.slice(0, targetIndex).reduce((size, other) => size + other.nodeSize, 0);
        tr.delete(itemPos, itemPos + item.nodeSize).insert(insertPos, item);
        // Keep the cursor in the moved item, at the start of its text.
        tr.setSelection(TextSelection.near(tr.doc.resolve(insertPos + 2)));
        // Same tag as `completedTasks` uses for its own moves, so they are never taken for a tick.
        tr.setMeta('akuiCompletedTasksMove', true);
        tr.scrollIntoView();
    }
    view.dispatch(tr);
}
const setDrag = (view, drag) => {
    const meta = { drag };
    view.dispatch(view.state.tr.setMeta(taskItemDragKey, meta));
};
/**
 * Starts dragging the task item at `itemPos`. Call it from the handle's `pointerdown`. The drag
 * ends on release, on Escape, or when the document changes underneath it (a sync, say).
 */
export function beginTaskItemDrag({ view, itemPos, event }) {
    const initial = describeSiblings(view.state.doc, itemPos);
    if (!view.editable || !initial || isTicked(initial.item))
        return;
    const items = initial.siblingPositions
        .slice(0, -1)
        .map((pos) => view.nodeDOM(pos));
    if (items.some((item) => !item))
        return;
    startReorderDrag({
        items: items,
        index: initial.index,
        // Nothing can be dropped into the completed section after the active items.
        maxSlot: completedSectionStart(initial.list.children.map(isTicked)),
        event,
        isActive: () => taskItemDragKey.getState(view.state) !== null,
        onUpdate: (update) => setDrag(view, { itemPos, ...update }),
        onEnd: (result) => endDrag(view, itemPos, result?.slot ?? null)
    });
}
// ---------------------------------------------------------------------------
// Plugin
// ---------------------------------------------------------------------------
/** Class for the task item holding the cursor. */
function activeItemDecoration(state) {
    const { $head } = state.selection;
    const depth = Array.from({ length: $head.depth + 1 }, (_, level) => level).findLast((level) => isTaskItem($head.node(level)));
    if (depth === undefined || depth === 0)
        return [];
    const pos = $head.before(depth);
    return [Decoration.node(pos, pos + $head.node(depth).nodeSize, { class: ACTIVE_ITEM_CLASS })];
}
/**
 * The dragged item follows the pointer. Siblings it has passed slide the other way by its height,
 * so a gap opens at the drop slot.
 */
function dragDecorations(state, drag) {
    const siblings = describeSiblings(state.doc, drag.itemPos);
    if (!siblings)
        return [];
    const { list, index, siblingPositions } = siblings;
    return list.children.map((sibling, siblingIndex) => {
        const from = siblingPositions[siblingIndex];
        const to = from + sibling.nodeSize;
        if (siblingIndex === index) {
            return Decoration.node(from, to, {
                class: DRAGGING_CLASS,
                style: `transform: translateY(${drag.offsetY}px)`
            });
        }
        const shift = siblingShift({ siblingIndex, index, slot: drag.slot, shiftY: drag.shiftY });
        return Decoration.node(from, to, {
            class: SHIFTING_CLASS,
            style: `transform: translateY(${shift}px)`
        });
    });
}
/** ProseMirror plugin: marks the active task item and runs the drag state. */
export function createTaskItemDragPlugin() {
    return new Plugin({
        key: taskItemDragKey,
        state: {
            init: () => null,
            apply(tr, previous) {
                const meta = tr.getMeta(taskItemDragKey);
                if (meta)
                    return meta.drag;
                // The note changed under the drag (a sync, say), so the saved position can't be trusted.
                return tr.docChanged ? null : previous;
            }
        },
        props: {
            decorations(state) {
                const drag = taskItemDragKey.getState(state);
                return DecorationSet.create(state.doc, [
                    ...activeItemDecoration(state),
                    ...(drag ? dragDecorations(state, drag) : [])
                ]);
            }
        }
    });
}
