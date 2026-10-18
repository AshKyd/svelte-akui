import { getContext, setContext, tick } from 'svelte';
import { reorderTargetIndex, siblingShift, startReorderDrag } from '../../utils/reorderDrag';
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

const CONTEXT_KEY = Symbol('akui-tree-reorder');

/**
 * Drag-to-reorder state shared by a `Tree` and its `TreeItem`s through context. The pointer maths
 * lives in `utils/reorderDrag.ts` (shared with the Wysiwyg task items). The tree's data is not
 * touched while dragging: the dragged row follows the pointer and the rows it passes slide aside
 * with CSS transforms. On drop `onReorder` is called once, and the consumer reorders its items.
 */
export class TreeReorder {
	/** The drag in progress, or null. */
	drag = $state.raw<TreeDragState | null>(null);

	#options: () => TreeReorderOptions;

	constructor(options: () => TreeReorderOptions) {
		this.#options = options;
	}

	/** Whether this item shows a drag handle. Off unless the consumer passes `onReorder`. */
	canReorder(item: TreeItemData): boolean {
		const { reorderable, onReorder } = this.#options();
		return Boolean(onReorder) && (reorderable ? reorderable(item) : true);
	}

	/** Called from a handle's `pointerdown`. */
	start({
		item,
		siblings,
		row,
		event
	}: {
		item: TreeItemData;
		siblings: TreeItemData[];
		row: HTMLElement;
		event: PointerEvent;
	}) {
		const index = siblings.indexOf(item);
		const container = row.closest('li');
		const items = Array.from(container?.parentElement?.children ?? []).filter(
			(element): element is HTMLElement => element instanceof HTMLElement
		);
		if (index < 0 || items.length !== siblings.length) return;

		// Items that can't be reordered (a fixed row at either end) stay put: the drag is kept
		// between the first and last item that can.
		const movable = siblings.flatMap((sibling, siblingIndex) =>
			this.canReorder(sibling) ? [siblingIndex] : []
		);

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
				if (to !== null) this.#options().onReorder?.({ item, from: index, to, siblings });
			}
		});
	}

	/** Latest keyboard move, worded for a screen reader. Shown in a live region by `Tree`. */
	announcement = $state('');

	/**
	 * Moves an item one place up or down from the keyboard (arrow keys on its handle). It stops at
	 * the first and last item that can be reordered, like the drag. Focus returns to the item's
	 * handle afterwards, because moving the row can drop it.
	 */
	async moveBy({
		item,
		siblings,
		row,
		delta
	}: {
		item: TreeItemData;
		siblings: TreeItemData[];
		row: HTMLElement;
		delta: -1 | 1;
	}) {
		const from = siblings.indexOf(item);
		const movable = siblings.flatMap((sibling, index) => (this.canReorder(sibling) ? [index] : []));
		const to = from + delta;
		if (from < 0 || to < Math.min(...movable) || to > Math.max(...movable)) return;

		const list = row.closest('li')?.parentElement;
		this.#options().onReorder?.({ item, from, to, siblings });
		this.announcement = `Moved ${item.label} to position ${to - Math.min(...movable) + 1} of ${movable.length}`;

		await tick();
		const handle = Array.from(list?.children ?? [])
			.find((element) => (element as HTMLElement).dataset.id === item.id)
			?.querySelector<HTMLElement>(':scope > .akui-tree-item-row > .akui-tree-handle');
		handle?.focus();
	}

	/** Transform for an item's `<li>` while a drag is under way, or undefined when it stays put. */
	transformFor(item: TreeItemData, siblings: TreeItemData[]) {
		const { drag } = this;
		if (!drag || drag.siblings !== siblings) return undefined;

		if (drag.id === item.id) return { role: 'dragged' as const, y: drag.offsetY };
		const y = siblingShift({
			siblingIndex: siblings.indexOf(item),
			index: drag.index,
			slot: drag.slot,
			shiftY: drag.shiftY
		});
		return { role: 'shifting' as const, y };
	}
}

export const setTreeReorder = (reorder: TreeReorder) => setContext(CONTEXT_KEY, reorder);
export const getTreeReorder = () => getContext<TreeReorder | undefined>(CONTEXT_KEY);
