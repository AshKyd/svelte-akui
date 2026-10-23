import type { DetailsTableSort } from './DetailsTable.svelte';
interface Props {
    /** Columns that can be sorted. */
    columns: {
        key: string;
        label: string;
    }[];
    /** Current sort. */
    sort: DetailsTableSort | null;
    /** Called with a column key when it is tapped. The table decides whether that sorts or flips. */
    onpick: (key: string) => void;
}
declare const DetailsTableSortMenu: import("svelte").Component<Props, {}, "">;
type DetailsTableSortMenu = ReturnType<typeof DetailsTableSortMenu>;
export default DetailsTableSortMenu;
