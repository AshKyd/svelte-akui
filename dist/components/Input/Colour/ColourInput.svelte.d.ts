import '../input.css';
export interface Props {
    /** Value of the colour input (hex string). */
    value?: string | null;
    /** Placeholder text. Defaults to '#000000'. */
    placeholder?: string;
    /** Optional size override. Falls back to group context. */
    size?: 'small' | 'medium' | 'large';
    /** Whether the field is required. */
    required?: boolean;
    /** Whether the field is disabled. */
    disabled?: boolean;
    /** Whether the field is readonly. */
    readonly?: boolean;
    /** Additional CSS classes. */
    class?: string;
    /** Spread remaining attributes to the input element. */
    [key: string]: unknown;
}
declare const ColourInput: import("svelte").Component<Props, {}, "value">;
type ColourInput = ReturnType<typeof ColourInput>;
export default ColourInput;
