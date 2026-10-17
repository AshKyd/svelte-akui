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
    /** Item density. Defaults to the parent `Menu`'s `size`. */
    size?: 'small' | 'large';
    /**
     * Shows a checkbox or radio on the right and gives the item the matching ARIA role
     * (`menuitemcheckbox` / `menuitemradio`) and `aria-checked`.
     */
    controlType?: 'checkbox' | 'radio';
    /** Whether the checkbox or radio is checked. Only used with `controlType`. */
    checked?: boolean;
    /** Shows the keyboard focus style without DOM focus (see `ControlItemText`). */
    highlighted?: boolean;
    /** Additional CSS classes. */
    class?: string;
    /** Spread remaining attributes. */
    [key: string]: unknown;
}
declare const MenuItem: import("svelte").Component<Props, {}, "">;
type MenuItem = ReturnType<typeof MenuItem>;
export default MenuItem;
