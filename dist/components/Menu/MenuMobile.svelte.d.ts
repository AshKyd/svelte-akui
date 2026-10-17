import { type Snippet } from 'svelte';
interface Props {
    children: Snippet;
    class?: string;
    /** Accessible name for the menu. */
    label?: string;
}
declare const MenuMobile: import("svelte").Component<Props, {}, "">;
type MenuMobile = ReturnType<typeof MenuMobile>;
export default MenuMobile;
