/**
 * @file
 * Drag and drop coordinator for svelte-akui. Application-wide drag payload
 * tracking and hit-testing for registered drop targets. `dragSource()` (in
 * `dragSource.svelte.ts`) makes an element emit a payload; `dropTarget()` (in
 * `dropTarget.svelte.ts`) makes an element accept one. Both are pointer-based
 * and share one `DropManager`: a browser-wide fallback by default, or a scoped
 * instance when `<UIRoot>` / `setDropManagerContext` provides one via context.
 */
import type { DragPayload, DropTargetOptions } from './types.js';
import type { DropTargetInstance } from './dropTarget.svelte.js';
export interface RegisteredTarget {
    element: HTMLElement;
    options: DropTargetOptions;
    state: DropTargetInstance;
}
/**
 * Global drag and drop manager for coordinating pointer and drag events with targets.
 */
export declare class DropManager {
    #private;
    get activePayload(): DragPayload | null;
    get isDragging(): boolean;
    get activeTarget(): RegisteredTarget | null;
    /**
     * Registers a DOM element as an active drop target.
     */
    register(element: HTMLElement, options: DropTargetOptions, instance: DropTargetInstance): () => void;
    /**
     * Initiates a global drag session with the given payload.
     */
    startDrag(payload: DragPayload): void;
    /**
     * Hit-tests registered targets against pointer coordinates and updates hover states.
     */
    updatePointer(clientX: number, clientY: number): void;
    /**
     * Commits drop if pointer is currently over a valid drop target.
     * Returns true if handled by a drop target.
     */
    handleDrop(event?: PointerEvent | DragEvent): boolean;
    /**
     * Cancels drag operation without triggering a drop.
     */
    cancelDrag(): void;
    /**
     * Resets drag state.
     */
    endDrag(): void;
}
/**
 * Type-safe context for DropManager in Svelte 5. `<UIRoot>` sets this, and so can
 * a consumer that wants an isolated drag scope (a portalled overlay, a test) by
 * calling `setDropManagerContext(new DropManager())` during component init.
 */
export declare const getDropManagerContext: () => DropManager, setDropManagerContext: (context: DropManager) => DropManager;
/**
 * Returns the DropManager for the current component: the one from context if a
 * provider (`<UIRoot>` or `setDropManagerContext`) is above it, otherwise the
 * shared browser-wide fallback. So a bare `dragSource()` and `dropTarget()`
 * elsewhere on the page still see each other with zero setup.
 *
 * On the server there is no context and no shared state to keep, so each call
 * gets a throwaway instance — nothing registers targets or drags during SSR.
 */
export declare function getDropManager(): DropManager;
/**
 * Drops the shared fallback manager so the next `getDropManager()` (outside any
 * context) builds a fresh one. For tests that need isolation between cases.
 */
export declare function resetDropManager(): void;
