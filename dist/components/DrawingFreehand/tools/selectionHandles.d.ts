import type { Bounds, Point } from '../elements/types';
import { type Matrix } from '../elements/matrix';
export type HandleId = 'nw' | 'ne' | 'se' | 'sw' | 'n' | 'e' | 's' | 'w';
/** Corners first, so they win over an edge handle where the two overlap on a small box. */
export declare const HANDLE_IDS: HandleId[];
/** Where a handle sits on the bounds (corners, and the middle of each edge). */
export declare function handlePosition(handle: HandleId, bounds: Bounds): Point;
/** The handle within `radius` of `point` (nearest wins), or undefined. */
export declare function findHandle(bounds: Bounds, point: Point, radius: number): HandleId | undefined;
/**
 * The matrix for dragging `handle` to `pointer`, scaling about the opposite handle.
 *
 * - A corner keeps the aspect ratio: both axes use the same factor, whichever the pointer has
 *   stretched further.
 * - An edge stretches only the axis it faces.
 * - The result never flips and never shrinks below `minSize` on the scaled axes, so a shape
 *   can't be dragged to nothing or inside out.
 */
export declare function resizeMatrix(handle: HandleId, bounds: Bounds, pointer: Point, minSize: number): Matrix;
