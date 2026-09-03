import { type Snippet } from 'svelte';
import { type TreeItemData } from './TreeItem.svelte';
interface Props {
    /** Array of tree items */
    items: TreeItemData[];
    /** Set of expanded item IDs */
    expanded?: Set<string>;
    /** Optional icon snippet for custom icon rendering */
    icon?: Snippet<[TreeItemData]>;
    /** Additional CSS classes */
    class?: string;
    /** Callback when an item is selected (clicked) */
    onSelect?: (item: TreeItemData) => void;
    /** Callback when a folder is toggled */
    onToggle?: (id: string) => void;
    /** Whether item drag & drop is enabled */
    draggable?: boolean;
    /** Callback to validate if dropping draggedId on targetId is allowed */
    onDragOver?: (draggedId: string, targetId: string) => boolean;
    /** Callback when an item is dropped onto a target */
    onDrop?: (draggedId: string, targetId: string) => void;
    /** Size of the tree items. Defaults to 'small'. */
    size?: 'small' | 'large';
    /** Callback to validate if an external DragPayload can be dropped on a target item */
    canDropPayload?: (payload: any, targetItem: TreeItemData) => boolean;
    /** Callback when an external DragPayload is dropped onto a target item */
    onDropPayload?: (payload: any, targetItem: TreeItemData) => void;
}
declare const Tree: import("svelte").Component<Props, {}, "expanded">;
type Tree = ReturnType<typeof Tree>;
export default Tree;
