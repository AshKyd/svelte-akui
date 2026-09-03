/**
 * @file
 * Drag and drop coordinator for svelte-akui.
 * Provides application-wide drag payload tracking, hit-testing for registered
 * drop targets, and element attachments for drop target components.
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
 */
export declare function dropTarget<T = unknown>(options?: DropTargetOptions<T>): DropTargetInstance;
