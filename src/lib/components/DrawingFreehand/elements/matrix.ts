import type { Bounds, Point } from './types';

/** An SVG affine matrix, in the order of `matrix(a b c d e f)`. */
export interface Matrix {
	a: number;
	b: number;
	c: number;
	d: number;
	e: number;
	f: number;
}

export const IDENTITY_MATRIX: Matrix = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };

export const isIdentityMatrix = (matrix: Matrix) =>
	(Object.keys(IDENTITY_MATRIX) as (keyof Matrix)[]).every(
		(key) => matrix[key] === IDENTITY_MATRIX[key]
	);

export const translateMatrix = (dx: number, dy: number): Matrix => ({
	...IDENTITY_MATRIX,
	e: dx,
	f: dy
});

/** Scales by `sx`, `sy` while keeping `origin` where it is. */
export const scaleAboutMatrix = (sx: number, sy: number, [ox, oy]: Point): Matrix => ({
	a: sx,
	b: 0,
	c: 0,
	d: sy,
	e: ox - ox * sx,
	f: oy - oy * sy
});

export const applyMatrixToPoint = ({ a, b, c, d, e, f }: Matrix, [x, y]: Point): Point => [
	a * x + c * y + e,
	b * x + d * y + f
];

/** Bounds of the four mapped corners, so it stays correct if a matrix ever rotates. */
export function applyMatrixToBounds(matrix: Matrix, { minX, minY, maxX, maxY }: Bounds): Bounds {
	const corners = ([[minX, minY], [maxX, minY], [maxX, maxY], [minX, maxY]] as Point[]).map(
		(corner) => applyMatrixToPoint(matrix, corner)
	);
	const xs = corners.map(([x]) => x);
	const ys = corners.map(([, y]) => y);
	return {
		minX: Math.min(...xs),
		minY: Math.min(...ys),
		maxX: Math.max(...xs),
		maxY: Math.max(...ys)
	};
}

/** Average scale factor, used to resize widths that have no direction (e.g. half a stroke width). */
export const meanScale = ({ a, b, c, d }: Matrix) => (Math.hypot(a, b) + Math.hypot(c, d)) / 2;

/** Fine enough that markup and the mapped hit data agree to well under a pixel on large shapes. */
const round = (n: number) => Math.round(n * 1e6) / 1e6;

export const matrixToSvg = ({ a, b, c, d, e, f }: Matrix) =>
	`matrix(${[a, b, c, d, e, f].map(round).join(' ')})`;
