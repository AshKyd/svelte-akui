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
    /** Accessible name for the menu, announced when it opens. Defaults to 'Menu'. */
    label?: string;
    /** Item density for `MenuItem`s inside. 'small' condenses the menu. Defaults to 'large'. */
    size?: 'small' | 'large';
}
declare const Menu: import("svelte").Component<Props, {}, "">;
type Menu = ReturnType<typeof Menu>;
export default Menu;
