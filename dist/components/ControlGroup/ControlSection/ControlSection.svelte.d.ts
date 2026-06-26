import { type Snippet } from 'svelte';
interface Props {
    /** The title/label of the section. */
    title: string;
    /** Optional icon name (Bootstrap Icon). */
    icon?: string;
    /** Optional icon snippet for custom icon rendering. */
    iconSnippet?: Snippet;
    /** The content of the section (e.g. ControlGroup, fields). */
    children: Snippet;
    /** Additional CSS classes. */
    class?: string;
    /** Spread remaining attributes. */
    [key: string]: unknown;
}
declare const ControlSection: import("svelte").Component<Props, {}, "">;
type ControlSection = ReturnType<typeof ControlSection>;
export default ControlSection;
