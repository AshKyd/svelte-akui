import { boundsIntersect, boundsOfSegment, inflateBounds, segmentTouchesPolygon } from '../geometry';
import { elementFromPath, transformStrokePath } from './strokePath';
export const strokeKind = {
    type: 'stroke',
    tagNames: ['path'],
    // No fill for the default ink, so the document's colour (and dark mode) applies.
    toSvgMarkup: ({ id, d, colour }) => `<path id="${id}" d="${d}"${colour ? ` fill="${colour}"` : ''}/>`,
    fromSvgNode(node) {
        // Only our own plain strokes. A path with a transform, stroke or anything else must go
        // through the importer, or those attributes would be silently dropped on load.
        const isOurs = [...node.attributes].every(({ name }) => ['id', 'd', 'fill'].includes(name));
        const d = node.getAttribute('d');
        if (!isOurs || !d)
            return null;
        return elementFromPath(d, node.getAttribute('id') || crypto.randomUUID(), node.getAttribute('fill') ?? undefined);
    },
    hitTest(element, segment, radius) {
        // Cheap bounds check first so most strokes are skipped without touching their vertices.
        const reach = inflateBounds(boundsOfSegment(segment), radius);
        if (!boundsIntersect(reach, element.bounds))
            return false;
        return segmentTouchesPolygon(segment, element.polygon, radius);
    },
    transform(element, matrix) {
        // Rebuilt from the mapped path so `polygon` and `bounds` can't drift from `d`.
        return (elementFromPath(transformStrokePath(element.d, matrix), element.id, element.colour) ?? element);
    }
};
