import { getStroke, type StrokeOptions } from 'perfect-freehand';
import { boundsOfPoints } from '../geometry';
import { applyMatrixToPoint, type Matrix } from '../matrix';
import type { Point, StrokeElement } from '../types';

const NUMBER = /-?\d*\.?\d+/g;

const average = (a: number, b: number) => (a + b) / 2;

/**
 * Turns `getStroke` outline points into SVG path data. From the perfect-freehand README (the
 * library doesn't export it). Only emits M, Q, T and Z, which `parseStrokePath` relies on.
 */
export function getSvgPathFromStroke(points: Point[]): string {
	if (points.length < 4) return '';

	const [a0, b0, c] = points;
	const head = `M${a0[0].toFixed(2)},${a0[1].toFixed(2)} Q${b0[0].toFixed(2)},${b0[1].toFixed(2)} ${average(b0[0], c[0]).toFixed(2)},${average(b0[1], c[1]).toFixed(2)} T`;

	const tail = points
		.slice(2, -1)
		.map((a, index) => {
			const b = points[index + 3];
			return `${average(a[0], b[0]).toFixed(2)},${average(a[1], b[1]).toFixed(2)}`;
		})
		.join(' ');

	return `${head}${tail} Z`;
}

/**
 * Recovers outline vertices from path data made by `getSvgPathFromStroke`: the start point, the
 * end of the first curve, then every `T` end point. The Q control point (second pair) is off the
 * curve, so it's skipped. These on-curve points sit slightly inside the drawn edge, which the
 * eraser radius easily covers.
 */
export function parseStrokePath(d: string): Point[] {
	const numbers = (d.match(NUMBER) ?? []).map(Number);
	const pairs =Array.from({ length: Math.floor(numbers.length / 2) }, (_, i): Point => [
		numbers[i * 2],
		numbers[i * 2 + 1]
	]);
	if (pairs.length < 3) return [];
	const [start, , firstCurveEnd, ...rest] = pairs;
	return [start, firstCurveEnd, ...rest];
}

/**
 * Maps every coordinate pair in stroke path data through `matrix`. Safe because the path only
 * has absolute M, Q, T and Z commands: an affine map takes Bézier control points to the
 * control points of the mapped curve.
 */
export function transformStrokePath(d: string, matrix: Matrix): string {
	const numbers = (d.match(NUMBER) ?? []).map(Number);
	const mapped = Array.from({ length: Math.floor(numbers.length / 2) }, (_, i) =>
		applyMatrixToPoint(matrix, [numbers[i * 2], numbers[i * 2 + 1]])
	).flat();
	let index = 0;
	return d.replace(NUMBER, () => (mapped[index++] ?? 0).toFixed(2));
}

/** Builds a stroke element from a finished set of input points, or null if it's too small to draw. */
export function buildStrokeElement(
	inputPoints: number[][],
	options: StrokeOptions,
	id: string = crypto.randomUUID(),
	colour?: string
): StrokeElement | null {
	const outline = getStroke(inputPoints, { ...options, last: true }) as Point[];
	const d = getSvgPathFromStroke(outline);
	if (!d) return null;
	return elementFromPath(d, id, colour);
}

/** Only path data from `getSvgPathFromStroke` (M, Q, T, Z and numbers) is accepted. */
const SAFE_PATH_DATA = /^[MQTZ0-9.,\s-]+$/;
const HEX_COLOUR = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/**
 * Builds a stroke element from saved path data. Saved SVGs are untrusted and the markup is
 * rendered as HTML, so path data and colour are checked rather than passed through: anything
 * unexpected rejects the stroke (path) or falls back to the default ink (colour).
 */
export function elementFromPath(d: string, id: string, colour?: string): StrokeElement | null {
	if (!SAFE_PATH_DATA.test(d)) return null;
	const polygon = parseStrokePath(d);
	if (polygon.length < 3) return null;
	return {
		id,
		type: 'stroke',
		d,
		polygon,
		bounds: boundsOfPoints(polygon),
		...(colour && HEX_COLOUR.test(colour) ? { colour } : {})
	};
}
