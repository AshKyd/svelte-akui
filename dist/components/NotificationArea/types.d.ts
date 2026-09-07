import { type Snippet } from 'svelte';
/**
 * Shortest auto-dismiss timeout we allow, in milliseconds. WCAG 2.2.1 (Timing Adjustable) warns
 * against short, unavoidable time limits; anything between 1 and this value is raised to it. Pass
 * `timeout: 0` (or omit it) for a notification that never auto-dismisses.
 */
export declare const MIN_TIMEOUT = 5000;
/** A single notification in the {@link NotificationArea} list. */
export interface NotificationItem {
    /** Stable identity for the list. Reusing an id re-announces the notification. */
    id: string;
    /** Severity — drives colour, icon and how urgently screen readers announce it. */
    variant?: 'info' | 'success' | 'warning' | 'error' | 'message';
    /** Bold heading above the message. */
    title?: string;
    /** Body content. A string is announced to screen readers; a Snippet needs `announce`. */
    message: string | Snippet;
    /** Text read aloud when `message` is a Snippet. Falls back to `title`. */
    announce?: string;
    /** Bootstrap-icon name, overriding the per-variant default. */
    icon?: string;
    /** Auto-dismiss after this many ms. 0 or omitted means it stays until dismissed. 1–4999 is raised to {@link MIN_TIMEOUT}. */
    timeout?: number;
    /** Click handler for the whole notification body. Renders the body as a button. */
    onClick?: () => void;
    /** Label for a trailing action button, e.g. "Undo". */
    actionLabel?: string;
    /** Runs when the action button is pressed. The notification dismisses once it resolves. */
    onAction?: () => void | Promise<void>;
    /** Show the dismiss button. Defaults to true. */
    dismissible?: boolean;
}
/** Clamp a raw `timeout` to either 0 (sticky) or at least {@link MIN_TIMEOUT}. */
export declare function resolveTimeout(timeout: number | undefined): number;
