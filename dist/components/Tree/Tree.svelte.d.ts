import { type Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
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
    /** Size of the tree items. Defaults to 'small'. */
    size?: 'small' | 'large';
    /**
     * Extra attributes spread onto each item's row element. Use it to add behaviour the
     * tree knows nothing about — a drop target attachment, a tooltip, a data id. Pass
     * `class: 'akui-tree-item-row-highlight'` to light a row up. Return a stable object
     * per item: a new attachment on every render is torn down and recreated.
     */
    itemAttributes?: (item: TreeItemData) => HTMLAttributes<HTMLDivElement> | undefined;
}
declare const Tree: import("svelte").Component<Props, {}, "expanded">;
type Tree = ReturnType<typeof Tree>;
export default Tree;
