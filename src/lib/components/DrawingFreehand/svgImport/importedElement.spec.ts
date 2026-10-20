import { describe, it, expect } from 'vitest';
import { scaleAboutMatrix, translateMatrix } from '../elements/matrix';
import type { ImportedElement, Outline } from '../elements/types';
import { importedKind } from './importedElement';

/** Bounds are inflated by the widest stroke, as `importSvg` does, so the broad phase can't miss it. */
const elementOf = (...outlines: Outline[]): ImportedElement => {
	const points = outlines.flatMap((outline) => outline.points);
	const stroke = Math.max(...outlines.map((outline) => outline.halfStroke));
	return {
		id: 'a',
		type: 'imported',
		markup: '<path/>',
		bounds: {
			minX: Math.min(...points.map(([x]) => x)) - stroke,
			minY: Math.min(...points.map(([, y]) => y)) - stroke,
			maxX: Math.max(...points.map(([x]) => x)) + stroke,
			maxY: Math.max(...points.map(([, y]) => y)) + stroke
		},
		outlines
	};
};

const square: Outline['points'] = [
	[0, 0],
	[100, 0],
	[100, 100],
	[0, 100]
];

describe('importedKind.hitTest', () => {
	it('hits the edge of a stroked shape but not its empty middle', () => {
		const stroked = elementOf({ points: square, closed: true, filled: false, halfStroke: 1 });
		expect(importedKind.hitTest(stroked, { from: [50, -10], to: [50, 10] }, 2)).toBe(true);
		expect(importedKind.hitTest(stroked, { from: [40, 40], to: [60, 60] }, 2)).toBe(false);
	});

	it('hits anywhere inside a filled shape', () => {
		const filled = elementOf({ points: square, closed: true, filled: true, halfStroke: 0 });
		expect(importedKind.hitTest(filled, { from: [40, 40], to: [60, 60] }, 2)).toBe(true);
		expect(importedKind.hitTest(filled, { from: [200, 200], to: [220, 220] }, 2)).toBe(false);
	});

	it('widens the reach by the stroke, and closes the outline only when closed', () => {
		const open = elementOf({ points: square, closed: false, filled: false, halfStroke: 0 });
		const closed = elementOf({ points: square, closed: true, filled: false, halfStroke: 0 });
		// The open outline has no left edge, the closed one does.
		expect(importedKind.hitTest(open, { from: [-5, 50], to: [5, 50] }, 1)).toBe(false);
		expect(importedKind.hitTest(closed, { from: [-5, 50], to: [5, 50] }, 1)).toBe(true);

		const thick = elementOf({ points: square, closed: true, filled: false, halfStroke: 8 });
		expect(importedKind.hitTest(thick, { from: [-9, 50], to: [-7, 50] }, 1)).toBe(true);
	});

	it('hits a single-point outline', () => {
		const dot = elementOf({ points: [[10, 10]], closed: false, filled: false, halfStroke: 2 });
		expect(importedKind.hitTest(dot, { from: [11, 10], to: [12, 10] }, 1)).toBe(true);
	});

	it('moves its hit data, bounds and markup with a transform', () => {
		const filled = elementOf({ points: square, closed: true, filled: true, halfStroke: 1 });
		const moved = importedKind.transform(filled, translateMatrix(500, 0));

		expect(moved.markup).toBe('<path transform="matrix(1 0 0 1 500 0)"/>');
		expect(moved.bounds.minX).toBe(499);
		expect(importedKind.hitTest(moved, { from: [540, 40], to: [560, 60] }, 2)).toBe(true);
		expect(importedKind.hitTest(moved, { from: [40, 40], to: [60, 60] }, 2)).toBe(false);
	});

	it('puts the new matrix outside an existing transform and scales the stroke reach', () => {
		const element = {
			...elementOf({ points: square, closed: true, filled: false, halfStroke: 2 }),
			markup: '<rect transform="matrix(1 0 0 1 5 5)" stroke-width="4"/>'
		};
		const scaled = importedKind.transform(element, scaleAboutMatrix(3, 3, [0, 0]));

		expect(scaled.markup).toBe(
			'<rect transform="matrix(3 0 0 3 0 0) matrix(1 0 0 1 5 5)" stroke-width="4"/>'
		);
		expect(scaled.outlines[0].halfStroke).toBe(6);
		expect(scaled.outlines[0].points[2]).toEqual([300, 300]);
	});

	it('is the same markup out as in', () => {
		expect(
			importedKind.toSvgMarkup(
				elementOf({ points: square, closed: true, filled: false, halfStroke: 0 })
			)
		).toBe('<path/>');
	});
});
