import { type Snippet } from 'svelte';
interface Props {
    /** The content to render inside the menu. */
    menu: Snippet;
    /** The content to render inside the button. */
    children?: Snippet;
    /** The menu's origin relative to the button. */
    origin?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    /** Whether the menu is open. Bindable, e.g. to change the button icon while open. */
    open?: boolean;
    /** How the menu is shown. 'auto' picks a popover on wide screens and a bottom sheet on narrow ones. */
    presentation?: 'auto' | 'popover' | 'sheet';
    /** All other props are forwarded to the Button component. */
    [key: string]: unknown;
}
declare const MenuButton: import("svelte").Component<Props, {}, "open">;
type MenuButton = ReturnType<typeof MenuButton>;
export default MenuButton;
