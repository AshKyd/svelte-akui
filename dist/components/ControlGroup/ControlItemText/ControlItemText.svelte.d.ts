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
    /** Whether the item is currently selected/active. */
    selected?: boolean;
    /** Whether the checkbox or radio is checked. */
    checked?: boolean;
    /** Optional control type on the right hand side. */
    controlType?: 'checkbox' | 'radio';
    /** Spread remaining attributes. */
    [key: string]: unknown;
}
declare const ControlItemText: import("svelte").Component<Props, {}, "checked">;
type ControlItemText = ReturnType<typeof ControlItemText>;
export default ControlItemText;
