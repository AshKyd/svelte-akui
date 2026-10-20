import { translateMatrix, type Matrix } from '../elements/matrix';
import type { Bounds, Point } from '../elements/types';
import { handlePosition, resizeMatrix, type HandleId } from './selectionHandles';

/** One arrow press, in screen pixels, so it feels the same at any zoom. */
export const ARROW_STEP_PX = 4;
/** Shift makes each press this many times larger. */
export const SHIFT_MULTIPLIER = 10;

const DIRECTIONS: Record<string, Point> = {
	ArrowLeft: [-1, 0],
	ArrowRight: [1, 0],
	ArrowUp: [0, -1],
	ArrowDown: [0, 1]
};

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
export function keyboardMatrix({
	key,
	shiftKey,
	handle,
	bounds,
	scale,
	minSizePx
}: KeyboardTransformOptions): Matrix | null {
	const direction = DIRECTIONS[key];
	if (!direction) return null;
	const step = (ARROW_STEP_PX * (shiftKey ? SHIFT_MULTIPLIER : 1)) / scale;
	const [dx, dy] = [direction[0] * step, direction[1] * step];

	if (!handle) return translateMatrix(dx, dy);

	const isEdge = handle.length === 1;
	const isHorizontalEdge = handle === 'e' || handle === 'w';
	if (isEdge && (isHorizontalEdge ? dx === 0 : dy === 0)) return null;

	const [handleX, handleY] = handlePosition(handle, bounds);
	return resizeMatrix(handle, bounds, [handleX + dx, handleY + dy], minSizePx / scale);
}
