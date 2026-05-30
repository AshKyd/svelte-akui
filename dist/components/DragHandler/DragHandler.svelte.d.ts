interface Props {
    /** Event handler called with movement details during drag */
    onDrag?: (detail: {
        deltaX: number;
        deltaY: number;
        offsetX: number;
        offsetY: number;
    }) => void;
    /** Callback triggered when dragging begins */
    onDragStart?: () => void;
    /** Callback triggered when dragging finishes */
    onDragEnd?: () => void;
    /** Layout alignment of the handle. Defaults to 'vertical'. */
    orientation?: 'vertical' | 'horizontal';
    /** Externally force the visual active/dragging styling */
    active?: boolean;
    /** Custom CSS classes to add to the wrapper */
    class?: string;
}
declare const DragHandler: import("svelte").Component<Props, {}, "">;
type DragHandler = ReturnType<typeof DragHandler>;
export default DragHandler;
