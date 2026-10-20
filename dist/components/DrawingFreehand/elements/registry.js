import { importedKind } from '../svgImport/importedElement';
import { strokeKind } from './stroke/strokeElement';
// Order matters when loading: our own strokes are claimed first, and anything else falls to the importer.
const kindsByType = new Map([
    [strokeKind.type, strokeKind],
    [importedKind.type, importedKind]
]);
/** Adds an element type. Built-ins are registered already; this is how new types (and tests) plug in. */
export function registerElementKind(kind) {
    kindsByType.set(kind.type, kind);
}
export function getElementKind(type) {
    const kind = kindsByType.get(type);
    if (!kind)
        throw new Error(`No element kind registered for "${type}"`);
    return kind;
}
/** Kinds whose saved node uses this SVG tag, in registration order. */
export const getKindsForTag = (tagName) => [...kindsByType.values()].filter((kind) => kind.tagNames.includes(tagName));
export const toSvgMarkup = (element) => getElementKind(element.type).toSvgMarkup(element);
