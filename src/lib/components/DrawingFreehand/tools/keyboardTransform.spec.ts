import { describe, expect, it } from 'vitest';
import { applyMatrixToBounds } from '../elements/matrix';
import { keyboardMatrix } from './keyboardTransform';

const bounds = { minX: 0, minY: 0, maxX: 100, maxY: 50 };
const base = { shiftKey: false, bounds, scale: 1, minSizePx: 8 };

describe('keyboardMatrix', () => {
	it('moves the selection by a pixel step, and by more with Shift', () => {
		expect(keyboardMatrix({ ...base, key: 'ArrowRight' })).toMatchObject({ e: 4, f: 0 });
		expect(keyboardMatrix({ ...base, key: 'ArrowUp', shiftKey: true })).toMatchObject({ e: 0, f: -40 });
	});

	it('keeps the step constant on screen at any zoom', () => {
		expect(keyboardMatrix({ ...base, key: 'ArrowLeft', scale: 2 })).toMatchObject({ e: -2 });
	});

	it('ignores other keys', () => {
		expect(keyboardMatrix({ ...base, key: 'a' })).toBeNull();
	});

	it('stretches an edge only along its own axis', () => {
		const grown = keyboardMatrix({ ...base, key: 'ArrowRight', handle: 'e' })!;
		expect(applyMatrixToBounds(grown, bounds)).toEqual({ minX: 0, minY: 0, maxX: 104, maxY: 50 });
		expect(keyboardMatrix({ ...base, key: 'ArrowDown', handle: 'e' })).toBeNull();
		expect(keyboardMatrix({ ...base, key: 'ArrowLeft', handle: 'n' })).toBeNull();
	});

	it('resizes a corner keeping the ratio', () => {
		const grown = keyboardMatrix({ ...base, key: 'ArrowRight', handle: 'se' })!;
		const { minX, maxX, minY, maxY } = applyMatrixToBounds(grown, bounds);
		expect(maxX).toBeGreaterThan(100);
		expect((maxX - minX) / (maxY - minY)).toBeCloseTo(2);
	});

	it('does not shrink a side below the minimum', () => {
		const tiny = { minX: 0, minY: 0, maxX: 9, maxY: 9 };
		const shrunk = keyboardMatrix({ ...base, bounds: tiny, key: 'ArrowLeft', handle: 'e' })!;
		expect(applyMatrixToBounds(shrunk, tiny).maxX).toBeCloseTo(8);
	});
});
