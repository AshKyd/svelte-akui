import type { Bounds, Point, Segment } from './types';
/** Smallest bounds around `points`. Empty input gives a zero-size box at the origin. */
export declare function boundsOfPoints(points: Point[]): Bounds;
export declare const unionBounds: (boundsList: Bounds[]) => Bounds;
export declare const inflateBounds: (bounds: Bounds, amount: number) => Bounds;
export declare const boundsOfSegment: ({ from, to }: Segment) => Bounds;
export declare const boundsIntersect: (a: Bounds, b: Bounds) => boolean;
/** Distance from a point to a segment. */
export declare function pointSegmentDistance([px, py]: Point, { from, to }: Segment): number;
/** Shortest distance between two segments; 0 when they cross or touch. */
export declare function segmentDistance(a: Segment, b: Segment): number;
/**
 * Nonzero-winding point-in-polygon. Matches how SVG fills the self-crossing outlines that
 * perfect-freehand produces, so "inside" here is "painted" on screen.
 */
export declare function pointInPolygon([px, py]: Point, polygon: Point[]): boolean;
/** True when a widened segment touches a filled polygon: it crosses an edge, or ends inside. */
export declare function segmentTouchesPolygon(segment: Segment, polygon: Point[], radius: number): boolean;
