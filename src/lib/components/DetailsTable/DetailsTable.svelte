<script lang="ts" module>
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
	}
</script>

<script lang="ts" generics="T">
	import { Icon } from '../Icon/index.js';
	import { observeInfiniteScroll } from '../../utils/infiniteScroll.js';
	import { windowRows } from './windowRows.js';

	interface Props {
		/** Rows loaded so far. */
		rows: T[];
		/** Column configuration. */
		columns: DetailsTableColumn<T>[];
		/** Stable unique key per row, so cell state survives scrolling and re-sorting. */
		rowKey: (row: T) => string;
		/** Fixed row height in px. Every row must be this height so rows can be windowed. */
		rowHeight?: number;
		/** Extra rows rendered above and below the viewport. */
		overscan?: number;
		/** CSS height of the scroll area. Omit to fill the parent. */
		height?: string;
		/** Current sort. With `onsortchange` the consumer re-sorts or re-fetches; without it the table sorts the loaded rows. */
		sort?: DetailsTableSort | null;
		/** Called when a header is clicked. Use this when `rows` is paged, since a locally sorted page is wrong. */
		onsortchange?: (sort: DetailsTableSort) => void;
		/** Start loading the next page when this many rows remain below the visible ones. */
		loadAheadRows?: number;
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
	}

	let {
		rows,
		columns,
		rowKey,
		rowHeight = 32,
		overscan = 6,
		height,
		sort = $bindable(null),
		onsortchange,
		loadAheadRows = 60,
		showLines = true,
		hasMore = false,
		isLoading = false,
		onloadmore,
		selected = $bindable(new Set<string>()),
		onrowclick,
		rowClass,
		cell,
		emptyState,
		loadingRow,
		class: className = '',
		'aria-label': ariaLabel
	}: Props = $props();

	const tableId = $props.id();

	let scroller = $state<HTMLElement | null>(null);
	let sentinel = $state<HTMLElement | null>(null);
	let scrollTop = $state(0);
	let viewportHeight = $state(0);
	let activeIndex = $state(-1);
	let selectionAnchorKey: string | null = null;

	/** Paged data can't be sorted locally, so the table only sorts when the consumer isn't. */
	const displayRows = $derived.by(() => {
		if (onsortchange || !sort) return rows;
		const { key, direction } = sort;
		const column = columns.find((candidate) => candidate.key === key);
		const read = (row: T) =>
			column?.value ? column.value(row) : (row as Record<string, unknown>)[key];
		const sign = direction === 'asc' ? 1 : -1;

		return rows.toSorted((rowA, rowB) => {
			const valueA = read(rowA);
			const valueB = read(rowB);
			// Empty values sink to the bottom whichever way the sort runs.
			if (valueA == null && valueB == null) return 0;
			if (valueA == null) return 1;
			if (valueB == null) return -1;
			if (typeof valueA === 'string' && typeof valueB === 'string') {
				return sign * valueA.localeCompare(valueB, undefined, { numeric: true });
			}
			return sign * (valueA > valueB ? 1 : valueA < valueB ? -1 : 0);
		});
	});

	const visible = $derived(
		windowRows({
			scrollTop,
			viewportHeight,
			rowHeight,
			rowCount: displayRows.length,
			overscan
		})
	);
	const visibleRows = $derived(displayRows.slice(visible.start, visible.end));

	const gridTemplateColumns = $derived(
		columns.map((column) => column.width ?? 'minmax(0, 1fr)').join(' ')
	);

	// Not reactive: stops the prefetch effect and the sentinel both loading the same page.
	let isRequestingMore = false;

	async function requestMore() {
		if (isRequestingMore || isLoading || !hasMore || !onloadmore) return;
		isRequestingMore = true;
		await onloadmore().finally(() => (isRequestingMore = false));
	}

	// Prefetch by row count, not pixels. The sentinel sits after the padding for every loaded row, so
	// it only comes into range at the very end, which is too late when pages are slow. Re-runs when
	// `isLoading` or `rows` change, so pages keep chaining until the user is far enough ahead.
	$effect(() => {
		if (visible.end + loadAheadRows >= displayRows.length) requestMore();
	});

	// Backstop for short lists and tall viewports, where no scroll event ever fires. The scroller is
	// the observer's root, so the margin is measured against it, not the page.
	$effect(() => {
		if (!sentinel || !scroller || !hasMore || !onloadmore) return;
		return observeInfiniteScroll({
			sentinel,
			root: scroller,
			rootMargin: '1500px',
			onloadmore: requestMore
		});
	});

	function readCellValue(row: T, column: DetailsTableColumn<T>) {
		const value = column.value ? column.value(row) : (row as Record<string, unknown>)[column.key];
		return value ?? '';
	}

	function handleSortClick(column: DetailsTableColumn<T>) {
		if (!column.sortable) return;
		const direction: DetailsTableSortDirection =
			sort?.key === column.key && sort.direction === 'asc' ? 'desc' : 'asc';
		sort = { key: column.key, direction };
		onsortchange?.(sort);
		// A new order makes the old scroll position meaningless.
		if (scroller) scroller.scrollTop = 0;
		activeIndex = -1;
	}

	function selectRow(row: T, index: number, { ctrl = false, shift = false } = {}) {
		const key = rowKey(row);
		if (shift && selectionAnchorKey) {
			const anchorIndex = displayRows.findIndex(
				(candidate) => rowKey(candidate) === selectionAnchorKey
			);
			const [from, to] = [Math.min(anchorIndex, index), Math.max(anchorIndex, index)];
			selected = new Set(displayRows.slice(from, to + 1).map(rowKey));
			return;
		}
		selectionAnchorKey = key;
		if (!ctrl) {
			selected = new Set([key]);
			return;
		}
		// A plain copy: `selected` is replaced, never mutated, so consumers see the change.
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const next = new Set(selected);
		if (!next.delete(key)) next.add(key);
		selected = next;
	}

	function handleRowClick(row: T, index: number, event: MouseEvent) {
		activeIndex = index;
		selectRow(row, index, { ctrl: event.ctrlKey || event.metaKey, shift: event.shiftKey });
		onrowclick?.(row, event);
	}

	/** Keeps the keyboard-active row on screen. Rows are fixed height, so this is plain arithmetic. */
	function scrollIndexIntoView(index: number) {
		if (!scroller) return;
		// The sticky header covers the top of the scroller.
		const headerHeight =
			scroller.querySelector<HTMLElement>('.akui-details-header')?.offsetHeight ?? 0;
		const rowTop = index * rowHeight;
		const rowBottom = rowTop + rowHeight;
		const visibleTop = scroller.scrollTop;
		const visibleBottom = visibleTop + scroller.clientHeight - headerHeight;
		if (rowTop < visibleTop) scroller.scrollTop = rowTop;
		else if (rowBottom > visibleBottom)
			scroller.scrollTop = rowBottom - scroller.clientHeight + headerHeight;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (displayRows.length === 0) return;
		const lastIndex = displayRows.length - 1;
		const pageSize = Math.max(1, Math.floor(viewportHeight / rowHeight) - 1);

		const nextIndexByKey: Record<string, number> = {
			ArrowDown: Math.min(lastIndex, activeIndex + 1),
			ArrowUp: Math.max(0, activeIndex - 1),
			PageDown: Math.min(lastIndex, activeIndex + pageSize),
			PageUp: Math.max(0, activeIndex - pageSize),
			Home: 0,
			End: lastIndex
		};

		if (event.key in nextIndexByKey) {
			event.preventDefault();
			activeIndex = nextIndexByKey[event.key];
			scrollIndexIntoView(activeIndex);
			// Plain arrows move the selection with the cursor, like Explorer; shift extends it.
			selectRow(displayRows[activeIndex], activeIndex, { shift: event.shiftKey });
			return;
		}

		const activeRow = displayRows[activeIndex];
		if (!activeRow) return;

		if (event.key === 'Enter') {
			event.preventDefault();
			onrowclick?.(activeRow, event);
		} else if (event.key === ' ') {
			event.preventDefault();
			selectRow(activeRow, activeIndex, { ctrl: true });
		}
	}

	const activeRowId = $derived(
		activeIndex >= 0 && displayRows[activeIndex]
			? `${tableId}-row-${rowKey(displayRows[activeIndex])}`
			: undefined
	);
</script>

<div
	bind:this={scroller}
	bind:clientHeight={viewportHeight}
	class="akui-details-table {className}"
	class:no-lines={!showLines}
	style:height
	style:--akui-details-columns={gridTemplateColumns}
	style:--akui-details-row-height="{rowHeight}px"
	role="grid"
	tabindex="0"
	aria-label={ariaLabel}
	aria-rowcount={hasMore ? -1 : displayRows.length + 1}
	aria-multiselectable="true"
	aria-activedescendant={activeRowId}
	onscroll={(event) => (scrollTop = event.currentTarget.scrollTop)}
	onkeydown={handleKeydown}
>
	<div class="akui-details-header" role="row" aria-rowindex={1}>
		{#each columns as column (column.key)}
			{@const isSorted = sort?.key === column.key}
			<div
				class="akui-details-head-cell"
				class:sortable={column.sortable}
				style:text-align={column.align ?? 'left'}
				role="columnheader"
				aria-sort={isSorted ? (sort?.direction === 'asc' ? 'ascending' : 'descending') : undefined}
				tabindex={column.sortable ? 0 : undefined}
				onclick={() => handleSortClick(column)}
				onkeydown={(event) => {
					if (!column.sortable || (event.key !== 'Enter' && event.key !== ' ')) return;
					event.preventDefault();
					event.stopPropagation();
					handleSortClick(column);
				}}
			>
				<span class="head-content">
					{#if column.header}
						{@render column.header(column, sort)}
					{:else}
						{column.label}
					{/if}
					{#if isSorted}
						<Icon
							name={sort?.direction === 'asc' ? 'caret-up-fill' : 'caret-down-fill'}
							size={10}
						/>
					{/if}
				</span>
			</div>
		{/each}
	</div>

	{#if displayRows.length === 0 && !isLoading}
		<div class="akui-details-empty">
			{#if emptyState}
				{@render emptyState()}
			{:else}
				No data available
			{/if}
		</div>
	{:else}
		<!-- Padding stands in for the rows that aren't rendered, so the scrollbar spans the whole list. -->
		<div
			class="akui-details-body"
			role="rowgroup"
			style:padding-top="{visible.start * rowHeight}px"
			style:padding-bottom="{(displayRows.length - visible.end) * rowHeight}px"
		>
			{#each visibleRows as row, offset (rowKey(row))}
				{@const index = visible.start + offset}
				<!-- Keyboard use is handled once on the grid (arrow keys move `activeIndex`). -->
				<div
					id="{tableId}-row-{rowKey(row)}"
					class="akui-details-row {rowClass?.(row) ?? ''}"
					class:selected={selected.has(rowKey(row))}
					class:active={index === activeIndex}
					role="row"
					aria-rowindex={index + 2}
					aria-selected={selected.has(rowKey(row))}
					tabindex="-1"
					onclick={(event) => handleRowClick(row, index, event)}
					onkeydown={null}
				>
					{#each columns as column (column.key)}
						<div
							class="akui-details-cell"
							style:text-align={column.align ?? 'left'}
							role="gridcell"
						>
							{#if column.cell}
								{@render column.cell(row, index)}
							{:else if cell}
								{@render cell(row, column, index)}
							{:else}
								{readCellValue(row, column)}
							{/if}
						</div>
					{/each}
				</div>
			{/each}
		</div>
	{/if}

	{#if isLoading}
		<div class="akui-details-loading">
			{#if loadingRow}
				{@render loadingRow()}
			{:else}
				Loading…
			{/if}
		</div>
	{/if}

	<div bind:this={sentinel} class="akui-details-sentinel" aria-hidden="true"></div>
</div>

<style>
	.akui-details-table {
		position: relative;
		overflow: auto;
		width: 100%;
		height: 100%;
		box-sizing: border-box;
		color: var(--akui-fg, #333);
		font-size: 0.9375rem;
		background-color: var(--akui-bg-input, #fff);
		border: 1px solid var(--akui-border-input, #e0e0e0);
		border-radius: var(--akui-radius-m, 8px);
		box-shadow: var(--akui-shadow-sunken);
	}

	.akui-details-table:focus-visible {
		outline: 2px solid var(--akui-bg-accent, #3b82f6);
		outline-offset: -2px;
	}

	/* Header and rows share one grid template, so columns line up while rows are windowed. */
	.akui-details-header,
	.akui-details-row {
		display: grid;
		grid-template-columns: var(--akui-details-columns);
		min-width: max-content;
	}

	.akui-details-header {
		position: sticky;
		top: 0;
		z-index: 1;
		font-weight: 700;
		background-color: var(--akui-bg-button, #e5e7eb);
		border-bottom: 1px solid var(--akui-border-input, #e0e0e0);
		box-shadow: var(--akui-shadow-shiny);
		user-select: none;
	}

	.akui-details-head-cell,
	.akui-details-cell {
		padding: 0 0.75rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.akui-details-head-cell {
		padding-block: 0.5rem;
		border-left: 1px solid var(--akui-border-input, #e0e0e0);
	}

	.akui-details-head-cell:first-child {
		border-left: none;
	}

	.akui-details-head-cell.sortable {
		cursor: pointer;
	}

	.akui-details-head-cell.sortable:hover {
		background-color: var(--akui-bg-hover, #f0f0f0);
	}

	.head-content {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
	}

	.no-lines .akui-details-row,
	.no-lines .akui-details-head-cell {
		border-color: transparent;
	}

	.akui-details-row {
		height: var(--akui-details-row-height);
		align-items: center;
		cursor: default;
		border-bottom: 1px solid color-mix(in srgb, var(--akui-border-input, #e0e0e0) 50%, transparent);
	}

	.akui-details-row:hover {
		background-color: var(--akui-bg-hover, #f0f0f0);
	}

	.akui-details-row.selected {
		background-color: color-mix(in srgb, var(--akui-bg-accent, #3b82f6) 22%, transparent);
	}

	.akui-details-row.active {
		outline: 1px solid var(--akui-bg-accent, #3b82f6);
		outline-offset: -1px;
	}

	.akui-details-empty,
	.akui-details-loading {
		padding: 1rem;
		text-align: center;
		color: var(--akui-fg-secondary, #666);
		font-style: italic;
	}

	.akui-details-sentinel {
		height: 1px;
	}
</style>
