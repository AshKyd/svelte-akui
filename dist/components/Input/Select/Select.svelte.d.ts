import '../input.css';
export interface Props {
    /** Value of the select. */
    value?: string | number | null;
    /** Options to display in the select. */
    options?: Array<{
        value: string;
        label: string;
        disabled?: boolean;
    }>;
    /** Placeholder text (shown as disabled first option). */
    placeholder?: string;
    /** Optional size override. Falls back to group context. */
    size?: 'small' | 'medium' | 'large';
    /** Whether the field is disabled. */
    disabled?: boolean;
    /** Additional CSS classes for the select. */
    class?: string;
    /** Spread remaining attributes to the select element. */
    [key: string]: unknown;
}
declare const Select: import("svelte").Component<Props, {}, "value">;
type Select = ReturnType<typeof Select>;
export default Select;
