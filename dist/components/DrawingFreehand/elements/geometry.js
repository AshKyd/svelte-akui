/** Smallest bounds around `points`. Empty input gives a zero-size box at the origin. */
export function boundsOfPoints(points) {
    if (points.length === 0)
        return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    return points.reduce((bounds, [x, y]) => ({
        minX: Math.min(bounds.minX, x),
        minY: Math.min(bounds.minY, y),
        maxX: Math.max(bounds.maxX, x),
        maxY: Math.max(bounds.maxY, y)
    }), { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });
}
export const unionBounds = (boundsList) => boundsList.length === 0
    ? { minX: 0, minY: 0, maxX: 0, maxY: 0 }
    : boundsList.reduce((a, b) => ({
        minX: Math.min(a.minX, b.minX),
        minY: Math.min(a.minY, b.minY),
        maxX: Math.max(a.maxX, b.maxX),
        maxY: Math.max(a.maxY, b.maxY)
    }));
export const inflateBounds = (bounds, amount) => ({
    minX: bounds.minX - amount,
    minY: bounds.minY - amount,
    maxX: bounds.maxX + amount,
    maxY: bounds.maxY + amount
});
export const boundsOfSegment = ({ from, to }) => boundsOfPoints([from, to]);
export const boundsIntersect = (a, b) => a.minX <= b.maxX && a.maxX >= b.minX && a.minY <= b.maxY && a.maxY >= b.minY;
const cross = (ax, ay, bx, by) => ax * by - ay * bx;
/** True when two segments share at least one point. */
function segmentsCross(a, b) {
    const [ax, ay] = a.from;
    const [bx, by] = a.to;
    const [cx, cy] = b.from;
    const [dx, dy] = b.to;
    const d1 = cross(bx - ax, by - ay, cx - ax, cy - ay);
    const d2 = cross(bx - ax, by - ay, dx - ax, dy - ay);
    const d3 = cross(dx - cx, dy - cy, ax - cx, ay - cy);
    const d4 = cross(dx - cx, dy - cy, bx - cx, by - cy);
    const isCollinear = d1 === 0 && d2 === 0 && d3 === 0 && d4 === 0;
    // Collinear segments only touch when their bounds overlap.
    if (isCollinear)
        return boundsIntersect(boundsOfSegment(a), boundsOfSegment(b));
    return d1 * d2 <= 0 && d3 * d4 <= 0;
}
/** Distance from a point to a segment. */
export function pointSegmentDistance([px, py], { from, to }) {
    const [ax, ay] = from;
    const [bx, by] = to;
    const dx = bx - ax;
    const dy = by - ay;
    const lengthSquared = dx * dx + dy * dy;
    if (lengthSquared === 0)
        return Math.hypot(px - ax, py - ay);
    const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lengthSquared));
    return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}
/** Shortest distance between two segments; 0 when they cross or touch. */
export function segmentDistance(a, b) {
    if (segmentsCross(a, b))
        return 0;
    return Math.min(pointSegmentDistance(a.from, b), pointSegmentDistance(a.to, b), pointSegmentDistance(b.from, a), pointSegmentDistance(b.to, a));
}
/**
 * Nonzero-winding point-in-polygon. Matches how SVG fills the self-crossing outlines that
 * perfect-freehand produces, so "inside" here is "painted" on screen.
 */
export function pointInPolygon([px, py], polygon) {
    const winding = polygon.reduce((total, [x1, y1], index) => {
        const [x2, y2] = polygon[(index + 1) % polygon.length];
        const side = cross(x2 - x1, y2 - y1, px - x1, py - y1);
        if (y1 <= py && y2 > py && side > 0)
            return total + 1;
        if (y1 > py && y2 <= py && side < 0)
            return total - 1;
        return total;
    }, 0);
    return winding !== 0;
}
/** True when a widened segment touches a filled polygon: it crosses an edge, or ends inside. */
export function segmentTouchesPolygon(segment, polygon, radius) {
    if (polygon.length === 0)
        return false;
    if (pointInPolygon(segment.from, polygon) || pointInPolygon(segment.to, polygon))
        return true;
    return polygon.some((vertex, index) => {
        const next = polygon[(index + 1) % polygon.length];
        return segmentDistance(segment, { from: vertex, to: next }) <= radius;
    });
}
