/**
 * @component Icon
 * A component for rendering Bootstrap Icons with automatic code splitting.
 */
interface Props {
    /** The name of the Bootstrap Icon (e.g. "trash", "search") */
    name: string;
    /**
     * Accessible label for the icon.
     * If provided, the icon will have role="img" and aria-label.
     * If omitted, the icon will be hidden from screen readers (decorative).
     */
    alt?: string;
    /** Size of the icon (e.g. "1.5rem", "24px", 20) */
    size?: string | number;
    /** Colour of the icon. Defaults to "currentColor". */
    colour?: string;
    /** Additional CSS classes */
    class?: string;
    /** Spread remaining attributes to the container */
    [key: string]: unknown;
}
declare const Icon: import("svelte").Component<Props, {}, "">;
type Icon = ReturnType<typeof Icon>;
export default Icon;
