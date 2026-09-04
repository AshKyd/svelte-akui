import { type Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import TreeItem from './TreeItem.svelte';
export interface TreeItemData {
    id: string;
    label: string;
    icon?: string;
    status?: string;
    children?: TreeItemData[];
    isFolder?: boolean;
    [key: string]: any;
}
interface Props {
    item: TreeItemData;
    depth?: number;
    parentId?: string;
    expanded?: Set<string>;
    size?: 'small' | 'large';
    onToggle?: (id: string) => void;
    onSelect?: (item: TreeItemData) => void;
    /** Optional snippet to override icon rendering */
    iconSnippet?: Snippet<[TreeItemData]>;
    /** Extra attributes spread onto the row element. See `Tree`. */
    itemAttributes?: (item: TreeItemData) => HTMLAttributes<HTMLDivElement> | undefined;
}
declare const TreeItem: import("svelte").Component<Props, {}, "">;
type TreeItem = ReturnType<typeof TreeItem>;
export default TreeItem;
