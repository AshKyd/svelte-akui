import { type Snippet } from 'svelte';
import '../input.css';
export interface Props {
    /** Label for the field. */
    label?: string;
    /** Optional hint text below the field. */
    hint?: string;
    /** Whether the field is required. */
    required?: boolean;
    /** The input control to render inside the field. */
    children: Snippet;
    /** ID of the input element (for label association). */
    for?: string;
    /** Additional CSS classes for the container. */
    class?: string;
    /** Inline styles for the container. */
    style?: string;
}
declare const Field: import("svelte").Component<Props, {}, "">;
type Field = ReturnType<typeof Field>;
export default Field;
