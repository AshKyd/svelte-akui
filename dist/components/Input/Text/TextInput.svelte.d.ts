import '../input.css';
export interface Props {
    /** Type of input (text, email, password, tel, url, search, number, date, color). Defaults to 'text'. */
    type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search' | 'number' | 'date' | 'color';
    /** Value of the input. */
    value?: string | number | null;
    /** Placeholder text. */
    placeholder?: string;
    /** Optional size override. Falls back to group context. */
    size?: 'small' | 'medium' | 'large';
    /** Whether the field is required. */
    required?: boolean;
    /** Whether the field is readonly. */
    readonly?: boolean;
    /** Whether the field is disabled. */
    disabled?: boolean;
    /** Additional CSS classes for the input. */
    class?: string;
    /** Spread remaining attributes to the input element. */
    [key: string]: unknown;
}
declare const TextInput: import("svelte").Component<Props, {}, "value">;
type TextInput = ReturnType<typeof TextInput>;
export default TextInput;
