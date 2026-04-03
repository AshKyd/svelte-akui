import '../input.css';
export interface Props {
    /** Value of the password input. */
    value?: string | null;
    /** Placeholder text. */
    placeholder?: string;
    /** Optional size override. */
    size?: 'small' | 'medium' | 'large';
    /** Whether the field is required. */
    required?: boolean;
    /** Whether to show the visibility toggle. Defaults to true. */
    toggleable?: boolean;
    /** Whether the field is disabled. */
    disabled?: boolean;
    /** Additional CSS classes. */
    class?: string;
    /** Spread remaining attributes to the input element. */
    [key: string]: unknown;
}
declare const PasswordInput: import("svelte").Component<Props, {
    focus: () => void;
}, "value">;
type PasswordInput = ReturnType<typeof PasswordInput>;
export default PasswordInput;
