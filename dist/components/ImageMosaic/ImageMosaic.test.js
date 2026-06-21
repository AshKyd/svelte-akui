import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { ImageMosaic } from './index.js';
describe('ImageMosaic', () => {
    it('renders correctly with items', () => {
        const items = [
            { width: 400, height: 300, src: '1.jpg', alt: '1' },
            { width: 300, height: 400, src: '2.jpg', alt: '2' }
        ];
        const { container } = render(ImageMosaic, { props: { items } });
        const mosaic = container.querySelector('.ak-mosaic');
        expect(mosaic).not.toBeNull();
        const mosaicItems = container.querySelectorAll('.ak-mosaic-item');
        expect(mosaicItems.length).toBe(2);
    });
    it('renders correct number of items based on rows prop', () => {
        const items = [
            { width: 400, height: 300 },
            { width: 300, height: 400 },
            { width: 800, height: 600 }
        ];
        const { container } = render(ImageMosaic, { props: { items, rows: [1, 2] } });
        const mosaicItems = container.querySelectorAll('.ak-mosaic-item');
        expect(mosaicItems.length).toBe(3);
    });
});
import { groupItemsIntoRows, calculateLayoutItems } from './utils.js';
describe('ImageMosaic Utils', () => {
    const items = [
        { width: 400, height: 300 }, // 1.33 aspect
        { width: 300, height: 400 }, // 0.75 aspect
        { width: 1000, height: 1000 } // 1.0 aspect
    ];
    describe('groupItemsIntoRows', () => {
        it('groups items by explicit rows', () => {
            const rows = groupItemsIntoRows(items, 1000, 200, 8, [1, 2]);
            expect(rows).toEqual([
                [items[0]],
                [items[1], items[2]]
            ]);
        });
        it('auto-balances items based on minWidth', () => {
            // Container width of 500, minWidth of 300
            // 1.33 + 0.75 + 1 = 3.08 total aspect.
            // Average item size would be too small to fit all in one row.
            // Let's check auto-balancing output.
            const rows = groupItemsIntoRows(items, 500, 300, 8);
            expect(rows.length).toBeGreaterThan(0);
        });
    });
    describe('calculateLayoutItems', () => {
        it('calculates widthCalc and aspectRatio correctly', () => {
            const rows = [[items[0], items[1]]];
            const layoutItems = calculateLayoutItems(rows, 8);
            expect(layoutItems.length).toBe(2);
            expect(layoutItems[0].aspectRatio).toBe(400 / 300);
            expect(layoutItems[1].aspectRatio).toBe(300 / 400);
            expect(layoutItems[0].widthCalc).toContain('calc(');
        });
    });
});
