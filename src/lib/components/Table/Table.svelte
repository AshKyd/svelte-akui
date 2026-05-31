<script lang="ts">
	import { type Snippet } from 'svelte';
	import { Icon } from '../Icon/index.js';

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

	let {
		data = [],
		columns = [],
		cell,
		class: className = '',
		...rest
	}: Props = $props();

	let sortKey = $state<string | null>(null);
	let sortDirection = $state<'asc' | 'desc'>('asc');

	let sortedData = $derived.by(() => {
		if (!sortKey) return data;

		return [...data].sort((a, b) => {
			const valA = a[sortKey!];
			const valB = b[sortKey!];

			if (valA === undefined || valA === null) return sortDirection === 'asc' ? 1 : -1;
			if (valB === undefined || valB === null) return sortDirection === 'asc' ? -1 : 1;

			if (typeof valA === 'string' && typeof valB === 'string') {
				return sortDirection === 'asc'
					? valA.localeCompare(valB)
					: valB.localeCompare(valA);
			}

			return sortDirection === 'asc'
				? (valA > valB ? 1 : valA < valB ? -1 : 0)
				: (valB > valA ? 1 : valB < valA ? -1 : 0);
		});
	});

	function handleSort(column: TableColumn) {
		if (!column.sortable) return;

		if (sortKey === column.key) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortKey = column.key;
			sortDirection = 'asc';
		}
	}
</script>

<div class="akui-table-container {className}" {...rest}>
	<table class="akui-table">
		<thead class="akui-table-header">
			<tr>
				{#each columns as column (column.key)}
					<th
						style:width={column.width}
						style:text-align={column.align || 'left'}
						class:sortable={column.sortable}
						onclick={() => handleSort(column)}
					>
						<span class="header-content">
							{column.label}
							{#if column.sortable && sortKey === column.key}
								<span class="sort-icon">
									<Icon
										name={sortDirection === 'asc' ? 'caret-up-fill' : 'caret-down-fill'}
										size={10}
									/>
								</span>
							{/if}
						</span>
					</th>
				{/each}
			</tr>
		</thead>
		<tbody class="akui-table-body">
			{#if sortedData.length === 0}
				<tr>
					<td colspan={columns.length} class="empty-cell">
						No data available
					</td>
				</tr>
			{:else}
				{#each sortedData as row, idx (idx)}
					<tr>
						{#each columns as column (column.key)}
							<td style:text-align={column.align || 'left'}>
								{#if cell}
									{@render cell(row, column)}
								{:else}
									{row[column.key] ?? ''}
								{/if}
							</td>
						{/each}
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>

<style>
	.akui-table-container {
		width: 100%;
		border-collapse: separate;
		box-sizing: border-box;
	}

	.akui-table {
		width: 100%;
		border-spacing: 0;
	}

	/* Heading Row th has akui glow / shiny style */
	.akui-table-header th {
		padding: 0.85rem 1rem;
		font-weight: 700;
		color: var(--akui-fg, #333);
		font-size: 0.9375rem;
		background-color: var(--akui-bg-button, #e5e7eb);
		border-top: 1px solid var(--akui-border-input, #e0e0e0);
		border-bottom: 1px solid var(--akui-border-input, #e0e0e0);
		border-left: 1px solid var(--akui-border-input, #e0e0e0);
		box-shadow: var(--akui-shadow-shiny);
		user-select: none;
	}

	.akui-table-header th:first-child {
		border-radius: var(--akui-radius-m, 8px) 0 0 0;
	}

	.akui-table-header th:last-child {
		border-right: 1px solid var(--akui-border-input, #e0e0e0);
		border-radius: 0 var(--akui-radius-m, 8px) 0 0;
	}

	.akui-table-header th.sortable {
		cursor: pointer;
	}

	.akui-table-header th.sortable:hover {
		background-color: var(--akui-bg-hover, #f0f0f0);
	}

	.header-content {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
	}

	.sort-icon {
		display: inline-flex;
		align-items: center;
		opacity: 0.8;
	}

	/* Table Body td has inverse/sunken glow appearance */
	.akui-table-body td {
		padding: 0.85rem 1rem;
		font-size: 0.9375rem;
		color: var(--akui-fg, #333);
		background-color: var(--akui-bg-input, #ffffff);
		border-bottom: 1px solid var(--akui-border-input, #e0e0e0);
		border-left: 1px solid var(--akui-border-input, #e0e0e0);
		box-shadow: var(--akui-shadow-sunken);
	}

	.akui-table-body td:last-child {
		border-right: 1px solid var(--akui-border-input, #e0e0e0);
	}

	.akui-table-body tr:last-child td:first-child {
		border-radius: 0 0 0 var(--akui-radius-m, 8px);
	}

	.akui-table-body tr:last-child td:last-child {
		border-radius: 0 0 var(--akui-radius-m, 8px) 0;
	}

	/* If a cell is both first and last (e.g. empty cell spanning columns) */
	.akui-table-body tr:last-child td:first-child:last-child {
		border-radius: 0 0 var(--akui-radius-m, 8px) var(--akui-radius-m, 8px);
	}

	.empty-cell {
		text-align: center;
		color: var(--akui-fg-secondary, #666);
		font-style: italic;
		background: var(--akui-bg-input);
	}
</style>
