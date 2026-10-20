import { describe, it, expect } from 'vitest';
import { segmentDistance, pointInPolygon, segmentTouchesPolygon, boundsOfPoints, unionBounds } from './geometry';
const square = [
    [0, 0],
    [10, 0],
    [10, 10],
    [0, 10]
];
describe('segmentDistance', () => {
    it('is 0 for crossing segments', () => {
        expect(segmentDistance({ from: [0, 0], to: [10, 10] }, { from: [0, 10], to: [10, 0] })).toBe(0);
    });
    it('measures the gap between parallel segments', () => {
        expect(segmentDistance({ from: [0, 0], to: [10, 0] }, { from: [0, 3], to: [10, 3] })).toBe(3);
    });
    it('is 0 for segments that touch at an end', () => {
        expect(segmentDistance({ from: [0, 0], to: [5, 0] }, { from: [5, 0], to: [5, 5] })).toBe(0);
    });
    it('handles collinear segments that do and do not overlap', () => {
        expect(segmentDistance({ from: [0, 0], to: [5, 0] }, { from: [3, 0], to: [8, 0] })).toBe(0);
        expect(segmentDistance({ from: [0, 0], to: [2, 0] }, { from: [5, 0], to: [8, 0] })).toBe(3);
    });
});
describe('pointInPolygon', () => {
    it('detects inside and outside', () => {
        expect(pointInPolygon([5, 5], square)).toBe(true);
        expect(pointInPolygon([15, 5], square)).toBe(false);
    });
});
describe('segmentTouchesPolygon', () => {
    it('hits when fully inside a thick shape', () => {
        expect(segmentTouchesPolygon({ from: [4, 4], to: [6, 6] }, square, 0)).toBe(true);
    });
    it('hits when crossing an edge', () => {
        expect(segmentTouchesPolygon({ from: [-5, 5], to: [5, 5] }, square, 0)).toBe(true);
    });
    it('hits within the radius but not beyond it', () => {
        const nearby = { from: [12, 0], to: [12, 10] };
        expect(segmentTouchesPolygon(nearby, square, 2)).toBe(true);
        expect(segmentTouchesPolygon(nearby, square, 1)).toBe(false);
    });
});
describe('bounds', () => {
    it('computes and unions bounds', () => {
        const a = boundsOfPoints([
            [1, 2],
            [3, 4]
        ]);
        expect(a).toEqual({ minX: 1, minY: 2, maxX: 3, maxY: 4 });
        expect(unionBounds([a, { minX: 0, minY: 5, maxX: 2, maxY: 6 }])).toEqual({
            minX: 0,
            minY: 2,
            maxX: 3,
            maxY: 6
        });
    });
});
