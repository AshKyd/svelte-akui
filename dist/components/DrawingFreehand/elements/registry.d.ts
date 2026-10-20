import type { DrawingElement, ElementKind } from './types';
/** Adds an element type. Built-ins are registered already; this is how new types (and tests) plug in. */
export declare function registerElementKind(kind: ElementKind<any>): void;
export declare function getElementKind(type: string): ElementKind;
/** Kinds whose saved node uses this SVG tag, in registration order. */
export declare const getKindsForTag: (tagName: string) => ElementKind[];
export declare const toSvgMarkup: (element: DrawingElement) => string;
