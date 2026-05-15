import { type Snippet } from 'svelte';
declare const TreeItem: import("svelte").Component<{
    item: TreeItemData;
    depth?: number;
    expanded?: Set<string>;
    onToggle?: (id: string) => void;
    onSelect?: (item: TreeItemData) => void;
    /** Optional snippet to override icon rendering */
    iconSnippet?: Snippet<[{
        item: TreeItemData;
    }]>;
}, {}, "">;
type TreeItem = ReturnType<typeof TreeItem>;
export default TreeItem;
