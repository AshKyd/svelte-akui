import { type Snippet } from 'svelte';
interface Props {
    /** Svelte snippet for the app brand/title/logo. */
    title?: Snippet;
    /** Svelte snippet for header actions (right-aligned). */
    children?: Snippet;
    /** Whether the linked sidebar is open (primarily for mobile). */
    sidebarOpen?: boolean;
    /** Whether to show the hamburger menu (if a sidebar is available). */
    hasSidebar?: boolean;
    /** Additional CSS classes for the header. */
    class?: string;
}
declare const Header: import("svelte").Component<Props, {}, "sidebarOpen">;
type Header = ReturnType<typeof Header>;
export default Header;
