/**
 * @component Loader
 * A versatile circular spinner component for standalone use.
 */
interface Props {
    /** Size of the spinner (e.g. "1.5rem", "24px", 20) */
    size?: string | number;
    /** Colour of the spinner. Defaults to "currentColor". */
    colour?: string;
    /** Accessible label for the spinner. */
    label?: string;
    /** Additional CSS classes */
    class?: string;
    /** Spread remaining attributes to the container */
    [key: string]: unknown;
}
declare const Loader: import("svelte").Component<Props, {}, "">;
type Loader = ReturnType<typeof Loader>;
export default Loader;
