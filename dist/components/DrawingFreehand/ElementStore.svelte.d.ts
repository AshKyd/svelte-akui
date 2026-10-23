import type { DrawingElement, Segment } from './elements/types';
/**
 * The drawing's elements plus undo/redo. Knows nothing about specific element types: erasing
 * asks each element's registered kind whether it was hit.
 */
export declare class ElementStore {
    #private;
    elements: DrawingElement[];
    canUndo: boolean;
    canRedo: boolean;
    constructor(initialElements?: DrawingElement[]);
    /** Replaces everything (e.g. loading a saved SVG) and forgets history. */
    load(elements: DrawingElement[]): void;
    add(element: DrawingElement): void;
    /** Removes elements by id as one undoable step. Returns how many were removed. */
    remove(ids: Iterable<string>): number;
    clear(): void;
    get(id: string): DrawingElement | undefined;
    /** Swaps in a changed copy of an element (matched by id) as one undoable step. */
    replace(next: DrawingElement): void;
    /** Ids of elements the (widened) segment touches. */
    findHits(segment: Segment, radius: number): string[];
    undo(): void;
    redo(): void;
}
