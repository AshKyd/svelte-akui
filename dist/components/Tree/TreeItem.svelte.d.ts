import { type Snippet } from 'svelte';
declare const TreeItem: import("svelte").Component<{
    item: TreeItemData;
    depth?: number;
    parentId?: string;
    expanded?: Set<string>;
    size?: "small" | "large";
    onToggle?: (id: string) => void;
    onSelect?: (item: TreeItemData) => void;
    /** Optional snippet to override icon rendering */
    iconSnippet?: Snippet<[TreeItemData]>;
}, {}, "">;
type TreeItem = ReturnType<typeof TreeItem>;
export default TreeItem;
