import { describe, expect, it } from 'vitest';
import { applyMatrixToBounds, applyMatrixToPoint } from '../elements/matrix';
import { findHandle, handlePosition, resizeMatrix } from './selectionHandles';

const box = { minX: 10, minY: 20, maxX: 110, maxY: 70 }; // 100 x 50

describe('handlePosition and findHandle', () => {
	it('places corners and edge midpoints', () => {
		expect(handlePosition('nw', box)).toEqual([10, 20]);
		expect(handlePosition('se', box)).toEqual([110, 70]);
		expect(handlePosition('n', box)).toEqual([60, 20]);
		expect(handlePosition('w', box)).toEqual([10, 45]);
	});

	it('finds the nearest handle in reach, and none outside it', () => {
		expect(findHandle(box, [12, 22], 5)).toBe('nw');
		expect(findHandle(box, [60, 22], 5)).toBe('n');
		expect(findHandle(box, [60, 45], 5)).toBeUndefined();
	});
});

describe('resizeMatrix', () => {
	it('scales a corner uniformly, following the cursor along the diagonal', () => {
		// Dragging se along its own diagonal (100x50 box) doubles the box exactly.
		const onDiagonal = resizeMatrix('se', box, [210, 120], 1);
		expect(applyMatrixToBounds(onDiagonal, box)).toEqual({
			minX: 10,
			minY: 20,
			maxX: 210,
			maxY: 120
		});

		// A sideways drag only counts for its share along the diagonal, so the corner doesn't
		// run ahead of the cursor: +10 in y moves the corner by less than 10 along y.
		const sideways = resizeMatrix('se', box, [110, 80], 1);
		const resized = applyMatrixToBounds(sideways, box);
		expect(resized.maxY - 70).toBeLessThan(10);
		expect((resized.maxX - resized.minX) / (resized.maxY - resized.minY)).toBeCloseTo(2);
	});

	it('keeps the anchor corner fixed for a north-west drag', () => {
		const matrix = resizeMatrix('nw', box, [60, 45], 1);
		expect(applyMatrixToPoint(matrix, [110, 70])).toEqual([110, 70]);
		expect(applyMatrixToPoint(matrix, [10, 20])).toEqual([60, 45]);
	});

	it('stretches an edge on one axis only', () => {
		const matrix = resizeMatrix('e', box, [210, 999], 1);
		expect(applyMatrixToBounds(matrix, box)).toEqual({ minX: 10, minY: 20, maxX: 210, maxY: 70 });

		const vertical = resizeMatrix('s', box, [999, 120], 1);
		expect(applyMatrixToBounds(vertical, box)).toEqual({ minX: 10, minY: 20, maxX: 110, maxY: 120 });
	});

	it('never flips or collapses below the minimum size', () => {
		const dragged = resizeMatrix('e', box, [-500, 45], 8);
		const { minX, maxX } = applyMatrixToBounds(dragged, box);
		expect(maxX - minX).toBeCloseTo(8);
		expect(minX).toBe(10);
	});

	it('resizes a flat shape from a corner using its one real axis', () => {
		const line = { minX: 0, minY: 5, maxX: 100, maxY: 5 };
		const matrix = resizeMatrix('se', line, [50, 5], 1);
		expect(matrix.a).toBeCloseTo(0.5);
		expect(matrix.d).toBeCloseTo(0.5);
	});
});
