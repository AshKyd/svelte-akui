interface Props {
    /** Orientation of the divider. Defaults to horizontal */
    orientation?: 'horizontal' | 'vertical';
    class?: string;
}
declare const Divider: import("svelte").Component<Props, {}, "">;
type Divider = ReturnType<typeof Divider>;
export default Divider;
