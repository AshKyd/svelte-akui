import { type Snippet } from 'svelte';
interface Props {
    /** The background colour of the panel. */
    colour?: 'regular' | 'secondary' | 'accent';
    /** The content to render inside the panel. */
    children: Snippet;
    /** Additional CSS classes for the panel. */
    class?: string;
    /** Style overrides. */
    style?: string;
    /** The corner radius of the panel. Defaults to 'regular'. 'full' is infinite (circular). */
    radius?: 'regular' | 'full';
}
declare const Panel: import("svelte").Component<Props, {}, "">;
type Panel = ReturnType<typeof Panel>;
export default Panel;
