import { getElementKind } from './elements/registry';
/**
 * The drawing's elements plus undo/redo. Knows nothing about specific element types: erasing
 * asks each element's registered kind whether it was hit.
 */
export class ElementStore {
    elements = $state.raw([]);
    canUndo = $state(false);
    canRedo = $state(false);
    #undoSteps = [];
    #redoSteps = [];
    constructor(initialElements = []) {
        this.elements = initialElements;
    }
    /** Replaces everything (e.g. loading a saved SVG) and forgets history. */
    load(elements) {
        this.elements = elements;
        this.#undoSteps = [];
        this.#redoSteps = [];
        this.#syncFlags();
    }
    add(element) {
        const placed = [{ element, index: this.elements.length }];
        this.#insert(placed);
        this.#record({ kind: 'add', placed });
    }
    /** Removes elements by id as one undoable step. Returns how many were removed. */
    remove(ids) {
        const idSet = new Set(ids);
        const placed = this.elements.flatMap((element, index) => idSet.has(element.id) ? [{ element, index }] : []);
        if (placed.length === 0)
            return 0;
        this.#delete(placed);
        this.#record({ kind: 'remove', placed });
        return placed.length;
    }
    clear() {
        this.remove(this.elements.map((element) => element.id));
    }
    /** Ids of elements the (widened) segment touches. */
    findHits(segment, radius) {
        return this.elements
            .filter((element) => getElementKind(element.type).hitTest(element, segment, radius))
            .map((element) => element.id);
    }
    undo() {
        const step = this.#undoSteps.pop();
        if (!step)
            return;
        if (step.kind === 'add')
            this.#delete(step.placed);
        else
            this.#insert(step.placed);
        this.#redoSteps.push(step);
        this.#syncFlags();
    }
    redo() {
        const step = this.#redoSteps.pop();
        if (!step)
            return;
        if (step.kind === 'add')
            this.#insert(step.placed);
        else
            this.#delete(step.placed);
        this.#undoSteps.push(step);
        this.#syncFlags();
    }
    #insert(placed) {
        // Ascending index order keeps every later index valid as earlier items go back in.
        const next = [...this.elements];
        [...placed]
            .sort((a, b) => a.index - b.index)
            .forEach(({ element, index }) => next.splice(Math.min(index, next.length), 0, element));
        this.elements = next;
    }
    #delete(placed) {
        const ids = new Set(placed.map(({ element }) => element.id));
        this.elements = this.elements.filter((element) => !ids.has(element.id));
    }
    #record(step) {
        this.#undoSteps.push(step);
        this.#redoSteps = [];
        this.#syncFlags();
    }
    #syncFlags() {
        this.canUndo = this.#undoSteps.length > 0;
        this.canRedo = this.#redoSteps.length > 0;
    }
}
