import { type Snippet } from 'svelte';
interface Props {
    /** The HTML tag to use for the component. Defaults to 'small'. */
    tag?: 'small' | 'span' | 'p' | 'div';
    /** The content to style as small text. */
    children: Snippet;
    /** Additional CSS classes. */
    class?: string;
    /** Optional colour: 'regular' or 'secondary' (default). */
    colour?: 'regular' | 'secondary';
}
declare const Small: import("svelte").Component<Props, {}, "">;
type Small = ReturnType<typeof Small>;
export default Small;
