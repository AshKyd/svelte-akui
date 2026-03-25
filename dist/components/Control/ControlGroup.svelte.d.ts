import { type Snippet } from 'svelte';
interface Props {
    /** The control items (buttons, dividers, content). */
    children: Snippet;
    /** ARIA role. Defaults to 'menu' if used in a menu. */
    role?: string;
    /** Additional CSS classes. */
    class?: string;
    /** Spread remaining attributes. */
    [key: string]: unknown;
}
declare const ControlGroup: import("svelte").Component<Props, {}, "">;
type ControlGroup = ReturnType<typeof ControlGroup>;
export default ControlGroup;
