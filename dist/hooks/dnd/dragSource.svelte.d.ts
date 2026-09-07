/**
 * @file
 * Drag-source primitive. `dragSource()` returns an instance whose `.attach` owns
 * the full pointer gesture, alongside reactive drag state. Use it directly for an
 * unstyled drag source, or reach for the `<Draggable>` component for the default
 * cursor-follow / scale / settle visuals.
 */
import type { Attachment } from 'svelte/attachments';
import type { DragSourceOptions } from './types.js';
import { DropManager } from './manager.svelte.js';
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
 * `<Draggable>` wraps this with default cursor-follow and settle visuals.
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
 * Automatically connects to the shared `DropManager`. Pass an explicit `DropManager`
 * instance as the second argument when using an isolated drag scope.
 */
export declare function dragSource<T = unknown>(options: DragSourceOptions<T>, manager?: DropManager): DragSourceInstance<T>;
