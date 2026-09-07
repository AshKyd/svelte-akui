import { type Snippet } from 'svelte';
import { type NotificationItem } from './types.js';
interface Props {
    /** The notification to render. */
    item: NotificationItem;
    /** When true, the auto-dismiss timer and the countdown bar are frozen. */
    paused?: boolean;
    /** Called when the timer runs out. */
    onExpire: (id: string) => void;
    /** Called when the user dismisses it (× button, Escape, or after the action runs). */
    onDismiss: (id: string) => void;
    /** Per-item render override from the parent. */
    itemSnippet?: Snippet<[{
        item: NotificationItem;
    }]>;
}
declare const NotificationCard: import("svelte").Component<Props, {}, "">;
type NotificationCard = ReturnType<typeof NotificationCard>;
export default NotificationCard;
