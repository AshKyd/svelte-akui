import type { Tool, ToolContext } from './types';
/**
 * The eraser is a stroke that is never committed. Each new segment of its trail is tested
 * against the elements; those hit are marked pending and only removed when the pointer lifts,
 * so one drag is one undo step.
 */
export declare function createEraseTool(context: ToolContext): Tool;
