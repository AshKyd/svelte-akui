/**
     * @component Radio
     * A styled native `<input type="radio">`. Radios sharing a `name` form one group with the
     * browser's own arrow-key navigation. Bind `group` to the selected `value`.
     */
import { type Snippet } from 'svelte';
import '../choice.css';
export interface Props {
    /** The `value` of the selected radio in the group. Use with `bind:group`. */
    group?: string;
    /** Submitted with the form when selected. Required. */
    value: string;
    /** Label text. Use `children` instead for rich content. */
    label?: string;
    /** Optional size override. Falls back to group context. */
    size?: 'small' | 'medium' | 'large';
    /** Form field name. Radios sharing a `name` form one group. */
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
declare const Radio: import("svelte").Component<Props, {
    focus: () => void;
}, "group">;
type Radio = ReturnType<typeof Radio>;
export default Radio;
