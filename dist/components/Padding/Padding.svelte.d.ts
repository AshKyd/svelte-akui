import { type Snippet } from 'svelte';
interface Props {
    /** The padding size from our theme. */
    size?: 'none' | 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl';
    /** Shorthand to apply padding to all sides (default). */
    all?: boolean;
    /** Shorthand for horizontal padding (left and right). */
    x?: boolean;
    /** Shorthand for vertical padding (top and bottom). */
    y?: boolean;
    /** Specific side: top. */
    top?: boolean;
    /** Specific side: bottom. */
    bottom?: boolean;
    /** Specific side: left. */
    left?: boolean;
    /** Specific side: right. */
    right?: boolean;
    /** Content to wrap. */
    children: Snippet;
    /** Additional CSS classes. */
    class?: string;
    /** Additional style overrides. */
    style?: string;
    /** Spread remaining attributes. */
    [key: string]: unknown;
}
declare const Padding: import("svelte").Component<Props, {}, "">;
type Padding = ReturnType<typeof Padding>;
export default Padding;
