import { type Snippet } from 'svelte';
interface Props {
    /** The background colour of the panel. */
    colour?: 'regular' | 'secondary' | 'accent';
    /** The content to render inside the panel. */
    children: Snippet;
    /** Additional CSS classes for the panel. */
    class?: string;
}
declare const Panel: import("svelte").Component<Props, {}, "">;
type Panel = ReturnType<typeof Panel>;
export default Panel;
