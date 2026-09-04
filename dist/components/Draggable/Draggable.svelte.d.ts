/**
     * @file
     * Generic pointer-drag source. Wrap any element to make it draggable into global
     * `DropTarget`s via the shared `DropManager`. Mirrors `DropTarget`: the mechanics
     * live in `dragSource()`, this component adds the default drag visuals (cursor
     * follow, optional scale, and a snap-back settle when the drag ends).
     */
import { type Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import { type DragCancelReason, type DragMoveDetail, type DragPayload } from '../../hooks/dropManager.svelte.js';
interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'ondragstart' | 'ondragend' | 'ondrop' | 'oncancel'> {
    /** Builds the payload dispatched to the global DropManager when this element starts dragging */
    getPayload: (ctx: {
        element: HTMLElement;
    }) => DragPayload;
    /** CSS selector for a drag handle inside the content; dragging only starts from a descendant match */
    handleSelector?: string;
    /** Blocks drag initiation while true */
    disabled?: boolean;
    /** Touch hold duration in ms before a drag begins. Defaults to 350. */
    longPressDelay?: number;
    /** Mouse pointer travel in px before a drag begins. Defaults to 4. */
    mouseThreshold?: number;
    /** Scale applied to the element while dragging, anchored on the grab point. Defaults to 1. */
    dragScale?: number;
    /** Fired once when a drag begins */
    ondragstart?: () => void;
    /** Fired on each pointer move during a drag, with cursor position and delta from the grab point */
    ondragmove?: (detail: DragMoveDetail) => void;
    /** Fired on release; handledExternally is true when a global drop target consumed the drop */
    ondrop?: (detail: {
        handledExternally: boolean;
        event: PointerEvent;
    }) => void;
    /** Fired when a drag is aborted rather than dropped */
    oncancel?: (reason: DragCancelReason) => void;
    /** Fired after any drag ends, whether it dropped or cancelled */
    ondragend?: () => void;
    /** Content of the draggable; receives reactive drag state */
    children?: Snippet<[{
        isDragging: boolean;
        delta: {
            x: number;
            y: number;
        };
    }]>;
    /** Additional CSS classes */
    class?: string;
}
declare const Draggable: import("svelte").Component<Props, {}, "">;
type Draggable = ReturnType<typeof Draggable>;
export default Draggable;
