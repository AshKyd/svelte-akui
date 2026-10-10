import type { Snippet } from 'svelte';
import { type SurfaceStyle } from '../../utils/surface.js';
interface Props {
    /** Minimum width (in pixels) for the container to show both panes. Defaults to 768. */
    minWidth?: number;
    /** The route ID that represents the root/list view. */
    baseRouteId: string;
    /** The currently active route ID to compare against baseRouteId. */
    currentRouteId: string;
    /** Whether to hide the nested pane on desktop when no item is selected (i.e. at base route). Defaults to false. */
    hideNestedWhenEmpty?: boolean;
    /** How the nested pane occupies space on desktop: 'resize' shrinks the main pane to make room, 'over' draws the nested pane on top of it. Defaults to 'resize'. */
    paneMode?: 'resize' | 'over';
    /** Called when a click lands outside the overlaid nested pane, in 'over' mode only. */
    onDismiss?: () => void;
    /** Snippet for the main pane (e.g. List). Passes transition state details. */
    mainPane?: Snippet<[{
        isStacked: boolean;
    }]>;
    /** Snippet for the nested pane (e.g. Detail/Reader). Passes transition state details. */
    nestedPane?: Snippet<[{
        isStacked: boolean;
    }]>;
    /** Bindable position (in pixels) of the divider on desktop. In 'resize' mode this is the main pane's width; in 'over' mode the main pane stays full width and this is where the nested pane's left edge sits. Defaults to 400. */
    mainPaneWidth?: number;
    /** Minimum allowed width for the main pane. Defaults to 400. */
    minMainPaneWidth?: number;
    /** Maximum allowed width for the main pane. Defaults to Infinity. */
    maxMainPaneWidth?: number;
    /** Minimum allowed width for the nested detail pane on desktop. Defaults to 400. */
    minNestedPaneWidth?: number;
    /** Overrides the background of the container and the main pane (e.g. 'transparent' to show an app background). The nested pane stays opaque so it covers the main pane in 'over' mode. */
    surface?: SurfaceStyle;
    /**
     * Page background drawn behind the nested pane on the desktop split, e.g. the same background the app uses.
     * It is sized to the whole window and offset so it lines up with the page behind at rest, and it is part of
     * the pane, so it slides with it and is composited once instead of blurring the list every frame.
     * Not drawn when stacked, where the pane stays opaque. Content inside should not paint its own solid background.
     */
    nestedBackdrop?: Snippet;
}
declare const LayoutAdaptivePane: import("svelte").Component<Props, {}, "mainPaneWidth">;
type LayoutAdaptivePane = ReturnType<typeof LayoutAdaptivePane>;
export default LayoutAdaptivePane;
