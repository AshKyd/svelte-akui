import { type Snippet } from 'svelte';
interface Props {
    /** The content to render inside the menu. */
    menu: Snippet;
    /** The content to render inside the button. */
    children?: Snippet;
    /** The menu's origin relative to the button. */
    origin?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    /** All other props are forwarded to the Button component. */
    [key: string]: unknown;
}
declare const MenuButton: import("svelte").Component<Props, {}, "">;
type MenuButton = ReturnType<typeof MenuButton>;
export default MenuButton;
