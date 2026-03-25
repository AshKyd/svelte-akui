/**
 * @component LoaderOverlay
 * A centered loader overlay component for containers or full-page coverage.
 */
interface Props {
    /** Size of the spinner within the overlay. Defaults to '2rem'. */
    size?: string | number;
    /** Colour of the spinner. Defaults to 'var(--akui-bg-accent)'. */
    colour?: string;
    /** Accessible label for the spinner. */
    label?: string;
    /** Backdrop opacity (0 to 1). Defaults to 0.7. */
    opacity?: number;
    /** Backdrop colour. Defaults to "var(--akui-bg)". */
    backdrop?: string;
    /** Additional CSS classes */
    class?: string;
    /** Spread remaining attributes to the container */
    [key: string]: unknown;
}
declare const LoaderOverlay: import("svelte").Component<Props, {}, "">;
type LoaderOverlay = ReturnType<typeof LoaderOverlay>;
export default LoaderOverlay;
