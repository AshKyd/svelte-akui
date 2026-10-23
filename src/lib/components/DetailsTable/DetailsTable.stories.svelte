<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	// No `component`: the stories render DetailsTable themselves.
	const { Story } = defineMeta({
		title: 'Components/DetailsTable',
		tags: ['autodocs']
	});
</script>

<script lang="ts">
	import DetailsTable, {
		type DetailsTableColumn,
		type DetailsTableSort
	} from './DetailsTable.svelte';
	import { Badge } from '../Badge/index.js';

	interface Spell {
		id: string;
		name: string;
		caster: string;
		mood: 'Cosy' | 'Mischievous' | 'Sleepy';
		kettles: number;
	}

	const casters = [
		'Marigold Thistle',
		'Bram Underhill',
		'Old Nettle',
		'Pip Cobblewick',
		'Dame Hazel'
	];
	const spells = [
		'Warming the teapot',
		'Calming the geese',
		'Mending a sock',
		'Finding the lost spoon',
		'Greeting the moon'
	];
	const moods: Spell['mood'][] = ['Cosy', 'Mischievous', 'Sleepy'];

	const makeSpells = (from: number, count: number): Spell[] =>
		Array.from({ length: count }, (_, offset) => {
			const number = from + offset;
			return {
				id: `spell-${number}`,
				name: `${spells[number % spells.length]} #${number}`,
				caster: casters[(number * 7) % casters.length],
				mood: moods[number % moods.length],
				kettles: (number * 37) % 101
			};
		});

	const columns: DetailsTableColumn<Spell>[] = [
		{ key: 'name', label: 'Name', sortable: true, width: 'minmax(12rem, 3fr)' },
		{ key: 'caster', label: 'Caster', sortable: true },
		{ key: 'mood', label: 'Mood', sortable: true, width: '8rem' },
		{ key: 'kettles', label: 'Kettles', sortable: true, align: 'right', width: '6rem' }
	];

	/** Static, locally sorted. */
	const smallRows = makeSpells(1, 12);

	/** Paged: pretend the server holds 10,000 spells and sorts them for us. */
	const totalSpells = 10_000;
	const pageSize = 100;
	let pagedRows = $state(makeSpells(1, pageSize));
	let pagedSort = $state<DetailsTableSort | null>(null);
	let isLoading = $state(false);

	const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

	async function loadMore() {
		isLoading = true;
		await sleep(300);
		pagedRows = [...pagedRows, ...makeSpells(pagedRows.length + 1, pageSize)];
		isLoading = false;
	}

	/** A real consumer would re-fetch page one from the server in the new order. */
	function handleSortChange(sort: DetailsTableSort) {
		const sign = sort.direction === 'asc' ? 1 : -1;
		pagedRows = makeSpells(1, pageSize).toSorted((rowA, rowB) => {
			const valueA = rowA[sort.key as keyof Spell];
			const valueB = rowB[sort.key as keyof Spell];
			return sign * String(valueA).localeCompare(String(valueB), undefined, { numeric: true });
		});
	}

	let selected = $state(new Set<string>());
</script>

<Story name="Default">
	{#snippet children()}
		<DetailsTable
			rows={smallRows}
			{columns}
			rowKey={(row) => row.id}
			height="20rem"
			aria-label="Spells"
			bind:selected
		/>
	{/snippet}
</Story>

<Story name="Paged and windowed (10,000 rows)">
	{#snippet children()}
		<p>
			Loaded {pagedRows.length} of {totalSpells}. Only the rows on screen exist in the DOM.
		</p>
		<DetailsTable
			rows={pagedRows}
			{columns}
			rowKey={(row) => row.id}
			height="24rem"
			aria-label="Spells, paged"
			hasMore={pagedRows.length < totalSpells}
			{isLoading}
			onloadmore={loadMore}
			bind:sort={pagedSort}
			onsortchange={handleSortChange}
		/>
	{/snippet}
</Story>

<Story name="Custom cells">
	{#snippet children()}
		<DetailsTable
			rows={smallRows}
			columns={[
				{ key: 'name', label: 'Name', sortable: true, width: 'minmax(12rem, 3fr)' },
				{ key: 'caster', label: 'Caster', sortable: true },
				{ key: 'mood', label: 'Mood', sortable: true, width: '9rem', cell: moodCell },
				{ key: 'kettles', label: 'Kettles', sortable: true, align: 'right', width: '6rem' }
			]}
			rowKey={(row) => row.id}
			height="20rem"
		>
			{#snippet cell(row, column)}
				{#if column.key === 'name'}
					<strong>{row.name}</strong>
				{:else}
					{column.value ? column.value(row) : row[column.key as keyof Spell]}
				{/if}
			{/snippet}
		</DetailsTable>
	{/snippet}
</Story>

<Story name="Without lines">
	{#snippet children()}
		<DetailsTable
			rows={smallRows}
			{columns}
			rowKey={(row) => row.id}
			height="20rem"
			showLines={false}
		/>
	{/snippet}
</Story>

<Story name="Empty">
	{#snippet children()}
		<DetailsTable rows={[]} {columns} rowKey={(row) => row.id} height="10rem">
			{#snippet emptyState()}
				The kettle is quiet. No spells yet.
			{/snippet}
		</DetailsTable>
	{/snippet}
</Story>

{#snippet moodCell(row: Spell)}
	<Badge colour={row.mood === 'Cosy' ? 'green' : row.mood === 'Sleepy' ? 'orange' : 'amber'}>
		{row.mood}
	</Badge>
{/snippet}
