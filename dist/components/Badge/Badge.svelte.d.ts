import type { Snippet } from 'svelte';
interface Props {
    /** Optional URL to turn this badge into a link. */
    href?: string;
    /** The label text. Used for seeding auto-color and as fallback content. */
    label?: string;
    /**
     * Optional color. 'auto' picks a stable color based on the label.
     * Defaults to 'blue'.
     */
    colour?: 'blue' | 'green' | 'orange' | 'pink' | 'purple' | 'amber' | 'auto';
    /** The size of the badge. */
    size?: 'x-small' | 'small' | 'medium' | 'large';
    /** Optional icon to display. */
    icon?: string;
    /** The snippet to render (overrides label for display). */
    children?: Snippet;
    /** Additional CSS classes. */
    class?: string;
    /** Optional callback for when the badge is closed. */
    onClose?: () => void;
    /** Spread remaining attributes. */
    [key: string]: unknown;
}
declare const Badge: import("svelte").Component<Props, {}, "">;
type Badge = ReturnType<typeof Badge>;
export default Badge;
