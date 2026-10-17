import { type Snippet } from 'svelte';
interface Props {
    children: Snippet;
    class?: string;
    /** Accessible name for the menu. */
    label?: string;
}
declare const MenuDesktop: import("svelte").Component<Props, {}, "">;
type MenuDesktop = ReturnType<typeof MenuDesktop>;
export default MenuDesktop;
