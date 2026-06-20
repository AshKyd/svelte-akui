/**
     * @file
     * A lightweight, height-balanced masonry grid component for Svelte 5.
     * Packs grid items dynamically by placing each new item into the currently shortest column
     * to maintain a logical reading and tab focus order.
     * This file was inspired by https://github.com/janzheng/svelte-masonry which in turn was
     * inspired by from Ana Tudor via CSS tricks.
     */
import { type Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
    /** Spacing between grid items */
    gridGap?: string;
    /** Padding around the grid container */
    padding?: string;
    /** Column width specification */
    colWidth?: string;
    /** Svelte snippet containing grid items */
    children?: Snippet;
    /** Bindable function to manually trigger a relayout */
    refreshLayout?: () => Promise<void>;
    /** Allow the layout to recalculate on resize. Defaults to true. */
    allowResize?: boolean;
    /** Enable smooth slide transitions when items change position. Defaults to false. */
    animate?: boolean;
    /** Duration of the slide transition animation */
    transitionDuration?: string;
    /** Easing function of the slide transition animation */
    transitionEasing?: string;
}
declare const Masonry: import("svelte").Component<Props, {}, "refreshLayout">;
type Masonry = ReturnType<typeof Masonry>;
export default Masonry;
