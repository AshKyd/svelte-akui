import { type Snippet } from 'svelte';
interface Props {
    /** The max-width size option. Defaults to 'medium' (680px). */
    size?: 'small' | 'medium' | 'large';
    /** Content to render inside the layout. */
    children?: Snippet;
    /** Additional CSS classes. */
    class?: string;
    /** Spread remaining attributes. */
    [key: string]: unknown;
}
declare const LayoutContentWidth: import("svelte").Component<Props, {}, "">;
type LayoutContentWidth = ReturnType<typeof LayoutContentWidth>;
export default LayoutContentWidth;
