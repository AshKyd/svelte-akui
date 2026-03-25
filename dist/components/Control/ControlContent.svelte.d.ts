import { type Snippet } from 'svelte';
interface Props {
    /** The custom content to render. */
    children: Snippet;
    /** Padding size. Defaults to 'm'. */
    size?: 'none' | 's' | 'm' | 'l';
    /** Additional CSS classes. */
    class?: string;
    /** Spread remaining attributes. */
    [key: string]: unknown;
}
declare const ControlContent: import("svelte").Component<Props, {}, "">;
type ControlContent = ReturnType<typeof ControlContent>;
export default ControlContent;
