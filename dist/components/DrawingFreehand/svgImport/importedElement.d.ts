import type { ElementKind, ImportedElement } from '../elements/types';
/**
 * A shape from another SVG. These are never built from a single node: they need their
 * ancestors' transforms and paint, so `importSvg` creates them for a whole document.
 */
export declare const importedKind: ElementKind<ImportedElement>;
