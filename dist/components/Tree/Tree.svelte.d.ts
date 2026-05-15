import { type Snippet } from 'svelte';
import { type TreeItemData } from './TreeItem.svelte';
interface Props {
    /** Array of tree items */
    items: TreeItemData[];
    /** Set of expanded item IDs */
    expanded?: Set<string>;
    /** Optional icon snippet for custom icon rendering */
    icon?: Snippet<[{
        item: TreeItemData;
    }]>;
    /** Additional CSS classes */
    class?: string;
    /** Callback when an item is selected (clicked) */
    onSelect?: (item: TreeItemData) => void;
    /** Callback when a folder is toggled */
    onToggle?: (id: string) => void;
}
declare const Tree: import("svelte").Component<Props, {}, "expanded">;
type Tree = ReturnType<typeof Tree>;
export default Tree;
