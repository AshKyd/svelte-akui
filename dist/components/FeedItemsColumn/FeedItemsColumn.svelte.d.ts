import FeedItemRow from '../FeedItemRow/FeedItemRow.svelte';
import { type Snippet, type ComponentProps } from 'svelte';
type RowProps = ComponentProps<typeof FeedItemRow>;
interface ItemData extends RowProps {
    /** Unique identifier for the item */
    id: string | number;
}
interface Props {
    /** Array of feed items to display */
    items: ItemData[];
    /** Shared layout for all items (compact or hero) */
    layout?: 'compact' | 'hero';
    /** Shared fit mode for all images */
    fit?: 'cover' | 'contain' | 'auto';
    /** Shared aspect ratio for all thumbnails */
    ratio?: string | number;
    /** Callback when an item is clicked */
    onselect?: (id: string | number) => void;
    /** Optional snippet override for icons in this column */
    icon?: Snippet<[ItemData]>;
    /** Optional snippet override for images in this column */
    image?: Snippet<[ItemData]>;
    /** Additional CSS classes for the container */
    class?: string;
}
declare const FeedItemsColumn: import("svelte").Component<Props, {}, "">;
type FeedItemsColumn = ReturnType<typeof FeedItemsColumn>;
export default FeedItemsColumn;
