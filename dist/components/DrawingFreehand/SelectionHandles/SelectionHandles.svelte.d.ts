import type { Matrix } from '../elements/matrix';
import type { Bounds } from '../elements/types';
import { type HandleId } from '../tools/selectionHandles';
import { type View } from '../viewTransform';
interface Props {
    /** The selection's bounds in world units, including any drag preview. */
    bounds: Bounds;
    view: View;
    /** The handle being dragged with the pointer, kept highlighted until release. */
    activeHandle?: HandleId;
    /** Smallest a side can be made with the keyboard, in screen pixels. */
    minSizePx: number;
    /** An arrow key asked for this change; the owner applies it as one undo step. */
    ontransform: (matrix: Matrix) => void;
    /** Escape was pressed. */
    ondeselect: () => void;
}
declare const SelectionHandles: import("svelte").Component<Props, {}, "">;
type SelectionHandles = ReturnType<typeof SelectionHandles>;
export default SelectionHandles;
