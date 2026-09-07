import { type Snippet } from 'svelte';
import { type NotificationItem } from './types.js';
interface Props {
    /** The notifications to show, oldest first. */
    items: NotificationItem[];
    /** Remove a notification: fired on timeout, the × button, Escape, or after an action runs. */
    onDismiss?: (id: string) => void;
    /** Accessible name for the region landmark. */
    label?: string;
    /** Where the stack sits. `inline` drops it into normal flow (for embedding and stories). */
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'inline';
    /** Render at most this many; older ones are hidden, not dismissed. */
    max?: number;
    /** Per-item render override — replaces the default message body. */
    children?: Snippet<[{
        item: NotificationItem;
    }]>;
    /** Additional CSS classes. */
    class?: string;
    /** Spread remaining attributes onto the region. */
    [key: string]: unknown;
}
declare const NotificationArea: import("svelte").Component<Props, {}, "">;
type NotificationArea = ReturnType<typeof NotificationArea>;
export default NotificationArea;
