import type { Snippet } from 'svelte';
declare function $$render<T extends {
    width: number;
    height: number;
    src?: string;
    alt?: string;
}>(): {
    props: {
        /** Array of items to display in the mosaic */
        items: T[];
        /** Minimum width for an item when auto-balancing (default: 200) */
        minWidth?: number;
        /** Gap between items in pixels (default: 8) */
        gap?: number;
        /** Explicit row sizes (e.g. [2, 1] means 2 items in first row, 1 in second, then repeat) */
        rows?: number[];
        /** Custom class for the container */
        class?: string;
        /** Custom style for the container */
        style?: string;
        /** Custom snippet to render each item */
        children?: Snippet<[T]>;
    };
    exports: {};
    bindings: "";
    slots: {};
    events: {};
};
declare class __sveltets_Render<T extends {
    width: number;
    height: number;
    src?: string;
    alt?: string;
}> {
    props(): ReturnType<typeof $$render<T>>['props'];
    events(): ReturnType<typeof $$render<T>>['events'];
    slots(): ReturnType<typeof $$render<T>>['slots'];
    bindings(): "";
    exports(): {};
}
interface $$IsomorphicComponent {
    new <T extends {
        width: number;
        height: number;
        src?: string;
        alt?: string;
    }>(options: import('svelte').ComponentConstructorOptions<ReturnType<__sveltets_Render<T>['props']>>): import('svelte').SvelteComponent<ReturnType<__sveltets_Render<T>['props']>, ReturnType<__sveltets_Render<T>['events']>, ReturnType<__sveltets_Render<T>['slots']>> & {
        $$bindings?: ReturnType<__sveltets_Render<T>['bindings']>;
    } & ReturnType<__sveltets_Render<T>['exports']>;
    <T extends {
        width: number;
        height: number;
        src?: string;
        alt?: string;
    }>(internal: unknown, props: ReturnType<__sveltets_Render<T>['props']> & {}): ReturnType<__sveltets_Render<T>['exports']>;
    z_$$bindings?: ReturnType<__sveltets_Render<any>['bindings']>;
}
declare const ImageMosaic: $$IsomorphicComponent;
type ImageMosaic<T extends {
    width: number;
    height: number;
    src?: string;
    alt?: string;
}> = InstanceType<typeof ImageMosaic<T>>;
export default ImageMosaic;
