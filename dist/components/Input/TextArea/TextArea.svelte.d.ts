import '../input.css';
export interface Props {
    /** Value of the textarea. */
    value?: string | null;
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
    /** Additional CSS classes for the textarea. */
    class?: string;
    /** Spread remaining attributes to the textarea element. */
    [key: string]: unknown;
}
declare const TextArea: import("svelte").Component<Props, {}, "value">;
type TextArea = ReturnType<typeof TextArea>;
export default TextArea;
