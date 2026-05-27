interface Props {
    /** Image source URL */
    src: string;
    /** Accessible description */
    alt?: string;
    /**
     * Fit mode:
     * - 'cover': Fills container, may crop
     * - 'contain': Shows full image, may have bars
     * - 'auto': Smart choice based on aspect ratio difference
     */
    fit?: 'cover' | 'contain' | 'auto';
    /** Aspect ratio difference threshold for 'auto' fit (0.0 to 1.0) */
    threshold?: number;
    /** Border radius of the image container. Defaults to '2px'. */
    radius?: string | number;
    /** Loading handler */
    onload?: (dims: {
        width: number;
        height: number;
        ratio: number;
    }) => void;
    /** Error handler */
    onerror?: (err: any) => void;
    /** Additional CSS classes */
    class?: string;
    /** Style overrides */
    style?: string;
}
declare const DynamicImage: import("svelte").Component<Props, {}, "">;
type DynamicImage = ReturnType<typeof DynamicImage>;
export default DynamicImage;
