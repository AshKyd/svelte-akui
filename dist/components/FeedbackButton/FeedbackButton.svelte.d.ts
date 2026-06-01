import { type Snippet } from 'svelte';
interface Props {
    /** Optional URL to turn this button into a link. */
    href?: string;
    /** Is this the principal call to action? */
    variant?: 'regular' | 'accent' | 'ghost';
    /** How large should the button be? */
    size?: 'small' | 'medium' | 'large';
    radius?: 'regular' | 'full';
    /** Button contents (ignored if iconPosition is 'only') */
    label?: string;
    /** The name of the icon to display */
    icon?: string;
    /** Where to place the icon relative to the text */
    iconPosition?: 'left' | 'right' | 'only';
    /** The content to render inside the button (overrides label) */
    children?: Snippet;
    /** Bindable reference to the underlying element. */
    element?: HTMLElement;
    /** The current status of the feedback button. Can be bound to. */
    status?: 'idle' | 'loading' | 'success' | 'error';
    /** Success icon name. Defaults to 'check2'. */
    successIcon?: string;
    /** Error icon name. Defaults to 'exclamation-circle'. */
    errorIcon?: string;
    /** How long to show the success/error state before resetting back to idle (in ms). Defaults to 2000. */
    resetDelay?: number;
    /** Label to read when success is reached. Defaults to 'Success'. */
    successAriaLabel?: string;
    /** Label to read when error is reached. Defaults to 'Error'. */
    errorAriaLabel?: string;
    /** Label to read when loading is reached. Defaults to 'Loading'. */
    loadingAriaLabel?: string;
    /** The onclick event handler. If it returns a Promise, status is managed automatically. */
    onclick?: (event: MouseEvent) => void | Promise<unknown>;
    /** Additional CSS classes for the button. */
    class?: string;
    /** Spread remaining attributes to the element. */
    [key: string]: unknown;
}
declare const FeedbackButton: import("svelte").Component<Props, {}, "status" | "element">;
type FeedbackButton = ReturnType<typeof FeedbackButton>;
export default FeedbackButton;
