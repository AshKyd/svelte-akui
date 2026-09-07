/**
 * @file
 * Drop-target primitive. `dropTarget()` returns an instance whose `.attach` makes
 * an element accept drag payloads, alongside reactive hover state. Use it directly
 * for an unstyled drop target, or reach for the `<DropTarget>` component for the
 * default styling.
 */
import type { Attachment } from 'svelte/attachments';
import type { DragPayload, DropTargetOptions } from './types.js';
import { DropManager } from './manager.svelte.js';
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
 * Creates a drop target instance that provides an attachment and reactive hover state.
 * This is the primitive layer — no styling. `<DropTarget>` wraps it with the default look.
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
