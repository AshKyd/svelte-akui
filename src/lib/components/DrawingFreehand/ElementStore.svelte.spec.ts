import { describe, it, expect } from 'vitest';
import { ElementStore } from './ElementStore.svelte';
import { registerElementKind } from './elements/registry';
import type { ElementKind, Bounds, StrokeElement } from './elements/types';

/** A made-up element type, to prove the store has no stroke-specific code. */
interface DotElement {
	id: string;
	type: 'dot';
	bounds: Bounds;
}

const dotKind: ElementKind<any> = {
	type: 'dot',
	tagNames: ['circle'],
	toSvgMarkup: ({ id }: DotElement) => `<circle id="${id}"/>`,
	fromSvgNode: () => null,
	hitTest: (element: DotElement, { from }) => from[0] === element.bounds.minX
};
registerElementKind(dotKind);

const dot = (id: string, x: number): DotElement => ({
	id,
	type: 'dot',
	bounds: { minX: x, minY: 0, maxX: x, maxY: 0 }
});

const asElement = (element: DotElement) => element as unknown as StrokeElement;

describe('ElementStore', () => {
	it('adds, removes and undoes in order', () => {
		const store = new ElementStore();
		store.add(asElement(dot('a', 1)));
		store.add(asElement(dot('b', 2)));
		store.add(asElement(dot('c', 3)));

		store.remove(['a', 'c']);
		expect(store.elements.map((e) => e.id)).toEqual(['b']);

		store.undo();
		expect(store.elements.map((e) => e.id)).toEqual(['a', 'b', 'c']);

		store.redo();
		expect(store.elements.map((e) => e.id)).toEqual(['b']);
	});

	it('clears redo history after a new change and tracks flags', () => {
		const store = new ElementStore();
		store.add(asElement(dot('a', 1)));
		store.undo();
		expect(store.canRedo).toBe(true);
		store.add(asElement(dot('b', 2)));
		expect(store.canRedo).toBe(false);
		expect(store.canUndo).toBe(true);
	});

	it('finds hits through the registered kind', () => {
		const store = new ElementStore([asElement(dot('a', 1)), asElement(dot('b', 2))]);
		expect(store.findHits({ from: [2, 0], to: [2, 5] }, 1)).toEqual(['b']);
	});
});
