import '../input.css';
interface Props {
    /** Array of selected string values. */
    value?: string[];
    /** Suggestion list for the typeahead. */
    values?: {
        value: string;
        label: string;
    }[];
    /** Whether to allow arbitrary text values not in the suggestions. */
    allowFreetext?: boolean;
    /** Placeholder text shown when empty. */
    placeholder?: string;
    /** Whether the field is disabled. */
    disabled?: boolean;
    /** Size of the field. */
    size?: 'small' | 'medium' | 'large';
    /** Variant of the field. */
    variant?: 'regular' | 'ghost';
    /** Label text (used for aria-labelledby). */
    label?: string;
    /** Callback when values change. */
    onChange?: (value: string[]) => void;
    /** Additional CSS classes for the container. */
    class?: string;
    /** ID for the input and datalist. */
    id?: string;
}
declare const Typeahead: import("svelte").Component<Props, {}, "value">;
type Typeahead = ReturnType<typeof Typeahead>;
export default Typeahead;
