<script lang="ts">
	import { MenuButton } from '../MenuButton/index.js';
	import { MenuItem } from '../Menu/index.js';
	import type { DetailsTableSort } from './DetailsTable.svelte';

	interface Props {
		/** Columns that can be sorted. */
		columns: { key: string; label: string }[];
		/** Current sort. */
		sort: DetailsTableSort | null;
		/** Called with a column key when it is tapped. The table decides whether that sorts or flips. */
		onpick: (key: string) => void;
	}

	let { columns, sort, onpick }: Props = $props();

	const activeColumn = $derived(columns.find((column) => column.key === sort?.key));
	const buttonLabel = $derived(
		activeColumn ? `${activeColumn.label} ${sort?.direction === 'asc' ? '↑' : '↓'}` : 'Sort'
	);
</script>

<!-- Tapping a column sorts by it; tapping the sorted column flips the direction, as a header click does. -->
<MenuButton
	size="small"
	variant="ghost"
	icon="arrow-down-up"
	label={buttonLabel}
	origin="bottom-left"
	aria-label="Sort by"
>
	{#snippet menu()}
		{#each columns as column (column.key)}
			<MenuItem
				label={column.label}
				icon={sort?.key === column.key
					? sort.direction === 'asc'
						? 'sort-up'
						: 'sort-down'
					: 'arrow-down-up'}
				onclick={() => onpick(column.key)}
			/>
		{/each}
	{/snippet}
</MenuButton>
