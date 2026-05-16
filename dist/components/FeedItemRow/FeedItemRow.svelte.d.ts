import { type Snippet } from 'svelte';
interface Props {
    /** The main headline of the item */
    title: string;
    /** A short summary or excerpt */
    excerpt?: string;
    /** Metadata label (e.g. feed name or category) */
    tag?: string;
    /** Timestamp or relative time string */
    time?: string;
    /** Optional icon to show on the left (icon name, URL, or snippet) */
    icon?: string | Snippet;
    /** Optional image to show (URL or snippet) */
    image?: string | Snippet;
    /** Whether the item is currently selected/active */
    active?: boolean;
    /** Whether the item is unread. Read items have dimmed titles. */
    unread?: boolean;
    /** Optional unique identifier for selection tracking */
    id?: string;
    /** Link destination */
    href?: string;
    /** Layout style: 'compact' (side image) or 'hero' (top image) */
    layout?: 'compact' | 'hero';
    /** Aspect ratio for the thumbnail (e.g. '16 / 9' or '1 / 1') */
    ratio?: string | number;
    /** Image fit mode: 'cover', 'contain', or 'auto' (smart) */
    fit?: 'cover' | 'contain' | 'auto';
    /** Additional CSS classes */
    class?: string;
    /** Callback when the item is clicked */
    onclick?: (e: MouseEvent) => void;
}
declare const FeedItemRow: import("svelte").Component<Props, {}, "">;
type FeedItemRow = ReturnType<typeof FeedItemRow>;
export default FeedItemRow;
