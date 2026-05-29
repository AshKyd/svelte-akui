import type { Snippet } from 'svelte';
interface Props {
    /** Minimum width (in pixels) for the container to show both panes. Defaults to 768. */
    minWidth?: number;
    /** The route ID that represents the root/list view. */
    baseRouteId: string;
    /** The currently active route ID to compare against baseRouteId. */
    currentRouteId: string;
    /** Whether to hide the nested pane on desktop when no item is selected (i.e. at base route). Defaults to false. */
    hideNestedWhenEmpty?: boolean;
    /** Snippet for the main pane (e.g. List). Passes transition state details. */
    mainPane?: Snippet<[{
        isStacked: boolean;
    }]>;
    /** Snippet for the nested pane (e.g. Detail/Reader). Passes transition state details. */
    nestedPane?: Snippet<[{
        isStacked: boolean;
    }]>;
}
declare const AdaptivePane: import("svelte").Component<Props, {}, "">;
type AdaptivePane = ReturnType<typeof AdaptivePane>;
export default AdaptivePane;
