import type { DrawingElement } from './elements/types';
/** Serialises elements to a standalone SVG sized to fit them. */
export declare function elementsToSvg(elements: DrawingElement[]): string;
/**
 * Rebuilds elements from an SVG, in document order. Our own strokes load exactly as saved.
 * Every other top-level node goes to the importer, which flattens it into shapes.
 */
export declare function svgToElements(svgText: string): DrawingElement[];
