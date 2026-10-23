import type { Tool, ToolContext } from './types';
/** Reach of a resize handle, a little larger than the handle is drawn. */
export declare const HANDLE_RADIUS_PX = 10;
/** Smallest a resized side can get, in screen pixels. */
export declare const MIN_SIZE_PX = 8;
/**
 * Selects one element and moves or resizes it. While dragging only a preview matrix changes
 * (the component applies it as an SVG transform). On release the matrix is baked into the
 * element's own geometry as one undo step, so erasing and saving always see real positions.
 */
export declare function createPointerTool(context: ToolContext): Tool;
