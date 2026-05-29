import { type Snippet } from 'svelte';
interface Props {
    /** The individual NavigationBarItem elements. */
    children: Snippet;
    /** Additional CSS classes for the navigation bar container. */
    class?: string;
}
declare const NavigationBar: import("svelte").Component<Props, {}, "">;
type NavigationBar = ReturnType<typeof NavigationBar>;
export default NavigationBar;
