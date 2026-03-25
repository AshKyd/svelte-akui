interface Props {
    /** Vertical margin size. */
    margin?: 'none' | 's' | 'm' | 'l';
    /** Additional CSS classes. */
    class?: string;
    /** Spread remaining attributes. */
    [key: string]: unknown;
}
declare const Divider: import("svelte").Component<Props, {}, "">;
type Divider = ReturnType<typeof Divider>;
export default Divider;
