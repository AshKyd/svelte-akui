import type { ToolId } from './tools/types';
interface Props {
    /** Saved SVG to load when the component mounts. Later changes to this prop are ignored. */
    svg?: string;
    /** The active tool. */
    tool?: ToolId;
    /** Pen diameter in world units (bindable). It scales with zoom like the strokes themselves. */
    penSize?: number;
    /** Brush sizes offered in the size menu, in world units. */
    penSizes?: number[];
    /** Hex colour for new strokes (bindable). Undefined is the default ink, which follows the theme. */
    penColour?: string;
    /** Called after every committed change: stroke added, strokes erased, undo, redo or clear. */
    onchange?: () => void;
}
declare const DrawingFreehand: import("svelte").Component<Props, {
    /** Serialises the drawing as a standalone SVG. */ getSvg: () => string;
    /** True when there is nothing drawn, e.g. to disable a Save button. */ isEmpty: () => boolean;
    undo: () => void;
    redo: () => void;
    clear: () => void;
    resetView: () => void;
}, "tool" | "penSize" | "penColour">;
type DrawingFreehand = ReturnType<typeof DrawingFreehand>;
export default DrawingFreehand;
