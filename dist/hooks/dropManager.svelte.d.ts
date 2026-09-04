/**
 * @file
 * Drag and drop coordinator for svelte-akui.
 * Provides application-wide drag payload tracking, hit-testing for registered
 * drop targets, and element attachments for both drop target and drag source
 * components. `dropTarget()` makes an element accept payloads; `dragSource()`
 * makes an element emit one. Both are pointer-based and share one `DropManager`.
 */
import type { Attachment } from 'svelte/attachments';
export interface DragPayload<T = unknown> {
    /** Identifier describing the type of payload (e.g. 'akui-masonry-item', 'note') */
    type: string;
    /** The payload data itself */
    data: T;
    /** Optional source identifier */
    source?: string;
}
export interface DropTargetOptions<T = unknown> {
    /** Predicate testing if the active drag payload is acceptable */
    canDrop?: (payload: DragPayload) => boolean;
    /** Callback invoked when a valid payload is dropped onto this target */
    ondrop?: (payload: DragPayload, event?: PointerEvent | DragEvent) => void;
    /** Callback invoked when a valid drag enters this target */
    ondragenter?: (payload: DragPayload) => void;
    /** Callback invoked when a drag leaves this target */
    ondragleave?: () => void;
}
export interface RegisteredTarget {
    element: HTMLElement;
    options: DropTargetOptions;
    state: DropTargetInstance;
}
/**
 * Reactive drop target state instance bound to an element attachment.
 */
export declare class DropTargetInstance {
    #private;
    constructor(manager: DropManager, options: DropTargetOptions);
    get isDragging(): boolean;
    get isOver(): boolean;
    get canDrop(): boolean;
    get activePayload(): DragPayload | null;
    get options(): DropTargetOptions;
    updateOptions(newOptions: DropTargetOptions): void;
    setHover(isOver: boolean, canDrop: boolean): void;
    /**
     * Svelte 5 attachment function to be used with `{@attach target.attach}`
     */
    get attach(): Attachment<HTMLElement>;
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
 * Type-safe context for DropManager in Svelte 5.
 */
export declare const getDropManagerContext: () => DropManager, setDropManagerContext: (context: DropManager) => DropManager;
/**
 * Returns the DropManager from context or creates a fallback if rendered outside UIRoot.
 */
export declare function getDropManager(): DropManager;
/**
 * Creates a drop target instance that provides an attachment and reactive hover state.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { dropTarget } from 'svelte-akui';
 *   const target = dropTarget({
 *     canDrop: (payload) => payload.type === 'note',
 *     ondrop: (payload) => handleDrop(payload.data)
 *   });
 * </script>
 *
 * <div {@attach target.attach} class:hovering={target.isOver && target.canDrop}>
 *   Drop here
 * </div>
 * ```
 *
 * The manager is read from context, so call this during component initialisation. To build
 * targets later (lazily, per list item), grab the manager once at init with
 * `getDropManager()` and pass it as the second argument.
 */
export declare function dropTarget<T = unknown>(options?: DropTargetOptions<T>, manager?: DropManager): DropTargetInstance;
export interface DragMoveDetail {
    /** Pointer client X */
    x: number;
    /** Pointer client Y */
    y: number;
    /** Pointer X offset from where the drag began */
    dx: number;
    /** Pointer Y offset from where the drag began */
    dy: number;
}
/** Reason a drag ended without a drop. */
export type DragCancelReason = 'escape' | 'pointercancel' | 'detached';
export interface DragSourceOptions<T = unknown> {
    /** Builds the payload dispatched to the DropManager when the drag begins. Required. */
    getPayload: (ctx: {
        element: HTMLElement;
    }) => DragPayload<T>;
    /** CSS selector for a drag handle; the drag only starts from a descendant that matches. */
    handleSelector?: string;
    /** Blocks drag initiation while true. */
    disabled?: boolean;
    /** Touch hold duration in milliseconds before a drag begins. Defaults to 350. */
    longPressDelay?: number;
    /** Mouse pointer travel in pixels before a drag begins. Defaults to 4. */
    mouseThreshold?: number;
    /** Invoked once, immediately after the drag begins. */
    ondragstart?: () => void;
    /** Invoked on every pointer move during a drag. */
    ondragmove?: (detail: DragMoveDetail) => void;
    /** Invoked on release. `handledExternally` is true when a drop target consumed the drop. */
    ondrop?: (detail: {
        handledExternally: boolean;
        event: PointerEvent;
    }) => void;
    /** Invoked when a drag is aborted rather than dropped. */
    oncancel?: (reason: DragCancelReason) => void;
    /** Invoked last, after any drag ends (dropped or cancelled), once state is reset. */
    ondragend?: () => void;
}
/**
 * Reactive drag source state instance bound to an element attachment.
 *
 * Owns the full pointer gesture: the start gate (mouse travel threshold / touch
 * long-press), pointer capture, native-drag suppression, a one-shot trailing-click
 * swallow, Escape-to-cancel, and driving the DropManager. It applies no styling —
 * `<Draggable>` layers the default drag visuals on top.
 */
export declare class DragSourceInstance<T = unknown> {
    #private;
    constructor(manager: DropManager, options: DragSourceOptions<T>);
    /** True while a drag gesture is active (after the start threshold, before release). */
    get isDragging(): boolean;
    /** Pointer offset from the grab point. `{ x: 0, y: 0 }` while idle. */
    get delta(): {
        x: number;
        y: number;
    };
    /** Pointer position within the element when the drag began, for anchoring a scale transform. */
    get grabOffset(): {
        x: number;
        y: number;
    };
    updateOptions(newOptions: DragSourceOptions<T>): void;
    /** Svelte 5 attachment: `<div {@attach source.attach}>`. */
    get attach(): Attachment<HTMLElement>;
}
/**
 * Creates a drag source instance that provides an attachment and reactive drag state.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { dragSource } from 'svelte-akui';
 *   const source = dragSource({
 *     getPayload: () => ({ type: 'note', data: note })
 *   });
 * </script>
 *
 * <div {@attach source.attach} class:dragging={source.isDragging}>
 *   Drag me
 * </div>
 * ```
 *
 * The manager is read from context, so call this during component initialisation. To build
 * sources later (lazily, per list item), grab the manager once at init with
 * `getDropManager()` and pass it as the second argument.
 */
export declare function dragSource<T = unknown>(options: DragSourceOptions<T>, manager?: DropManager): DragSourceInstance<T>;
