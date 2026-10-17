import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
const completedTasksKey = new PluginKey('akuiCompletedTasks');
/** prosemirror-history tags undo/redo transactions with this meta key (its PluginKey is "history"). */
const HISTORY_META = 'history$';
/** Tag on the transactions this plugin appends, so they are never mistaken for a user toggle. */
const MOVE_META = 'akuiCompletedTasksMove';
const isTickedItem = (node) => node.attrs.checked === true;
const isTaskItem = (node) => node.type.name === 'taskItem';
const isListNode = (node) => node.type.name === 'taskList';
/**
 * Index of the first item in the trailing run of ticked items (the completed section), or the
 * list length when there is none.
 *
 * Also the target index for a just-toggled item among its list's other items: a ticked item goes to
 * the top of the completed section, an unticked one goes to the end of the active items, and both
 * are this same index.
 */
export function completedSectionStart(itemsTicked) {
    return itemsTicked.findLastIndex((ticked) => !ticked) + 1;
}
// ---------------------------------------------------------------------------
// Moving toggled items
// ---------------------------------------------------------------------------
/**
 * Positions (in the final doc) of task items whose `checked` attribute changed.
 *
 * Tiptap's checkbox uses `setNodeMarkup`, which is a `ReplaceAroundStep` rather than an attribute
 * step, so toggles are found by comparing each task item before and after the transactions.
 * Undo/redo is skipped so undoing a tick puts the item back where it was rather than moving it again.
 */
function toggledItemPositions(transactions, oldState, newState) {
    if (transactions.some((tr) => tr.getMeta(HISTORY_META) || tr.getMeta(MOVE_META)))
        return [];
    if (!transactions.some((tr) => tr.docChanged))
        return [];
    const previousItems = [];
    oldState.doc.descendants((node, pos) => {
        if (isTaskItem(node))
            previousItems.push({ pos, checked: isTickedItem(node) });
        return true;
    });
    return previousItems.flatMap(({ pos, checked }) => {
        const mapped = transactions.reduce((current, tr) => tr.mapping.map(current, -1), pos);
        const node = newState.doc.nodeAt(mapped);
        if (!node || !isTaskItem(node) || isTickedItem(node) === checked)
            return [];
        return [mapped];
    });
}
/** Moves the task item at `itemPos` to the top (ticked) or just above (unticked) its completed section. */
function moveToggledItem(tr, itemPos, collapsed) {
    const item = tr.doc.nodeAt(itemPos);
    if (!item || !isTaskItem(item))
        return;
    const resolvedItem = tr.doc.resolve(itemPos);
    const list = resolvedItem.parent;
    const itemIndex = resolvedItem.index();
    const otherItems = list.children.filter((_, index) => index !== itemIndex);
    const targetIndex = completedSectionStart(otherItems.map(isTickedItem));
    if (targetIndex === itemIndex)
        return;
    // Remember where the cursor sat inside the item, so typing carries on in the same spot.
    const { selection } = tr;
    const itemEnd = itemPos + item.nodeSize;
    const cursorOffset = selection.empty && selection.from > itemPos && selection.from < itemEnd
        ? selection.from - itemPos
        : null;
    const insertPos = resolvedItem.start() +
        otherItems.slice(0, targetIndex).reduce((size, node) => size + node.nodeSize, 0);
    tr.delete(itemPos, itemEnd).insert(insertPos, item);
    if (cursorOffset === null)
        return;
    // A collapsed section hides the item, so typing there would edit invisible text. Put the
    // cursor at the end of the active items instead.
    const selectionAfterMove = collapsed && isTickedItem(item)
        ? TextSelection.near(tr.doc.resolve(insertPos), -1)
        : TextSelection.create(tr.doc, insertPos + cursorOffset);
    tr.setSelection(selectionAfterMove);
}
// ---------------------------------------------------------------------------
// Section header and collapsing
// ---------------------------------------------------------------------------
/** Header button for a completed section. Toggles every section in the editor. */
function createSectionToggle(count, collapsed) {
    return (view) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.contentEditable = 'false';
        button.className = 'akui-wysiwyg-completed-toggle';
        button.setAttribute('aria-expanded', String(!collapsed));
        button.textContent = `${count} completed ${count === 1 ? 'item' : 'items'}`;
        // Keep the editor's cursor where it is.
        button.addEventListener('mousedown', (event) => event.preventDefault());
        button.addEventListener('click', () => {
            const meta = { toggleCollapsed: true };
            view.dispatch(view.state.tr.setMeta(completedTasksKey, meta));
        });
        return button;
    };
}
/** True when the node at `pos` sits inside a task item, i.e. it is a nested list. */
function isNestedInListItem(doc, pos) {
    const resolved = doc.resolve(pos);
    return Array.from({ length: resolved.depth + 1 }, (_, depth) => resolved.node(depth)).some(isTaskItem);
}
/**
 * Adds a header before each top-level list's completed section, and hides the section's items when
 * collapsed. Nested lists get no header: one divider per checklist keeps sub-tasks from cluttering it.
 */
function buildDecorations(doc, collapsed) {
    const decorations = [];
    doc.descendants((node, pos) => {
        if (!isListNode(node) || isNestedInListItem(doc, pos))
            return true;
        const items = node.children;
        const sectionStart = completedSectionStart(items.map(isTickedItem));
        const completedItems = items.slice(sectionStart);
        if (!completedItems.length)
            return true;
        const itemPositions = items.reduce((positions, item, index) => [...positions, positions[index] + item.nodeSize], [pos + 1]);
        const sectionPos = itemPositions[sectionStart];
        decorations.push(Decoration.widget(sectionPos, createSectionToggle(completedItems.length, collapsed), {
            side: -1,
            ignoreSelection: true,
            stopEvent: () => true,
            key: `akui-completed-${completedItems.length}-${collapsed}`
        }));
        if (collapsed) {
            completedItems.forEach((item, index) => {
                const itemPos = itemPositions[sectionStart + index];
                decorations.push(Decoration.node(itemPos, itemPos + item.nodeSize, {
                    class: 'akui-wysiwyg-completed-hidden'
                }));
            });
        }
        return true;
    });
    return DecorationSet.create(doc, decorations);
}
/** ProseMirror plugin that groups ticked task items into a collapsible completed section. */
export function createCompletedTasksPlugin() {
    return new Plugin({
        key: completedTasksKey,
        state: {
            init: (_config, { doc }) => ({ collapsed: false, decorations: buildDecorations(doc, false) }),
            apply(tr, previous) {
                const meta = tr.getMeta(completedTasksKey);
                if (!tr.docChanged && !meta?.toggleCollapsed)
                    return previous;
                const collapsed = meta?.toggleCollapsed ? !previous.collapsed : previous.collapsed;
                return { collapsed, decorations: buildDecorations(tr.doc, collapsed) };
            }
        },
        props: {
            decorations: (state) => completedTasksKey.getState(state)?.decorations
        },
        appendTransaction(transactions, oldState, newState) {
            const positions = toggledItemPositions(transactions, oldState, newState);
            if (!positions.length)
                return null;
            const collapsed = completedTasksKey.getState(newState)?.collapsed ?? false;
            const tr = newState.tr.setMeta(MOVE_META, true);
            positions.forEach((pos) => moveToggledItem(tr, tr.mapping.map(pos), collapsed));
            return tr.docChanged ? tr : null;
        }
    });
}
