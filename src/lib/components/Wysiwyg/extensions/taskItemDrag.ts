import { Plugin, PluginKey, TextSelection, type EditorState } from '@tiptap/pm/state';
import { Decoration, DecorationSet, type EditorView } from '@tiptap/pm/view';
import type { Node as ProseNode } from '@tiptap/pm/model';
import { completedSectionStart } from '../completedTasks';

/**
 * Drag to reorder task items.
 *
 * The handle in `TaskItemView` calls `beginTaskItemDrag`. Pointer events (not HTML5 drag and drop)
 * are used so it works by touch too.
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

interface DragMeta {
	drag: DragState | null;
}

const taskItemDragKey = new PluginKey<DragState | null>('akuiTaskItemDrag');

/** Class on the task item holding the cursor, so its drag handle shows. */
export const ACTIVE_ITEM_CLASS = 'akui-task-active';
const DRAGGING_CLASS = 'akui-task-dragging';
/** Siblings of the dragged item: styled to animate their slide. */
const SHIFTING_CLASS = 'akui-task-shifting';

/** Distance from a scroll container's edge at which dragging scrolls it. */
const AUTOSCROLL_EDGE_PX = 40;
const AUTOSCROLL_STEP_PX = 14;

const isTaskItem = (node: ProseNode) => node.type.name === 'taskItem';
const isTicked = (node: ProseNode) => node.attrs.checked === true;

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

/**
 * The gap a dragged item would drop into, given its resting `index` and how far it has been pulled
 * (`offsetY`, down is positive). An item passes a sibling once its leading edge (bottom edge going
 * down, top edge going up) crosses that sibling's midpoint. Using the leading edge, not the
 * centre, means a clamped item at the end of the list still reaches the last slot. Capped at
 * `maxSlot` so the item can't pass into the completed section.
 */
export function dropSlotFromOffset(
	rects: readonly { top: number; bottom: number }[],
	index: number,
	offsetY: number,
	maxSlot: number
): number {
	const midpoint = ({ top, bottom }: { top: number; bottom: number }) => (top + bottom) / 2;
	const own = rects[index];
	if (offsetY >= 0) {
		const leadingEdge = own.bottom + offsetY;
		const passed = rects.filter((rect, k) => k > index && midpoint(rect) < leadingEdge).length;
		return Math.min(index + 1 + passed, maxSlot);
	}
	const leadingEdge = own.top + offsetY;
	return rects.filter((rect, k) => k < index && midpoint(rect) < leadingEdge).length;
}

/**
 * Index the dragged item ends up at once it is removed and re-inserted into `slot`, or null when
 * that leaves it where it is (dropping into the gap just before or after itself).
 */
export function reorderTargetIndex(fromIndex: number, slot: number): number | null {
	if (slot === fromIndex || slot === fromIndex + 1) return null;
	return slot > fromIndex ? slot - 1 : slot;
}

// ---------------------------------------------------------------------------
// Document lookups
// ---------------------------------------------------------------------------

/** The dragged item's list, its position among the siblings, and where each sibling starts. */
function describeSiblings(doc: ProseNode, itemPos: number) {
	const item = doc.nodeAt(itemPos);
	if (!item || !isTaskItem(item)) return null;

	const resolved = doc.resolve(itemPos);
	const list = resolved.parent;
	const siblingPositions = list.children.reduce<number[]>(
		(positions, sibling, index) => [...positions, positions[index] + sibling.nodeSize],
		[resolved.start()]
	);
	return { item, list, index: resolved.index(), siblingPositions };
}

/**
 * Ends the drag in one transaction: clears the drag state and, when `slot` is given and differs
 * from the item's place, moves the item there. One transaction means one undo step.
 */
function endDrag(view: EditorView, itemPos: number, slot: number | null) {
	const tr = view.state.tr.setMeta(taskItemDragKey, { drag: null } satisfies DragMeta);
	const siblings = describeSiblings(view.state.doc, itemPos);
	const targetIndex = siblings && slot !== null ? reorderTargetIndex(siblings.index, slot) : null;

	if (siblings && targetIndex !== null) {
		const { item, list, index, siblingPositions } = siblings;
		const others = list.children.filter((_, otherIndex) => otherIndex !== index);
		const insertPos =
			siblingPositions[0] +
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

// ---------------------------------------------------------------------------
// Pointer handling
// ---------------------------------------------------------------------------

function nearestScrollContainer(element: HTMLElement): HTMLElement | null {
	for (let current = element.parentElement; current; current = current.parentElement) {
		const { overflowY } = getComputedStyle(current);
		if (/(auto|scroll)/.test(overflowY) && current.scrollHeight > current.clientHeight) {
			return current;
		}
	}
	return null;
}

const setDrag = (view: EditorView, drag: DragState | null) => {
	const meta: DragMeta = { drag };
	view.dispatch(view.state.tr.setMeta(taskItemDragKey, meta));
};

/**
 * Starts dragging the task item at `itemPos`. Call it from the handle's `pointerdown`. Listens on
 * the window until the pointer is released, the drag is cancelled, or the document changes.
 */
export function beginTaskItemDrag({
	view,
	itemPos,
	event
}: {
	view: EditorView;
	itemPos: number;
	event: PointerEvent;
}) {
	const initial = describeSiblings(view.state.doc, itemPos);
	if (!view.editable || !initial || isTicked(initial.item)) return;
	event.preventDefault();

	const scrollContainer = nearestScrollContainer(view.dom);
	const scrollOffset = () => (scrollContainer ? scrollContainer.scrollTop : window.scrollY);

	// Measure once, before anything moves: transforms during the drag would skew later readings.
	// Positions are in document coordinates (client + scroll) so autoscrolling doesn't shift them.
	const rects = initial.siblingPositions
		.slice(0, -1)
		.map((pos) => (view.nodeDOM(pos) as HTMLElement | null)?.getBoundingClientRect())
		.filter((rect): rect is DOMRect => Boolean(rect))
		.map(({ top, bottom }) => ({ top: top + scrollOffset(), bottom: bottom + scrollOffset() }));
	const { index } = initial;
	const own = rects[index];
	if (!own || rects.length !== initial.list.childCount) return;

	const maxSlot = completedSectionStart(initial.list.children.map(isTicked));
	// The item stays within its list's active items: from the first one to the last unticked one.
	const minOffset = rects[0].top - own.top;
	const maxOffset = rects[maxSlot - 1].bottom - own.bottom;
	// Siblings slide by the item's height plus the gap between active items. Measure that gap
	// against the previous item, or the next one if it is active. Never the first completed item:
	// the "completed" header sits between them, which would add a phantom item's worth of space.
	const neighbourGap = rects[index - 1]
		? own.top - rects[index - 1].bottom
		: index + 1 < maxSlot
			? rects[index + 1].top - own.bottom
			: 0;
	const shiftY = own.bottom - own.top + neighbourGap;
	const startY = event.clientY + scrollOffset();

	/** Latest slot, kept here so release doesn't depend on a dispatch having been applied. */
	let slot = index;
	let lastClientY = event.clientY;
	setDrag(view, { itemPos, slot, offsetY: 0, shiftY });

	const stillDragging = () => taskItemDragKey.getState(view.state) !== null;

	const follow = () => {
		const offsetY = Math.min(Math.max(lastClientY + scrollOffset() - startY, minOffset), maxOffset);
		slot = dropSlotFromOffset(rects, index, offsetY, maxSlot);
		setDrag(view, { itemPos, slot, offsetY, shiftY });
	};

	const onMove = (moveEvent: PointerEvent) => {
		if (!stillDragging()) return finish(false);
		lastClientY = moveEvent.clientY;

		if (scrollContainer) {
			const { top, bottom } = scrollContainer.getBoundingClientRect();
			if (lastClientY < top + AUTOSCROLL_EDGE_PX) scrollContainer.scrollBy(0, -AUTOSCROLL_STEP_PX);
			if (lastClientY > bottom - AUTOSCROLL_EDGE_PX)
				scrollContainer.scrollBy(0, AUTOSCROLL_STEP_PX);
		}
		follow();
	};

	const onKeyDown = (keyEvent: KeyboardEvent) => {
		if (keyEvent.key !== 'Escape') return;
		keyEvent.stopPropagation();
		finish(false);
	};

	const finish = (commit: boolean) => {
		window.removeEventListener('pointermove', onMove);
		window.removeEventListener('pointerup', onUp);
		window.removeEventListener('pointercancel', onCancel);
		window.removeEventListener('keydown', onKeyDown, true);
		if (stillDragging()) endDrag(view, itemPos, commit ? slot : null);
	};
	const onUp = () => finish(true);
	const onCancel = () => finish(false);

	window.addEventListener('pointermove', onMove);
	window.addEventListener('pointerup', onUp);
	window.addEventListener('pointercancel', onCancel);
	window.addEventListener('keydown', onKeyDown, true);
}

// ---------------------------------------------------------------------------
// Plugin
// ---------------------------------------------------------------------------

/** Class for the task item holding the cursor. */
function activeItemDecoration(state: EditorState): Decoration[] {
	const { $head } = state.selection;
	const depth = Array.from({ length: $head.depth + 1 }, (_, level) => level).findLast((level) =>
		isTaskItem($head.node(level))
	);
	if (depth === undefined || depth === 0) return [];
	const pos = $head.before(depth);
	return [Decoration.node(pos, pos + $head.node(depth).nodeSize, { class: ACTIVE_ITEM_CLASS })];
}

/**
 * The dragged item follows the pointer. Siblings it has passed slide the other way by its height,
 * so a gap opens at the drop slot: items below the old place move up when dragging down, and items
 * from the slot up to the old place move down when dragging up.
 */
function dragDecorations(state: EditorState, drag: DragState): Decoration[] {
	const siblings = describeSiblings(state.doc, drag.itemPos);
	if (!siblings) return [];

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
		const slidesUp = siblingIndex > index && siblingIndex < drag.slot;
		const slidesDown = siblingIndex < index && siblingIndex >= drag.slot;
		const shift = slidesUp ? -drag.shiftY : slidesDown ? drag.shiftY : 0;
		return Decoration.node(from, to, {
			class: SHIFTING_CLASS,
			style: `transform: translateY(${shift}px)`
		});
	});
}

/** ProseMirror plugin: marks the active task item and runs the drag state. */
export function createTaskItemDragPlugin() {
	return new Plugin<DragState | null>({
		key: taskItemDragKey,
		state: {
			init: () => null,
			apply(tr, previous) {
				const meta = tr.getMeta(taskItemDragKey) as DragMeta | undefined;
				if (meta) return meta.drag;
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
