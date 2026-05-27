import { type Snippet } from 'svelte';
interface Props {
    /** Accepted file types (e.g. 'image/*', '.pdf') */
    accept?: string;
    /** Allow selecting multiple files */
    multiple?: boolean;
    /** Visual variant style */
    variant?: 'regular' | 'accent' | 'ghost';
    /** Size of the button */
    size?: 'small' | 'medium' | 'large';
    /** Border radius style */
    radius?: 'regular' | 'full';
    /** Label text */
    label?: string;
    /** The name of the icon to display */
    icon?: string;
    /** Position of the icon relative to text */
    iconPosition?: 'left' | 'right' | 'only';
    /** Show a loading spinner and disable interaction */
    loading?: boolean;
    /** Disable the button */
    disabled?: boolean;
    /** Custom CSS classes */
    class?: string;
    /** Bindable reference to the underlying button element. */
    element?: HTMLButtonElement | HTMLAnchorElement;
    /** Callback triggered when files are selected */
    onchange?: (files: File[]) => void;
    /** Snippet content to override label */
    children?: Snippet;
    /** Spread remaining attributes to the hidden file input. */
    [key: string]: unknown;
}
declare const FilePicker: import("svelte").Component<Props, {}, "element">;
type FilePicker = ReturnType<typeof FilePicker>;
export default FilePicker;
