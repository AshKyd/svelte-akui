export const IDENTITY_MATRIX = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
export const isIdentityMatrix = (matrix) => Object.keys(IDENTITY_MATRIX).every((key) => matrix[key] === IDENTITY_MATRIX[key]);
export const translateMatrix = (dx, dy) => ({
    ...IDENTITY_MATRIX,
    e: dx,
    f: dy
});
/** Scales by `sx`, `sy` while keeping `origin` where it is. */
export const scaleAboutMatrix = (sx, sy, [ox, oy]) => ({
    a: sx,
    b: 0,
    c: 0,
    d: sy,
    e: ox - ox * sx,
    f: oy - oy * sy
});
export const applyMatrixToPoint = ({ a, b, c, d, e, f }, [x, y]) => [
    a * x + c * y + e,
    b * x + d * y + f
];
/** Bounds of the four mapped corners, so it stays correct if a matrix ever rotates. */
export function applyMatrixToBounds(matrix, { minX, minY, maxX, maxY }) {
    const corners = [[minX, minY], [maxX, minY], [maxX, maxY], [minX, maxY]].map((corner) => applyMatrixToPoint(matrix, corner));
    const xs = corners.map(([x]) => x);
    const ys = corners.map(([, y]) => y);
    return {
        minX: Math.min(...xs),
        minY: Math.min(...ys),
        maxX: Math.max(...xs),
        maxY: Math.max(...ys)
    };
}
/** Average scale factor, used to resize widths that have no direction (e.g. half a stroke width). */
export const meanScale = ({ a, b, c, d }) => (Math.hypot(a, b) + Math.hypot(c, d)) / 2;
/** Fine enough that markup and the mapped hit data agree to well under a pixel on large shapes. */
const round = (n) => Math.round(n * 1e6) / 1e6;
export const matrixToSvg = ({ a, b, c, d, e, f }) => `matrix(${[a, b, c, d, e, f].map(round).join(' ')})`;
