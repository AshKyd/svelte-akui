/**
     * @file
     * A lightweight, height-balanced masonry grid component for Svelte 5.
     * Packs grid items dynamically by placing each new item into the currently shortest column
     * to maintain a logical reading and tab focus order.
     * Supports pointer-based drag-and-drop rearrangement where cards remain stationary while dragging,
     * the hovered destination card displays a dotted outline drop indicator, and all cards rearrange
     * smoothly on drop.
     */
import { type Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import { type DragPayload } from '../../hooks/dropManager.svelte.js';
declare function $$render<T = any>(): {
    props: HTMLAttributes<HTMLDivElement> & {
        /** Spacing between grid items */
        gridGap?: string;
        /** Padding around the grid container */
        padding?: string;
        /** Column width specification */
        colWidth?: string;
        /** Svelte snippet containing grid items */
        children?: Snippet;
        /** Optional data items array for data-driven rendering with automatic reordering */
        items?: T[];
        /** Optional custom snippet for rendering each data item when `items` is provided */
        itemSnippet?: Snippet<[T, number]>;
        /** Optional key derivation function for `items` loop. Defaults to item.id or index. */
        getKey?: (item: T, index: number) => any;
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
        /** Enable pointer-based drag-and-drop rearrangement of grid items. Defaults to false. */
        reorderable?: boolean;
        /** Scale factor applied to the item while dragging. Defaults to 0.5. */
        dragScale?: number;
        /** Optional CSS selector targeting a specific drag handle element within an item. */
        dragHandleSelector?: string;
        /** Touch hold duration in milliseconds before initiating drag on touch devices. Defaults to 350. */
        longPressDelay?: number;
        /** Optional callback to construct a DragPayload for global drop targets */
        getDragPayload?: (item: T, index: number) => DragPayload;
        /** Callback invoked when an item is successfully dropped into a new position. */
        onreorder?: (detail: {
            fromIndex: number;
            toIndex: number;
            items?: T[];
        }) => void;
    };
    exports: {};
    bindings: "items" | "refreshLayout";
    slots: {};
    events: {};
};
declare class __sveltets_Render<T = any> {
    props(): ReturnType<typeof $$render<T>>['props'];
    events(): ReturnType<typeof $$render<T>>['events'];
    slots(): ReturnType<typeof $$render<T>>['slots'];
    bindings(): "items" | "refreshLayout";
    exports(): {};
}
interface $$IsomorphicComponent {
    new <T = any>(options: import('svelte').ComponentConstructorOptions<ReturnType<__sveltets_Render<T>['props']>>): import('svelte').SvelteComponent<ReturnType<__sveltets_Render<T>['props']>, ReturnType<__sveltets_Render<T>['events']>, ReturnType<__sveltets_Render<T>['slots']>> & {
        $$bindings?: ReturnType<__sveltets_Render<T>['bindings']>;
    } & ReturnType<__sveltets_Render<T>['exports']>;
    <T = any>(internal: unknown, props: ReturnType<__sveltets_Render<T>['props']> & {}): ReturnType<__sveltets_Render<T>['exports']>;
    z_$$bindings?: ReturnType<__sveltets_Render<any>['bindings']>;
}
declare const Masonry: $$IsomorphicComponent;
type Masonry<T = any> = InstanceType<typeof Masonry<T>>;
export default Masonry;
