import { type StrokeOptions } from 'perfect-freehand';
import type { Point, StrokeElement } from '../types';
/**
 * Turns `getStroke` outline points into SVG path data. From the perfect-freehand README (the
 * library doesn't export it). Only emits M, Q, T and Z, which `parseStrokePath` relies on.
 */
export declare function getSvgPathFromStroke(points: Point[]): string;
/**
 * Recovers outline vertices from path data made by `getSvgPathFromStroke`: the start point, the
 * end of the first curve, then every `T` end point. The Q control point (second pair) is off the
 * curve, so it's skipped. These on-curve points sit slightly inside the drawn edge, which the
 * eraser radius easily covers.
 */
export declare function parseStrokePath(d: string): Point[];
/** Builds a stroke element from a finished set of input points, or null if it's too small to draw. */
export declare function buildStrokeElement(inputPoints: number[][], options: StrokeOptions, id?: string, colour?: string): StrokeElement | null;
/**
 * Builds a stroke element from saved path data. Saved SVGs are untrusted and the markup is
 * rendered as HTML, so path data and colour are checked rather than passed through: anything
 * unexpected rejects the stroke (path) or falls back to the default ink (colour).
 */
export declare function elementFromPath(d: string, id: string, colour?: string): StrokeElement | null;
