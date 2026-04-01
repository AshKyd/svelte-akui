import { type Snippet } from 'svelte';
interface Props {
    /** Content to render inside the tooltip. Usually includes a <Padding> component. */
    children: Snippet;
    /** Whether the tooltip is currently visible. */
    visible?: boolean;
    /** Explicit X position. */
    x?: number;
    /** Explicit Y position. */
    y?: number;
    /** Arrow/Popover position relative to the source. */
    position?: 'top' | 'bottom' | 'left' | 'right';
    /** Border radius size ('s', 'm', 'l', etc.). Defaults to 's'. */
    radius?: string;
    /** Additional CSS classes. */
    class?: string;
    /** Style overrides. */
    style?: string;
}
declare const Tooltip: import("svelte").Component<Props, {}, "">;
type Tooltip = ReturnType<typeof Tooltip>;
export default Tooltip;
