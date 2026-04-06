import { type Snippet } from 'svelte';
interface Props {
    /** Optional URL to turn this button into a link. */
    href?: string;
    /** Is this the principal call to action? */
    variant?: 'regular' | 'accent';
    /** How large should the button be? */
    size?: 'small' | 'medium' | 'large';
    radius?: 'regular' | 'full';
    /** Button contents (ignored if iconPosition is 'only') */
    label?: string;
    /** The name of the icon to display */
    icon?: string;
    /** Where to place the icon relative to the text */
    iconPosition?: 'left' | 'right' | 'only';
    /** Should a loading spinner be shown? (Disables interaction) */
    loading?: boolean;
    /** The content to render inside the button (overrides label) */
    children?: Snippet;
    /** The onclick event handler */
    onclick?: (event: MouseEvent) => void;
    /** Additional CSS classes for the button. */
    class?: string;
    /** Bindable reference to the underlying element. */
    element?: HTMLElement;
    /** Spread remaining attributes to the element. */
    [key: string]: unknown;
}
declare const Button: import("svelte").Component<Props, {}, "element">;
type Button = ReturnType<typeof Button>;
export default Button;
