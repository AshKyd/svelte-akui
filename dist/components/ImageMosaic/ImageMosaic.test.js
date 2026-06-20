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
        // Wait, jsdom might not evaluate our layout because clientWidth is 0
        // But in our component, if containerWidth is 0, it returns [], unless we pass rows!
        // Wait, if !containerWidth it returns [], but wait, let's check the code:
        // `if (!containerWidth || items.length === 0) return [];`
        // In tests, `clientWidth` bind often results in 0. So `containerWidth` might be 0.
        // If it's 0, it renders nothing. We should fix the component to still render items if containerWidth is 0?
        // No, if containerWidth is 0, we can't balance them, but we could just render them all in one row.
        // Let's modify ImageMosaic.svelte to have a fallback containerWidth or not return [] when rows is set.
    });
});
