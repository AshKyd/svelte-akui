import { type Snippet } from 'svelte';
interface Props {
    /** Optional icon name (Bootstrap Icon). */
    icon?: string;
    /** The text or content to display. */
    label?: string;
    /** Optional onclick handler. */
    onclick?: (event: MouseEvent) => void;
    /** Snippet for custom content (overrides label). */
    children?: Snippet;
    /** Additional CSS classes. */
    class?: string;
    /** Spread remaining attributes. */
    [key: string]: unknown;
}
declare const MenuItem: import("svelte").Component<Props, {}, "">;
type MenuItem = ReturnType<typeof MenuItem>;
export default MenuItem;
