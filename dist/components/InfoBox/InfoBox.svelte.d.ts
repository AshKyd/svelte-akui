import { type Snippet } from 'svelte';
interface Props {
    /** The HTML element to use. Defaults to 'aside'. */
    tag?: keyof HTMLElementTagNameMap;
    /** The ARIA role. */
    role?: string;
    /** The variant of the info box. */
    variant?: 'info' | 'success' | 'warning' | 'error' | 'message';
    /** Whether to show the icon. If false, retains spacing. */
    showIcon?: boolean;
    /** Whether to strip outer borders and shadows for list usage. */
    naked?: boolean;
    /** Optional icon name override. */
    icon?: string;
    /** Optional custom icon snippet. */
    iconSnippet?: Snippet;
    /** Optional title text or snippet. */
    title?: string | Snippet;
    /** Optional trailing action snippet. */
    action?: Snippet;
    /** Main content for the info box. */
    children?: Snippet;
    /** Additional CSS classes. */
    class?: string;
    /** Optional callback for dismissing the info box. */
    onClose?: () => void;
    /** Spread remaining attributes. */
    [key: string]: unknown;
}
declare const InfoBox: import("svelte").Component<Props, {}, "">;
type InfoBox = ReturnType<typeof InfoBox>;
export default InfoBox;
