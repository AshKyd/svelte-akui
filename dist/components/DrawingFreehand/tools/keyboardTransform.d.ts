import { type Matrix } from '../elements/matrix';
import type { Bounds } from '../elements/types';
import { type HandleId } from './selectionHandles';
/** One arrow press, in screen pixels, so it feels the same at any zoom. */
export declare const ARROW_STEP_PX = 4;
/** Shift makes each press this many times larger. */
export declare const SHIFT_MULTIPLIER = 10;
interface KeyboardTransformOptions {
    key: string;
    shiftKey: boolean;
    /** The focused handle, or undefined when the selection itself is focused. */
    handle?: HandleId;
    bounds: Bounds;
    /** Current zoom, to turn the pixel step into world units. */
    scale: number;
    minSizePx: number;
}
/**
 * The matrix an arrow key asks for, or null if the key does nothing here.
 *
 * - On the selection itself, arrows move it.
 * - On a handle, arrows drag that handle by one step, through the same `resizeMatrix` as the
 *   mouse: corners keep the ratio, edges stretch. An edge ignores arrows across its axis.
 */
export declare function keyboardMatrix({ key, shiftKey, handle, bounds, scale, minSizePx }: KeyboardTransformOptions): Matrix | null;
export {};
