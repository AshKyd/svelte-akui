import type { Bounds, Point } from '../elements/types';
import { scaleAboutMatrix, type Matrix } from '../elements/matrix';

export type HandleId = 'nw' | 'ne' | 'se' | 'sw' | 'n' | 'e' | 's' | 'w';

/** Corners first, so they win over an edge handle where the two overlap on a small box. */
export const HANDLE_IDS: HandleId[] = ['nw', 'ne', 'se', 'sw', 'n', 'e', 's', 'w'];

const isCorner = (handle: HandleId) => handle.length === 2;

/** Where a handle sits on the bounds (corners, and the middle of each edge). */
export function handlePosition(handle: HandleId, bounds: Bounds): Point {
	const { minX, minY, maxX, maxY } = bounds;
	const x = handle.includes('w') ? minX : handle.includes('e') ? maxX : (minX + maxX) / 2;
	const y = handle.includes('n') ? minY : handle.includes('s') ? maxY : (minY + maxY) / 2;
	return [x, y];
}

/** The handle within `radius` of `point` (nearest wins), or undefined. */
export function findHandle(bounds: Bounds, point: Point, radius: number): HandleId | undefined {
	return HANDLE_IDS.map((handle) => {
		const [x, y] = handlePosition(handle, bounds);
		return { handle, distance: Math.hypot(x - point[0], y - point[1]) };
	})
		.filter(({ distance }) => distance <= radius)
		.sort((a, b) => a.distance - b.distance)[0]?.handle;
}

/** The handle on the far side, which stays put while this one is dragged. */
const OPPOSITE: Record<HandleId, HandleId> = {
	nw: 'se',
	se: 'nw',
	ne: 'sw',
	sw: 'ne',
	n: 's',
	s: 'n',
	e: 'w',
	w: 'e'
};

/**
 * The matrix for dragging `handle` to `pointer`, scaling about the opposite handle.
 *
 * - A corner keeps the aspect ratio: both axes use the same factor, whichever the pointer has
 *   stretched further.
 * - An edge stretches only the axis it faces.
 * - The result never flips and never shrinks below `minSize` on the scaled axes, so a shape
 *   can't be dragged to nothing or inside out.
 */
export function resizeMatrix(
	handle: HandleId,
	bounds: Bounds,
	pointer: Point,
	minSize: number
): Matrix {
	const anchor = handlePosition(OPPOSITE[handle], bounds);
	const grabbed = handlePosition(handle, bounds);
	const width = bounds.maxX - bounds.minX;
	const height = bounds.maxY - bounds.minY;

	/**
	 * Factor along one axis, or undefined when the box has no extent there (a straight line has
	 * no height to scale). The floor never forces a shape that is already tiny to grow.
	 */
	const axisFactor = (axis: 0 | 1, extent: number) =>
		extent > 0
			? Math.max(
					(pointer[axis] - anchor[axis]) / (grabbed[axis] - anchor[axis]),
					Math.min(1, minSize / extent)
				)
			: undefined;

	if (isCorner(handle)) {
		// The cursor's travel from the grabbed corner, projected onto the diagonal from the anchor,
		// is how far the corner moves. Taking the larger of the two axis ratios instead would
		// run ahead of the cursor on a wide or tall box.
		const diagonal = Math.hypot(width, height);
		if (diagonal === 0) return scaleAboutMatrix(1, 1, anchor);
		const travel =
			((pointer[0] - grabbed[0]) * (grabbed[0] - anchor[0]) +
				(pointer[1] - grabbed[1]) * (grabbed[1] - anchor[1])) /
			diagonal;
		const factor = Math.max(1 + travel / diagonal, Math.min(1, minSize / Math.max(width, height)));
		return scaleAboutMatrix(factor, factor, anchor);
	}
	const movesX = handle === 'e' || handle === 'w';
	return scaleAboutMatrix(
		movesX ? (axisFactor(0, width) ?? 1) : 1,
		movesX ? 1 : (axisFactor(1, height) ?? 1),
		anchor
	);
}
