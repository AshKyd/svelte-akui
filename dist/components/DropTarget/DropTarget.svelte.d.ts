import { type Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import { type DragPayload } from '../../hooks/dropManager.svelte.js';
interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'ondrop' | 'ondragenter' | 'ondragleave'> {
    /** Function validating if the active drag payload can be dropped */
    canDrop?: (payload: DragPayload) => boolean;
    /** Callback invoked when a payload is dropped onto this target */
    ondrop?: (payload: DragPayload, event?: PointerEvent | DragEvent) => void;
    /** Callback invoked when a drag enters this target */
    ondragenter?: (payload: DragPayload) => void;
    /** Callback invoked when a drag leaves this target */
    ondragleave?: () => void;
    /** The content to render inside the drop target */
    children?: Snippet<[{
        isOver: boolean;
        canDrop: boolean;
        isDragging: boolean;
        activePayload: DragPayload | null;
    }]>;
    /** Additional CSS classes */
    class?: string;
}
declare const DropTarget: import("svelte").Component<Props, {}, "">;
type DropTarget = ReturnType<typeof DropTarget>;
export default DropTarget;
