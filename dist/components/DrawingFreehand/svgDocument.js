import { unionBounds } from './elements/geometry';
import { getKindsForTag, toSvgMarkup } from './elements/registry';
import { importSvgRoot } from './svgImport/importSvg';
import { getRootScale } from './svgImport/sanitiseSvg';
const PADDING = 16;
/** Matches the near-black Excalidraw exports, so cards invert it the same way in dark mode. */
const INK_COLOUR = '#1e1e1e';
/** Serialises elements to a standalone SVG sized to fit them. */
export function elementsToSvg(elements) {
    const bounds = elements.length ? unionBounds(elements.map((element) => element.bounds)) : null;
    const minX = bounds ? bounds.minX - PADDING : 0;
    const minY = bounds ? bounds.minY - PADDING : 0;
    const width = bounds ? bounds.maxX - bounds.minX + PADDING * 2 : 100;
    const height = bounds ? bounds.maxY - bounds.minY + PADDING * 2 : 100;
    const round = (n) => Math.round(n * 100) / 100;
    // `color` is what `currentColor` (the ink on imported strokes) resolves to outside the editor.
    return [
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${round(minX)} ${round(minY)} ${round(width)} ${round(height)}"`,
        ` width="${round(width)}" height="${round(height)}" class="supports-dark-mode" fill="${INK_COLOUR}" color="${INK_COLOUR}">`,
        elements.map(toSvgMarkup).join(''),
        '</svg>'
    ].join('');
}
/** An element from one of our own kinds (a plain stroke), or undefined if none claims the node. */
function nativeElementFromNode(node) {
    return getKindsForTag(node.localName.toLowerCase())
        .map((kind) => kind.fromSvgNode(node))
        .find((candidate) => candidate !== null);
}
/**
 * Rebuilds elements from an SVG, in document order. Our own strokes load exactly as saved.
 * Every other top-level node goes to the importer, which flattens it into shapes.
 */
export function svgToElements(svgText) {
    const root = new DOMParser().parseFromString(svgText, 'image/svg+xml').documentElement;
    if (root.localName !== 'svg')
        return [];
    const children = [...root.children];
    // A root that rescales its viewBox moves everything, which our plain strokes would ignore,
    // so in that case the importer handles every node.
    const claimNatively = getRootScale(root) === 1;
    const native = new Map(children.flatMap((child) => {
        const element = claimNatively ? nativeElementFromNode(child) : undefined;
        return element ? [[child, element]] : [];
    }));
    const imported = importSvgRoot(root, (child) => native.has(child));
    return children.flatMap((child) => native.get(child) ?? imported.get(child) ?? []);
}
