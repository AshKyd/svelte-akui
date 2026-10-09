import { type Snippet } from 'svelte';
interface Props {
    x?: number;
    y?: number;
    onClose?: () => void;
    children: Snippet;
    class?: string;
    /** How the menu is shown. 'auto' picks a popover on wide screens and a bottom sheet on narrow ones. */
    presentation?: 'auto' | 'popover' | 'sheet';
    origin?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    /** Edge the opening animation starts from. Defaults to the vertical part of `origin`; mobile sheets always open from the bottom. */
    openFrom?: 'top' | 'bottom';
}
declare const Menu: import("svelte").Component<Props, {}, "">;
type Menu = ReturnType<typeof Menu>;
export default Menu;
