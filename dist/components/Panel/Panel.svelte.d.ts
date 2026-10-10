import { type Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import { type SurfaceStyle } from '../../utils/surface.js';
interface Props extends HTMLAttributes<HTMLElement> {
    /** The background colour of the panel. */
    colour?: 'regular' | 'secondary' | 'accent';
    /** The content to render inside the panel. */
    children: Snippet;
    /** Additional CSS classes for the panel. */
    class?: string;
    /** Style overrides. */
    style?: string;
    /** Overrides the panel's background, text colour, border colour and backdrop filter, e.g. a translucent background to show the page behind. */
    surface?: SurfaceStyle;
    /** The corner radius of the panel. Defaults to 'regular'. 'full' is infinite (circular). */
    radius?: 'regular' | 'full';
    /** The HTML element to use. Defaults to 'div'. */
    tag?: keyof HTMLElementTagNameMap;
}
declare const Panel: import("svelte").Component<Props, {}, "">;
type Panel = ReturnType<typeof Panel>;
export default Panel;
