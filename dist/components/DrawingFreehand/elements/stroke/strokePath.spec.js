import { describe, it, expect } from 'vitest';
import { getSvgPathFromStroke, parseStrokePath, buildStrokeElement } from './strokePath';
import { strokeKind } from './strokeElement';
import { scaleAboutMatrix, translateMatrix } from '../matrix';
describe('parseStrokePath', () => {
    it('recovers on-curve vertices from generated path data', () => {
        const outline = [
            [0, 0],
            [10, 0],
            [20, 0],
            [30, 0],
            [40, 0]
        ];
        const d = getSvgPathFromStroke(outline);
        // Start, end of the first curve, then one T end point per remaining pair.
        expect(parseStrokePath(d)).toEqual([
            [0, 0],
            [15, 0],
            [25, 0],
            [35, 0]
        ]);
    });
    it('returns nothing for empty or tiny data', () => {
        expect(parseStrokePath('')).toEqual([]);
        expect(getSvgPathFromStroke([[0, 0]])).toBe('');
    });
});
describe('buildStrokeElement', () => {
    const input = Array.from({ length: 20 }, (_, i) => [i * 5, Math.sin(i / 3) * 10, 0.5]);
    it('builds an element with a polygon and bounds', () => {
        const element = buildStrokeElement(input, { size: 4 }, 'a');
        expect(element?.id).toBe('a');
        expect(element.polygon.length).toBeGreaterThan(3);
        expect(element.bounds.maxX).toBeGreaterThan(element.bounds.minX);
    });
    it('hits when the eraser crosses it and misses when far away', () => {
        const element = buildStrokeElement(input, { size: 4 }, 'a');
        expect(strokeKind.hitTest(element, { from: [40, -30], to: [40, 30] }, 2)).toBe(true);
        expect(strokeKind.hitTest(element, { from: [40, 100], to: [60, 100] }, 2)).toBe(false);
    });
    it('moves with its transform, so the eraser hits the new position and not the old one', () => {
        const element = buildStrokeElement(input, { size: 4 }, 'a', '#e03131');
        const moved = strokeKind.transform(element, translateMatrix(0, 200));
        expect(moved.id).toBe('a');
        expect(moved.colour).toBe('#e03131');
        expect(moved.bounds.minY).toBeCloseTo(element.bounds.minY + 200, 1);
        expect(strokeKind.hitTest(moved, { from: [40, 170], to: [40, 230] }, 2)).toBe(true);
        expect(strokeKind.hitTest(moved, { from: [40, -30], to: [40, 30] }, 2)).toBe(false);
    });
    it('scales path data, polygon and bounds together', () => {
        const element = buildStrokeElement(input, { size: 4 }, 'a');
        const scaled = strokeKind.transform(element, scaleAboutMatrix(2, 3, [0, 0]));
        expect(scaled.bounds.maxX).toBeCloseTo(element.bounds.maxX * 2, 1);
        expect(scaled.bounds.maxY).toBeCloseTo(element.bounds.maxY * 3, 1);
        expect(scaled.polygon).toHaveLength(element.polygon.length);
        expect(scaled.d).toMatch(/^M[-\d.,\s]+Q/);
    });
});
