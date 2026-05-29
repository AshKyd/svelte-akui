import { type Snippet } from 'svelte';
interface Props {
    /** Optional title to show in the sidebar header branding. */
    title?: string;
    /** Optional icon (name from icon set or absolute URL) to show in the sidebar header. */
    icon?: string;
    /** The content to be displayed in the scrollable top section of the sidebar. */
    content?: Snippet;
    /** Optional footer to be displayed at the bottom of the sidebar. */
    footer?: Snippet;
    /** Whether the sidebar drawer is open (for modal and dismissible modes). */
    isOpen?: boolean;
    /** The mode of the sidebar: permanent, modal, or dismissible. */
    mode?: 'permanent' | 'modal' | 'dismissible';
    /** Whether to show a close button at the top of the drawer. Defaults to true in modal mode, false otherwise. */
    showCloseButton?: boolean;
    /** The width of the sidebar when open. Defaults to '280px'. */
    width?: string;
    /** Additional CSS classes for the container. */
    class?: string;
}
declare const Sidebar: import("svelte").Component<Props, {}, "isOpen">;
type Sidebar = ReturnType<typeof Sidebar>;
export default Sidebar;
