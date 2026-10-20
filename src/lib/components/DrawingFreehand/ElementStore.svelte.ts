import { getElementKind } from './elements/registry';
import type { DrawingElement, Segment } from './elements/types';

/** An element and where it sat in the list, so undoing a removal restores its stacking order. */
interface PlacedElement {
	element: DrawingElement;
	index: number;
}

type HistoryStep =
	| { kind: 'add'; placed: PlacedElement[] }
	| { kind: 'remove'; placed: PlacedElement[] }
	/** Same id and stacking position, new geometry (moved or resized). */
	| { kind: 'replace'; before: DrawingElement; after: DrawingElement };

/**
 * The drawing's elements plus undo/redo. Knows nothing about specific element types: erasing
 * asks each element's registered kind whether it was hit.
 */
export class ElementStore {
	elements = $state.raw<DrawingElement[]>([]);
	canUndo = $state(false);
	canRedo = $state(false);

	#undoSteps: HistoryStep[] = [];
	#redoSteps: HistoryStep[] = [];

	constructor(initialElements: DrawingElement[] = []) {
		this.elements = initialElements;
	}

	/** Replaces everything (e.g. loading a saved SVG) and forgets history. */
	load(elements: DrawingElement[]) {
		this.elements = elements;
		this.#undoSteps = [];
		this.#redoSteps = [];
		this.#syncFlags();
	}

	add(element: DrawingElement) {
		const placed = [{ element, index: this.elements.length }];
		this.#insert(placed);
		this.#record({ kind: 'add', placed });
	}

	/** Removes elements by id as one undoable step. Returns how many were removed. */
	remove(ids: Iterable<string>) {
		const idSet = new Set(ids);
		const placed = this.elements.flatMap((element, index) =>
			idSet.has(element.id) ? [{ element, index }] : []
		);
		if (placed.length === 0) return 0;
		this.#delete(placed);
		this.#record({ kind: 'remove', placed });
		return placed.length;
	}

	clear() {
		this.remove(this.elements.map((element) => element.id));
	}

	get(id: string): DrawingElement | undefined {
		return this.elements.find((element) => element.id === id);
	}

	/** Swaps in a changed copy of an element (matched by id) as one undoable step. */
	replace(next: DrawingElement) {
		const before = this.get(next.id);
		if (!before) return;
		this.#swap(next);
		this.#record({ kind: 'replace', before, after: next });
	}

	/** Ids of elements the (widened) segment touches. */
	findHits(segment: Segment, radius: number): string[] {
		return this.elements
			.filter((element) => getElementKind(element.type).hitTest(element, segment, radius))
			.map((element) => element.id);
	}

	undo() {
		const step = this.#undoSteps.pop();
		if (!step) return;
		if (step.kind === 'replace') this.#swap(step.before);
		else if (step.kind === 'add') this.#delete(step.placed);
		else this.#insert(step.placed);
		this.#redoSteps.push(step);
		this.#syncFlags();
	}

	redo() {
		const step = this.#redoSteps.pop();
		if (!step) return;
		if (step.kind === 'replace') this.#swap(step.after);
		else if (step.kind === 'add') this.#insert(step.placed);
		else this.#delete(step.placed);
		this.#undoSteps.push(step);
		this.#syncFlags();
	}

	#insert(placed: PlacedElement[]) {
		// Ascending index order keeps every later index valid as earlier items go back in.
		const next = [...this.elements];
		[...placed]
			.sort((a, b) => a.index - b.index)
			.forEach(({ element, index }) => next.splice(Math.min(index, next.length), 0, element));
		this.elements = next;
	}

	#delete(placed: PlacedElement[]) {
		const ids = new Set(placed.map(({ element }) => element.id));
		this.elements = this.elements.filter((element) => !ids.has(element.id));
	}

	#swap(next: DrawingElement) {
		this.elements = this.elements.map((element) => (element.id === next.id ? next : element));
	}

	#record(step: HistoryStep) {
		this.#undoSteps.push(step);
		this.#redoSteps = [];
		this.#syncFlags();
	}

	#syncFlags() {
		this.canUndo = this.#undoSteps.length > 0;
		this.canRedo = this.#redoSteps.length > 0;
	}
}
