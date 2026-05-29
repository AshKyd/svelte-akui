import { type Snippet } from 'svelte';
interface Props {
    /** Svelte snippet for the left-aligned navigation (e.g. menu button). */
    navigation?: Snippet;
    /** Svelte snippet for the app brand/title/logo. */
    title?: Snippet;
    /** Svelte snippet for header actions (right-aligned). */
    actions?: Snippet;
    /** Whether the header is pinned/sticky to the top of the viewport. */
    pinned?: boolean;
    /** Additional CSS classes for the header. */
    class?: string;
}
declare const Header: import("svelte").Component<Props, {}, "">;
type Header = ReturnType<typeof Header>;
export default Header;
