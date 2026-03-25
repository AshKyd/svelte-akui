import { type Snippet } from 'svelte';
interface Props {
    /** The main content of the application. */
    children: Snippet;
    /** The content to be displayed in the sidebar. */
    sidebar: Snippet;
    /** Optional header to be integrated (above on desktop, shifting on mobile). */
    header?: Snippet;
    /** Optional footer to be displayed at the bottom of the sidebar. */
    footer?: Snippet;
    /** Optional title/logo to be shown in the sidebar on mobile. */
    title?: Snippet;
    /** Whether the sidebar is open (primarily for mobile). */
    isOpen?: boolean;
    /** The width of the sidebar. Defaults to '280px'. */
    width?: string;
    /** Additional CSS classes for the container. */
    class?: string;
}
declare const Sidebar: import("svelte").Component<Props, {}, "isOpen">;
type Sidebar = ReturnType<typeof Sidebar>;
export default Sidebar;
