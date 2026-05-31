import { type Snippet } from 'svelte';
export interface TableColumn {
    /** Unique key matching a property name in the row data. */
    key: string;
    /** Label to display in the header row. */
    label: string;
    /** Whether this column is sortable. */
    sortable?: boolean;
    /** Optional alignment of the cell content. */
    align?: 'left' | 'center' | 'right';
    /** Optional width of the column. */
    width?: string;
}
interface Props {
    /** Array of row data objects. */
    data: any[];
    /** Array of column configurations. */
    columns: TableColumn[];
    /** A snippet to customise cell rendering. Takes the row object and the column configuration. */
    cell?: Snippet<[any, TableColumn]>;
    /** Additional CSS classes. */
    class?: string;
    /** Spread remaining attributes. */
    [key: string]: unknown;
}
declare const Table: import("svelte").Component<Props, {}, "">;
type Table = ReturnType<typeof Table>;
export default Table;
