/** A point in world coordinates (or screen coordinates where stated). */
export type Point = [number, number];

export interface Segment {
	from: Point;
	to: Point;
}

export interface Bounds {
	minX: number;
	minY: number;
	maxX: number;
	maxY: number;
}

/** A pen stroke: the filled outline `getStroke` produced, as plain SVG path data. */
export interface StrokeElement {
	id: string;
	type: 'stroke';
	/** SVG path data, the only thing persisted. */
	d: string;
	/** Hex fill colour (e.g. '#e03131'). Missing means the default ink, which follows the theme. */
	colour?: string;
	/** Outline vertices recovered from `d`, used for erasing. Derived, never persisted. */
	polygon: Point[];
	bounds: Bounds;
}

/** One sampled path of an imported shape, in world coordinates, used for erasing. */
export interface Outline {
	points: Point[];
	/** True when the last point connects back to the first. */
	closed: boolean;
	/** True when the shape is painted with a fill, so the eraser can hit its inside. */
	filled: boolean;
	/** Half the stroke width in world units (0 when unstroked), added to the eraser's reach. */
	halfStroke: number;
}

/**
 * One shape imported from another SVG. `markup` is already flattened and sanitised: a single
 * node with its transform and paint spelled out, so it renders and saves as it is.
 */
export interface ImportedElement {
	id: string;
	type: 'imported';
	markup: string;
	bounds: Bounds;
	outlines: Outline[];
}

/** Everything on the canvas. Later shapes and images add members to this union. */
export type DrawingElement = StrokeElement | ImportedElement;

/**
 * One module per element type. The store, SVG document and eraser only ever talk to this
 * interface, so a new type needs no changes elsewhere.
 */
export interface ElementKind<E extends DrawingElement = DrawingElement> {
	type: E['type'];
	/** Lower-case SVG tags this kind is saved as; `fromSvgNode` is tried for nodes with these tags. */
	tagNames: string[];
	/** Standard SVG markup for one element (no fill, so the root's colour applies). */
	toSvgMarkup(element: E): string;
	/** Rebuilds an element from a saved node, or null if the node isn't usable. */
	fromSvgNode(node: Element): E | null;
	/** True when the eraser segment, widened by `radius`, touches the element. */
	hitTest(element: E, segment: Segment, radius: number): boolean;
}
