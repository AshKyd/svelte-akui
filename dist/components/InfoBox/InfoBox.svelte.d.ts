import type { Snippet } from 'svelte';
interface Props {
    /** The variant of the info box. */
    variant?: 'info' | 'warning' | 'error';
    /** Optional icon name. */
    icon?: string;
    /** Optional custom icon snippet. */
    iconSnippet?: Snippet;
    /** Optional title text. */
    title?: string | Snippet;
    /** Optional trailing action snippet. */
    action?: Snippet;
    /** Main content for the info box. */
    children?: Snippet;
    /** Additional CSS classes. */
    class?: string;
    /** Spread remaining attributes. */
    [key: string]: unknown;
}
declare const InfoBox: import("svelte").Component<Props, {}, "">;
type InfoBox = ReturnType<typeof InfoBox>;
export default InfoBox;
