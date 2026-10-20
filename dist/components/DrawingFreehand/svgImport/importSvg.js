import { measureShapes } from './measureShapes';
import { getRootScale, sanitiseChildren } from './sanitiseSvg';
/**
 * Imports the shapes under a parsed SVG root, grouped by the top-level child they came from so
 * the caller can keep document order. Children for which `skip` is true are left alone.
 *
 * Only plain geometry and presentation attributes are read. CSS, scripts, `<use>`, text, images
 * and external references never reach the live document: the tree is rebuilt from an allow-list.
 */
export function importSvgRoot(root, skip) {
    const children = sanitiseChildren(root, skip);
    return measureShapes(children, getRootScale(root));
}
/** Imports every shape in an SVG string, in document order. Returns nothing if it isn't an SVG. */
export function importSvg(svgText) {
    const root = new DOMParser().parseFromString(svgText, 'image/svg+xml').documentElement;
    if (root.localName !== 'svg')
        return [];
    return [...importSvgRoot(root).values()].flat();
}
