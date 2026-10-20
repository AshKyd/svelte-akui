import type { Bounds, Point } from './elements/types';
/** Pan (`x`, `y` in screen px) and scale (`k`). `screen = world * k + (x, y)`. */
export interface View {
    x: number;
    y: number;
    k: number;
}
export declare const MIN_SCALE = 0.1;
export declare const MAX_SCALE = 10;
export declare const IDENTITY_VIEW: View;
export declare const screenToWorld: ({ x, y, k }: View, [sx, sy]: Point) => Point;
export declare const panBy: (view: View, dx: number, dy: number) => View;
/** Scales by `factor` while keeping the world point under `screenPoint` where it is. */
export declare function zoomAbout(view: View, [sx, sy]: Point, factor: number): View;
/** A view that centres `bounds` in the viewport with some padding. No content gives the identity view. */
export declare function fitView(bounds: Bounds | null, { width, height }: {
    width: number;
    height: number;
}, padding?: number): View;
