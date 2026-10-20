import { boundsIntersect, boundsOfSegment, inflateBounds, pointInPolygon, segmentDistance } from '../elements/geometry';
/** True when the eraser segment, widened by `radius`, reaches this outline. */
function outlineTouchesSegment(outline, segment, radius) {
    const { points, closed, filled, halfStroke } = outline;
    if (points.length === 0)
        return false;
    // A fill is hit anywhere inside, not just along its edge.
    if (filled && (pointInPolygon(segment.from, points) || pointInPolygon(segment.to, points))) {
        return true;
    }
    const reach = radius + halfStroke;
    const edgeCount = closed ? points.length : points.length - 1;
    // A single point has no edges, so it is tested as a zero-length one.
    if (edgeCount < 1)
        return segmentDistance(segment, { from: points[0], to: points[0] }) <= reach;
    return Array.from({ length: edgeCount }, (_, index) => ({
        from: points[index],
        to: points[(index + 1) % points.length]
    })).some((edge) => segmentDistance(segment, edge) <= reach);
}
/**
 * A shape from another SVG. These are never built from a single node: they need their
 * ancestors' transforms and paint, so `importSvg` creates them for a whole document.
 */
export const importedKind = {
    type: 'imported',
    tagNames: ['g', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon'],
    toSvgMarkup: ({ markup }) => markup,
    fromSvgNode: () => null,
    hitTest(element, segment, radius) {
        const reach = inflateBounds(boundsOfSegment(segment), radius);
        if (!boundsIntersect(reach, element.bounds))
            return false;
        return element.outlines.some((outline) => outlineTouchesSegment(outline, segment, radius));
    }
};
