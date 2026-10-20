import type { ElementStore } from '../ElementStore.svelte';
import type { Point } from '../elements/types';
/** One input sample, already converted to world coordinates. */
export interface PointerSample {
    world: Point;
    pressure: number;
    pointerType: string;
}
/** What a tool may use from the component. Tools never touch the DOM or the view directly. */
export interface ToolContext {
    store: ElementStore;
    getPenSize(): number;
    /** Hex colour for new strokes, or undefined for the default ink. */
    getPenColour(): string | undefined;
    /** Current zoom, for sizes that should stay constant on screen. */
    getScale(): number;
    /** Eraser radius in screen pixels. */
    eraserRadiusPx: number;
    /** Marks elements the eraser will remove on release, so they can be shown faded. */
    setPendingErase(ids: ReadonlySet<string>): void;
    requestRedraw(): void;
    /** Called after a committed change (element added or removed). */
    notifyChange(): void;
}
/**
 * A tool owns one gesture on the live canvas. `draw` paints whatever it is doing right now in
 * world coordinates; the component has already applied the view transform and fill colour.
 */
export interface Tool {
    id: string;
    start(sample: PointerSample): void;
    move(sample: PointerSample): void;
    end(): void;
    /** Abandons the gesture without changing the drawing (e.g. a second finger landed). */
    cancel(): void;
    draw(context: CanvasRenderingContext2D): void;
}
export type ToolId = 'pen' | 'erase';
