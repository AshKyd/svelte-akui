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
    /** ARIA role. Defaults to 'menuitem' if inside a menu. */
    role?: string;
    /** Additional CSS classes. */
    class?: string;
    /** Spread remaining attributes. */
    [key: string]: unknown;
}
declare const ControlItem: import("svelte").Component<Props, {}, "">;
type ControlItem = ReturnType<typeof ControlItem>;
export default ControlItem;
