import type { ImportedElement } from '../elements/types';
import { type SanitisedChild } from './sanitiseSvg';
/**
 * Mounts the sanitised nodes in a hidden `<svg>` and has the browser resolve everything we would
 * otherwise reimplement: nested transforms, curve geometry, inherited paint. `scale` is the
 * root's width-to-viewBox scale. The host is always removed again.
 */
export declare function measureShapes(children: SanitisedChild[], scale: number): Map<Element, ImportedElement[]>;
