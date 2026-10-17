/**
     * @component Checkbox
     * A styled native `<input type="checkbox">`. Form name/value, reset, required validation,
     * keyboard (Space) and screen-reader behaviour are the browser's own.
     */
import { type Snippet } from 'svelte';
import '../choice.css';
export interface Props {
    /** Whether the box is ticked. */
    checked?: boolean;
    /** Shows a dash instead of a tick, e.g. for a "select all" when only some items are chosen. */
    indeterminate?: boolean;
    /** Label text. Use `children` instead for rich content. */
    label?: string;
    /** Optional size override. Falls back to group context. */
    size?: 'small' | 'medium' | 'large';
    /** Submitted with the form when ticked. */
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
declare const Checkbox: import("svelte").Component<Props, {
    focus: () => void;
}, "checked" | "indeterminate">;
type Checkbox = ReturnType<typeof Checkbox>;
export default Checkbox;
