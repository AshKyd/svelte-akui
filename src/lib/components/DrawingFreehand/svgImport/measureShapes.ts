import { boundsOfPoints, inflateBounds } from '../elements/geometry';
import type { ImportedElement, Outline, Point } from '../elements/types';
import { SHAPE_TAGS, SVG_NS, type SanitisedChild } from './sanitiseSvg';

/** World units between sampled points on a curve. Small against the eraser's reach. */
const SAMPLE_SPACING = 2;
const MAX_SAMPLES_PER_OUTLINE = 400;

/** Every attribute we rewrite from the resolved style, so none of the original values leak through. */
const PAINT_ATTRIBUTES = [
	'transform',
	'fill',
	'stroke',
	'stroke-width',
	'stroke-linecap',
	'stroke-linejoin',
	'stroke-miterlimit',
	'stroke-dasharray',
	'stroke-dashoffset',
	'fill-rule',
	'opacity',
	'fill-opacity',
	'stroke-opacity',
	'display',
	'visibility'
];

interface Colour {
	r: number;
	g: number;
	b: number;
	a: number;
}

/** Reads the `rgb()` / `rgba()` form that `getComputedStyle` always resolves colours to. */
function parseColour(css: string): Colour | null {
	const match = css.match(/rgba?\(([^)]+)\)/);
	if (!match) return null;
	const [r, g, b, a = 1] = match[1]
		.split(/[\s,/]+/)
		.filter(Boolean)
		.map(Number);
	return a === 0 ? null : { r, g, b, a };
}

/**
 * Near-black, like Excalidraw's `#1e1e1e` or a plain `#000`. It becomes the theme ink so
 * imported drawings stay visible on the dark canvas instead of vanishing into it.
 */
const isInk = ({ r, g, b }: Colour) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 <= 0.14;

const toHex = ({ r, g, b }: Colour) =>
	`#${[r, g, b].map((channel) => Math.round(channel).toString(16).padStart(2, '0')).join('')}`;

const round = (n: number, places = 4) => Math.round(n * 10 ** places) / 10 ** places;

/** The paint attributes to write, from the browser's resolved style (so inheritance is applied). */
function resolvePaint(
	computed: CSSStyleDeclaration,
	effectiveOpacity: number
): Record<string, string> {
	const fill = parseColour(computed.fill);
	const stroke = parseColour(computed.stroke);
	const paint: Record<string, string> = {};

	// Ink is left unset so it inherits the root's fill, which follows the theme.
	if (!fill) paint.fill = 'none';
	else if (!isInk(fill)) paint.fill = toHex(fill);
	const fillOpacity = Number(computed.fillOpacity) * (fill?.a ?? 1);
	if (fill && fillOpacity < 1) paint['fill-opacity'] = String(round(fillOpacity));
	if (computed.fillRule === 'evenodd') paint['fill-rule'] = 'evenodd';

	if (stroke) {
		paint.stroke = isInk(stroke) ? 'currentColor' : toHex(stroke);
		paint['stroke-width'] = String(round(parseFloat(computed.strokeWidth) || 0));
		if (computed.strokeLinecap !== 'butt') paint['stroke-linecap'] = computed.strokeLinecap;
		if (computed.strokeLinejoin !== 'miter') paint['stroke-linejoin'] = computed.strokeLinejoin;
		if (computed.strokeMiterlimit !== '4') paint['stroke-miterlimit'] = computed.strokeMiterlimit;
		if (computed.strokeDasharray !== 'none') {
			paint['stroke-dasharray'] = computed.strokeDasharray.replace(/px/g, '');
		}
		if (parseFloat(computed.strokeDashoffset)) {
			paint['stroke-dashoffset'] = String(round(parseFloat(computed.strokeDashoffset)));
		}
		const strokeOpacity = Number(computed.strokeOpacity) * stroke.a;
		if (strokeOpacity < 1) paint['stroke-opacity'] = String(round(strokeOpacity));
	}

	if (effectiveOpacity < 1) paint.opacity = String(round(effectiveOpacity));
	return paint;
}

const isIdentity = (m: DOMMatrix) =>
	[m.a - 1, m.b, m.c, m.d - 1, m.e, m.f].every((value) => Math.abs(value) < 1e-6);

/** Points along a shape's outline, mapped through its transform into root coordinates. */
function samplePoints(geometry: SVGGeometryElement, matrix: DOMMatrix): Point[] {
	const total = geometry.getTotalLength();
	const count = Math.min(
		MAX_SAMPLES_PER_OUTLINE,
		Math.max(2, Math.ceil(total / SAMPLE_SPACING) + 1)
	);
	return Array.from({ length: count }, (_, index) => {
		const point = geometry.getPointAtLength((total * index) / (count - 1));
		const mapped = new DOMPoint(point.x, point.y).matrixTransform(matrix);
		return [mapped.x, mapped.y] as Point;
	});
}

const ALWAYS_CLOSED = new Set(['rect', 'circle', 'ellipse', 'polygon']);

/**
 * One outline per subpath. A path with several absolute `M` subpaths is split so no stray line
 * joins them. Relative `m` depends on where the last subpath ended, so those stay whole.
 */
function sampleOutlines(leaf: SVGGeometryElement, filled: boolean, halfStroke: number): Outline[] {
	const tag = leaf.localName;
	const d = leaf.getAttribute('d') ?? '';
	const pieces =
		tag === 'path' && !d.includes('m') ? d.split(/(?=M)/).filter((piece) => piece.trim()) : [];

	if (pieces.length > 1) {
		return pieces.flatMap((piece) => {
			// A temporary sibling with the same transform, so it is measured exactly like the original.
			const part = document.createElementNS(SVG_NS, 'path') as SVGPathElement;
			part.setAttribute('d', piece);
			const transform = leaf.getAttribute('transform');
			if (transform) part.setAttribute('transform', transform);
			leaf.parentNode?.insertBefore(part, leaf);
			const matrix = part.getCTM();
			const points = matrix ? samplePoints(part, matrix) : [];
			part.remove();
			return points.length ? [{ points, closed: /z\s*$/i.test(piece), filled, halfStroke }] : [];
		});
	}

	const matrix = leaf.getCTM();
	if (!matrix) return [];
	const closed = tag === 'path' ? /z\s*$/i.test(d) : ALWAYS_CLOSED.has(tag);
	return [{ points: samplePoints(leaf, matrix), closed, filled, halfStroke }];
}

/** Flattens one mounted shape into an element, or null if it can't be seen. */
function importShape(leaf: SVGGeometryElement, host: Element): ImportedElement | null {
	const computed = getComputedStyle(leaf);
	if (['hidden', 'collapse'].includes(computed.visibility)) return null;

	// Groups are flattened away, so their opacity multiplies down to each shape, and a hidden
	// group hides everything inside it.
	let effectiveOpacity = 1;
	for (let node: Element | null = leaf; node && node !== host; node = node.parentElement) {
		const style = getComputedStyle(node);
		if (style.display === 'none') return null;
		effectiveOpacity *= Number(style.opacity);
	}

	const matrix = leaf.getCTM();
	// No length means no geometry: a path whose `d` was missing or rejected, or a zero-size shape.
	if (!matrix || leaf.getTotalLength() <= 0) return null;

	const filled = parseColour(computed.fill) !== null;
	const stroked = parseColour(computed.stroke) !== null;
	if (!filled && !stroked) return null;

	const scaleFactor = Math.sqrt(Math.abs(matrix.a * matrix.d - matrix.b * matrix.c));
	const halfStroke = stroked ? ((parseFloat(computed.strokeWidth) || 0) * scaleFactor) / 2 : 0;
	const outlines = sampleOutlines(leaf, filled, halfStroke);
	if (outlines.length === 0) return null;

	const id = crypto.randomUUID();
	const flat = leaf.cloneNode(false) as Element;
	PAINT_ATTRIBUTES.forEach((name) => flat.removeAttribute(name));
	flat.setAttribute('id', id);
	if (!isIdentity(matrix)) {
		const { a, b, c, d, e, f } = matrix;
		flat.setAttribute('transform', `matrix(${[a, b, c, d, e, f].map((n) => round(n)).join(' ')})`);
	}
	// The stroke width is in the shape's own units, so it is scaled with the transform.
	Object.entries(resolvePaint(computed, effectiveOpacity)).forEach(([name, value]) =>
		flat.setAttribute(name, value)
	);

	const bounds = inflateBounds(
		boundsOfPoints(outlines.flatMap(({ points }) => points)),
		halfStroke
	);
	return { id, type: 'imported', markup: flat.outerHTML, bounds, outlines };
}

function collectShapes(node: Element): SVGGeometryElement[] {
	if (SHAPE_TAGS.has(node.localName)) return [node as SVGGeometryElement];
	return [...node.children].flatMap(collectShapes);
}

/**
 * Mounts the sanitised nodes in a hidden `<svg>` and has the browser resolve everything we would
 * otherwise reimplement: nested transforms, curve geometry, inherited paint. `scale` is the
 * root's width-to-viewBox scale. The host is always removed again.
 */
export function measureShapes(
	children: SanitisedChild[],
	scale: number
): Map<Element, ImportedElement[]> {
	const host = document.createElementNS(SVG_NS, 'svg');
	host.setAttribute('aria-hidden', 'true');
	// Off-screen rather than display:none or visibility:hidden, which would hide the shapes from
	// the geometry and style APIs we are about to read.
	Object.assign(host.style, {
		position: 'fixed',
		left: '-10000px',
		top: '0',
		width: '1px',
		height: '1px',
		overflow: 'hidden',
		pointerEvents: 'none',
		// `currentColor` must resolve to ink, not to whatever colour the page's text happens to be.
		color: '#000'
	});
	const scaleGroup = document.createElementNS(SVG_NS, 'g');
	scaleGroup.setAttribute('transform', `scale(${scale})`);
	children.forEach(({ node }) => scaleGroup.append(node));
	host.append(scaleGroup);
	document.body.append(host);

	try {
		return new Map(
			children.map(({ source, node }) => [
				source,
				collectShapes(node).flatMap((shape) => {
					const element = importShape(shape, host);
					return element ? [element] : [];
				})
			])
		);
	} finally {
		host.remove();
	}
}
