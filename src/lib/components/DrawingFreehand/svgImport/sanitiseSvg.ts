export const SVG_NS = 'http://www.w3.org/2000/svg';

export const SHAPE_TAGS = new Set([
	'path',
	'rect',
	'circle',
	'ellipse',
	'line',
	'polyline',
	'polygon'
]);

/** Anything not in here (style, script, use, text, image, foreignObject, defs...) is dropped with its subtree. */
const ALLOWED_TAGS = new Set([...SHAPE_TAGS, 'g']);

const NUMBER = /^\s*-?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?(?:px)?\s*$/i;
const NUMBER_LIST = /^[\d\s.,e+-]*$/i;
const PATH_DATA = /^[MmLlHhVvCcSsQqTtAaZz\d\s.,e+-]*$/i;
const TRANSFORM =
	/^(?:\s*(?:translate|scale|rotate|skewX|skewY|matrix)\s*\(\s*[-\d.,\s e+]*\)\s*,?)*\s*$/i;
/** No `url(...)`: gradients and patterns aren't supported, so those paints are dropped. */
const COLOUR = /^(?:none|currentColor|#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\)|[a-z]+)$/i;

const oneOf = (...values: string[]) => new RegExp(`^(?:${values.join('|')})$`);

/**
 * The only attributes ever kept, each with a check on its value. A value that fails is dropped,
 * so the shape still imports with that attribute's default. `class`, `style`, `id`, `href` and
 * `on*` are never in this list, which keeps CSS, scripts and external references out.
 */
const ATTRIBUTE_CHECKS: Record<string, RegExp> = {
	d: PATH_DATA,
	points: NUMBER_LIST,
	x: NUMBER,
	y: NUMBER,
	width: NUMBER,
	height: NUMBER,
	rx: NUMBER,
	ry: NUMBER,
	cx: NUMBER,
	cy: NUMBER,
	r: NUMBER,
	x1: NUMBER,
	y1: NUMBER,
	x2: NUMBER,
	y2: NUMBER,
	transform: TRANSFORM,
	fill: COLOUR,
	stroke: COLOUR,
	'stroke-width': NUMBER,
	'stroke-miterlimit': NUMBER,
	'stroke-dashoffset': NUMBER,
	'stroke-dasharray': /^(?:none|[\d\s.,e+-]*)$/i,
	'stroke-linecap': oneOf('butt', 'round', 'square'),
	'stroke-linejoin': oneOf('miter', 'round', 'bevel', 'arcs', 'miter-clip'),
	'fill-rule': oneOf('nonzero', 'evenodd'),
	opacity: NUMBER,
	'fill-opacity': NUMBER,
	'stroke-opacity': NUMBER,
	display: oneOf('none', 'inline', 'block'),
	visibility: oneOf('visible', 'hidden', 'collapse')
};

/** Guards against a hostile or enormous file locking up the tab while it is mounted and measured. */
export const MAX_NODES = 20_000;
const MAX_ATTRIBUTE_LENGTH = 500_000;

export interface SanitisedChild {
	/** The top-level node in the parsed document this came from, so callers can keep document order. */
	source: Element;
	/** A clean copy, built in the live document from allow-listed tags and attributes only. */
	node: Element;
}

/** Copies one node and its allowed descendants. Returns null for a tag that isn't allowed. */
function sanitiseNode(source: Element, budget: { remaining: number }): Element | null {
	const tag = source.localName.toLowerCase();
	if (!ALLOWED_TAGS.has(tag) || budget.remaining <= 0) return null;
	budget.remaining -= 1;

	const copy = document.createElementNS(SVG_NS, tag);
	[...source.attributes].forEach(({ name, value }) => {
		const check = ATTRIBUTE_CHECKS[name];
		if (check && value.length <= MAX_ATTRIBUTE_LENGTH && check.test(value)) {
			copy.setAttribute(name, value);
		}
	});

	if (tag === 'g') {
		[...source.children].forEach((child) => {
			const sanitised = sanitiseNode(child, budget);
			if (sanitised) copy.append(sanitised);
		});
	}
	return copy;
}

/**
 * Sanitises the top-level children of a parsed SVG root, except those `skip` says are already
 * handled. The root itself is never copied, only its children.
 */
export function sanitiseChildren(
	root: Element,
	skip: (child: Element) => boolean = () => false
): SanitisedChild[] {
	const budget = { remaining: MAX_NODES };
	return [...root.children].flatMap((source) => {
		if (skip(source)) return [];
		const node = sanitiseNode(source, budget);
		return node ? [{ source, node }] : [];
	});
}

/**
 * How much the root's `width` / `height` scales its `viewBox`. Only the scale is used: shapes
 * stay in the root's own coordinates, so a file we saved ourselves (scale 1, offset viewBox)
 * reloads exactly where it was.
 */
export function getRootScale(root: Element): number {
	const viewBox = (root.getAttribute('viewBox') ?? '')
		.trim()
		.split(/[\s,]+/)
		.map(Number);
	const [, , viewBoxWidth, viewBoxHeight] = viewBox;
	if (viewBox.length !== 4 || !(viewBoxWidth > 0) || !(viewBoxHeight > 0)) return 1;

	const readLength = (name: string) => {
		const value = root.getAttribute(name) ?? '';
		return NUMBER.test(value) ? parseFloat(value) : NaN;
	};
	const width = readLength('width');
	if (width > 0) return width / viewBoxWidth;
	const height = readLength('height');
	if (height > 0) return height / viewBoxHeight;
	return 1;
}
