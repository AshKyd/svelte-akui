import type { Snippet } from 'svelte';
export type DetailsTableSortDirection = 'asc' | 'desc';
export interface DetailsTableSort {
    /** `key` of the column being sorted. */
    key: string;
    direction: DetailsTableSortDirection;
}
export interface DetailsTableColumn<T> {
    /** Unique key. Also the row property read for display and sorting unless `value` is set. */
    key: string;
    /** Label shown in the header. */
    label: string;
    /** Whether clicking the header sorts by this column. */
    sortable?: boolean;
    /** Alignment of the cell content. */
    align?: 'left' | 'center' | 'right';
    /** CSS grid track size, e.g. `12rem` or `minmax(8rem, 2fr)`. Defaults to an equal share. */
    width?: string;
    /** Reads the value used for display and local sorting. Defaults to `row[key]`. */
    value?: (row: T) => unknown;
    /** Renders this column's cell. Overrides the table-wide `cell` snippet. */
    cell?: Snippet<[T, number]>;
    /** Renders this column's header content. Overrides the label. */
    header?: Snippet<[DetailsTableColumn<T>, DetailsTableSort | null]>;
    /** Leave this column out of the list layout (used on narrow screens). */
    hideInList?: boolean;
    /** CSS width of this column's value in the list layout, so buttons and bars match on every card. */
    listWidth?: string;
    /** Lets the user drag the header's right edge (or use arrow keys on it) to resize this column. */
    resizable?: boolean;
    /** Smallest width in px this column can be resized to. Defaults to 48. */
    minWidth?: number;
    /** Largest width in px this column can be resized to. */
    maxWidth?: number;
}
declare function $$render<T>(): {
    props: {
        /** Rows loaded so far. */
        rows: T[];
        /** Column configuration. */
        columns: DetailsTableColumn<T>[];
        /** Stable unique key per row, so cell state survives scrolling and re-sorting. */
        rowKey: (row: T) => string;
        /** Text and row size, matching `Tree`. */
        size?: "small" | "large";
        /** Fixed row height in px, overriding the `size` default. Every row must be this height so rows can be windowed. Table layout only. */
        rowHeight?: number;
        /**
         * `table` is a grid with column headers; `list` is one card per row with sorting in a menu.
         * `auto` uses the list when the component is narrower than `stackBelow`.
         */
        layout?: "auto" | "table" | "list";
        /** Width in px below which `layout="auto"` switches to the list. Measured on the component, not the window. */
        stackBelow?: number;
        /** Column shown as the card title in the list layout. Defaults to the first column. */
        titleKey?: string;
        /** Show each column's label beside its value in the list layout. */
        listLabels?: boolean;
        /** Height in px of each line of a list card, overriding the `size` default. Raise it for tall controls. */
        listLineHeight?: number;
        /** Extra rows rendered above and below the viewport. */
        overscan?: number;
        /** CSS height of the scroll area. Omit to fill the parent. */
        height?: string;
        /** Current sort. With `onsortchange` the consumer re-sorts or re-fetches; without it the table sorts the loaded rows. */
        sort?: DetailsTableSort | null;
        /** Called when a header is clicked. Use this when `rows` is paged, since a locally sorted page is wrong. */
        onsortchange?: (sort: DetailsTableSort) => void;
        /** Widths in px the user has dragged resizable columns to, by column `key`. Save and restore it to remember them. */
        columnWidths?: Record<string, number>;
        /** Called when a column is resized, with its key and new width in px, or `null` when reset to its default. */
        oncolumnresize?: (key: string, width: number | null) => void;
        /** Start loading the next page when this many rows remain below the visible ones. */
        loadAheadRows?: number;
        /** Draw the outer border, corner radius and sunken shadow. Turn off to sit flush in an existing panel. */
        border?: boolean;
        /** Draw lines between rows and between header columns. Turn off for a cleaner list. */
        showLines?: boolean;
        /** Whether more rows can be loaded. */
        hasMore?: boolean;
        /** Whether a page is loading. */
        isLoading?: boolean;
        /** Called when the end of the list nears. Should append rows to `rows`. */
        onloadmore?: () => Promise<void>;
        /** Keys of the selected rows. */
        selected?: Set<string>;
        /** Called when a row is clicked or activated with Enter. */
        onrowclick?: (row: T, event: MouseEvent | KeyboardEvent) => void;
        /** Extra class for a row, e.g. to dim archived items. */
        rowClass?: (row: T) => string | undefined;
        /** Table-wide cell renderer, used by columns without their own `cell`. */
        cell?: Snippet<[T, DetailsTableColumn<T>, number]>;
        /** Shown when there are no rows. */
        emptyState?: Snippet;
        /** Shown at the bottom while `isLoading`. */
        loadingRow?: Snippet;
        /** Additional CSS classes. */
        class?: string;
        /** Accessible name for the table. */
        'aria-label'?: string;
    };
    exports: {};
    bindings: "sort" | "selected" | "columnWidths";
    slots: {};
    events: {};
};
declare class __sveltets_Render<T> {
    props(): ReturnType<typeof $$render<T>>['props'];
    events(): ReturnType<typeof $$render<T>>['events'];
    slots(): ReturnType<typeof $$render<T>>['slots'];
    bindings(): "sort" | "selected" | "columnWidths";
    exports(): {};
}
interface $$IsomorphicComponent {
    new <T>(options: import('svelte').ComponentConstructorOptions<ReturnType<__sveltets_Render<T>['props']>>): import('svelte').SvelteComponent<ReturnType<__sveltets_Render<T>['props']>, ReturnType<__sveltets_Render<T>['events']>, ReturnType<__sveltets_Render<T>['slots']>> & {
        $$bindings?: ReturnType<__sveltets_Render<T>['bindings']>;
    } & ReturnType<__sveltets_Render<T>['exports']>;
    <T>(internal: unknown, props: ReturnType<__sveltets_Render<T>['props']> & {}): ReturnType<__sveltets_Render<T>['exports']>;
    z_$$bindings?: ReturnType<__sveltets_Render<any>['bindings']>;
}
declare const DetailsTable: $$IsomorphicComponent;
type DetailsTable<T> = InstanceType<typeof DetailsTable<T>>;
export default DetailsTable;
