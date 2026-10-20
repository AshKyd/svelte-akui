import {
	boundsIntersect,
	boundsOfSegment,
	inflateBounds,
	pointInPolygon,
	segmentDistance
} from '../elements/geometry';
import {
	applyMatrixToBounds,
	applyMatrixToPoint,
	matrixToSvg,
	meanScale,
	type Matrix
} from '../elements/matrix';
import type { ElementKind, ImportedElement, Outline, Segment } from '../elements/types';

/** True when the eraser segment, widened by `radius`, reaches this outline. */
function outlineTouchesSegment(outline: Outline, segment: Segment, radius: number): boolean {
	const { points, closed, filled, halfStroke } = outline;
	if (points.length === 0) return false;

	// A fill is hit anywhere inside, not just along its edge.
	if (filled && (pointInPolygon(segment.from, points) || pointInPolygon(segment.to, points))) {
		return true;
	}

	const reach = radius + halfStroke;
	const edgeCount = closed ? points.length : points.length - 1;
	// A single point has no edges, so it is tested as a zero-length one.
	if (edgeCount < 1) return segmentDistance(segment, { from: points[0], to: points[0] }) <= reach;

	return Array.from({ length: edgeCount }, (_, index) => ({
		from: points[index],
		to: points[(index + 1) % points.length]
	})).some((edge) => segmentDistance(segment, edge) <= reach);
}

const TRANSFORM_ATTRIBUTE = /(\stransform=")([^"]*)"/;

/**
 * Adds `matrix` on the outside of the node's own transform. A transform list is applied
 * right to left, so putting ours first runs it last, in world coordinates. `outerHTML` always
 * quotes attributes with double quotes.
 */
function prependTransform(markup: string, matrix: Matrix): string {
	const prefix = matrixToSvg(matrix);
	if (TRANSFORM_ATTRIBUTE.test(markup)) {
		return markup.replace(TRANSFORM_ATTRIBUTE, (_, start, existing) => `${start}${prefix} ${existing}"`);
	}
	return markup.replace(/^<([a-z]+)/i, `<$1 transform="${prefix}"`);
}

/**
 * A shape from another SVG. These are never built from a single node: they need their
 * ancestors' transforms and paint, so `importSvg` creates them for a whole document.
 */
export const importedKind: ElementKind<ImportedElement> = {
	type: 'imported',
	tagNames: ['g', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon'],

	toSvgMarkup: ({ markup }) => markup,

	fromSvgNode: () => null,

	hitTest(element, segment, radius) {
		const reach = inflateBounds(boundsOfSegment(segment), radius);
		if (!boundsIntersect(reach, element.bounds)) return false;
		return element.outlines.some((outline) => outlineTouchesSegment(outline, segment, radius));
	},

	transform(element, matrix) {
		const scale = meanScale(matrix);
		return {
			...element,
			markup: prependTransform(element.markup, matrix),
			bounds: applyMatrixToBounds(matrix, element.bounds),
			outlines: element.outlines.map((outline) => ({
				...outline,
				points: outline.points.map((point) => applyMatrixToPoint(matrix, point)),
				halfStroke: outline.halfStroke * scale
			}))
		};
	}
};
