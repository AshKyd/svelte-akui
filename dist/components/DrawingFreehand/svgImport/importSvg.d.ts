import type { ImportedElement } from '../elements/types';
/**
 * Imports the shapes under a parsed SVG root, grouped by the top-level child they came from so
 * the caller can keep document order. Children for which `skip` is true are left alone.
 *
 * Only plain geometry and presentation attributes are read. CSS, scripts, `<use>`, text, images
 * and external references never reach the live document: the tree is rebuilt from an allow-list.
 */
export declare function importSvgRoot(root: Element, skip?: (child: Element) => boolean): Map<Element, ImportedElement[]>;
/** Imports every shape in an SVG string, in document order. Returns nothing if it isn't an SVG. */
export declare function importSvg(svgText: string): ImportedElement[];
