import type { Snippet } from 'svelte';
interface Props {
    /** Optional URL to turn this badge into a link. */
    href?: string;
    /** The variant of the badge. */
    variant?: 'regular' | 'accent';
    /** The size of the badge. */
    size?: 'x-small' | 'small' | 'medium' | 'large';
    /** Whether to show the glassmorphism background. Defaults to false. */
    hasBackground?: boolean;
    /** Optional icon to display. */
    icon?: string;
    /** The label text or snippet. */
    children?: Snippet;
    /** Additional CSS classes. */
    class?: string;
    /** Spread remaining attributes. */
    [key: string]: unknown;
}
declare const Badge: import("svelte").Component<Props, {}, "">;
type Badge = ReturnType<typeof Badge>;
export default Badge;
