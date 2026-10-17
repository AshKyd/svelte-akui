/**
     * @component Toggle
     * An on/off switch built on a native `<input type="checkbox" role="switch">`, so it submits
     * with forms, resets and responds to Space like a checkbox while being announced as a switch.
     */
import { type Snippet } from 'svelte';
import '../choice.css';
export interface Props {
    /** Whether the switch is on. */
    checked?: boolean;
    /** Label text. Use `children` instead for rich content. */
    label?: string;
    /** Optional size override. Falls back to group context. */
    size?: 'small' | 'medium' | 'large';
    /** Submitted with the form when on. */
    value?: string;
    /** Form field name. */
    name?: string;
    /** Whether the field is required. */
    required?: boolean;
    /** Whether the field is disabled. */
    disabled?: boolean;
    /** Additional CSS classes for the outer label. */
    class?: string;
    /** Rich label content, shown instead of `label`. */
    children?: Snippet;
    /** Spread remaining attributes to the input element. */
    [key: string]: unknown;
}
declare const Toggle: import("svelte").Component<Props, {
    focus: () => void;
}, "checked">;
type Toggle = ReturnType<typeof Toggle>;
export default Toggle;
