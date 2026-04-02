interface Props {
    /** Value of the input. */
    value?: string | null;
    /** Placeholder text. */
    placeholder?: string;
    /** Optional size override. */
    size?: 'small' | 'medium' | 'large';
    /** Whether the input is disabled. */
    disabled?: boolean;
    /** Additional CSS classes for the input. */
    class?: string;
    /** Spread remaining attributes to the input element. */
    [key: string]: unknown;
}
declare const ClearableInput: import("svelte").Component<Props, {}, "value">;
type ClearableInput = ReturnType<typeof ClearableInput>;
export default ClearableInput;
