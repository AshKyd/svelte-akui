interface Props {
    /** Current value of the progress bar (0 to max) */
    value: number;
    /** Maximum value (defaults to 1) */
    max?: number;
    /** The color of the progress bar fill */
    colour?: 'accent' | 'blue' | 'green' | 'orange' | 'pink' | 'purple' | 'amber';
    /** The size of the progress bar */
    size?: 'small' | 'medium' | 'large';
    /** Additional CSS classes for the container */
    class?: string;
}
declare const ProgressBar: import("svelte").Component<Props, {}, "">;
type ProgressBar = ReturnType<typeof ProgressBar>;
export default ProgressBar;
