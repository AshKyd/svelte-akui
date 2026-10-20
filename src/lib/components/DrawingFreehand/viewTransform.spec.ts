import { describe, it, expect } from 'vitest';
import { zoomAbout, screenToWorld, fitView, MAX_SCALE, IDENTITY_VIEW } from './viewTransform';

describe('zoomAbout', () => {
	it('keeps the world point under the cursor fixed', () => {
		const view = { x: 40, y: -20, k: 1.5 };
		const cursor: [number, number] = [300, 200];
		const before = screenToWorld(view, cursor);
		const after = screenToWorld(zoomAbout(view, cursor, 2.2), cursor);
		expect(after[0]).toBeCloseTo(before[0]);
		expect(after[1]).toBeCloseTo(before[1]);
	});

	it('clamps the scale and still keeps the point fixed', () => {
		const cursor: [number, number] = [100, 100];
		const zoomed = zoomAbout(IDENTITY_VIEW, cursor, 1000);
		expect(zoomed.k).toBe(MAX_SCALE);
		expect(screenToWorld(zoomed, cursor)[0]).toBeCloseTo(100);
	});
});

describe('fitView', () => {
	it('centres content in the viewport', () => {
		const view = fitView(
			{ minX: 0, minY: 0, maxX: 100, maxY: 100 },
			{ width: 200, height: 200 },
			0
		);
		expect(view.k).toBe(2);
		expect(screenToWorld(view, [100, 100])).toEqual([50, 50]);
	});

	it('falls back to the identity view without content', () => {
		expect(fitView(null, { width: 100, height: 100 })).toEqual(IDENTITY_VIEW);
	});
});
