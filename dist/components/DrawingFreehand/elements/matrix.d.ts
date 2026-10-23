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
export declare const IDENTITY_MATRIX: Matrix;
export declare const isIdentityMatrix: (matrix: Matrix) => boolean;
export declare const translateMatrix: (dx: number, dy: number) => Matrix;
/** Scales by `sx`, `sy` while keeping `origin` where it is. */
export declare const scaleAboutMatrix: (sx: number, sy: number, [ox, oy]: Point) => Matrix;
export declare const applyMatrixToPoint: ({ a, b, c, d, e, f }: Matrix, [x, y]: Point) => Point;
/** Bounds of the four mapped corners, so it stays correct if a matrix ever rotates. */
export declare function applyMatrixToBounds(matrix: Matrix, { minX, minY, maxX, maxY }: Bounds): Bounds;
/** Average scale factor, used to resize widths that have no direction (e.g. half a stroke width). */
export declare const meanScale: ({ a, b, c, d }: Matrix) => number;
export declare const matrixToSvg: ({ a, b, c, d, e, f }: Matrix) => string;
