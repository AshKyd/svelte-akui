/**
     * @file
     * A lightweight, height-balanced masonry grid component for Svelte 5.
     * Packs grid items dynamically by placing each new item into the currently shortest column
     * to maintain a logical reading and tab focus order.
     * Layout only — dragging and reordering are a consumer concern: wrap items in `<Draggable>`
     * and add `<DropTarget>`s (or `dropTarget()` attachments) to build reorder or move behaviour.
     */
import { type Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
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
        /** Optional data items array for data-driven rendering */
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
