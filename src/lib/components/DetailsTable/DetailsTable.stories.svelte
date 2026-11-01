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
	import { Button } from '../Button/index.js';
	import { Icon } from '../Icon/index.js';
	import ProgressBar from '../ProgressBar/ProgressBar.svelte';

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

	interface Track {
		id: string;
		number: number;
		artist: string;
		title: string;
		/** Length in seconds. */
		seconds: number;
	}

	const trackListing: Track[] = [
		{ number: 1, artist: 'The Hollow Hill Hedgehogs', title: 'Teapot Waltz', seconds: 187 },
		{ number: 2, artist: 'Marigold Thistle', title: 'Ode to a Warm Scone', seconds: 242 },
		{
			number: 3,
			artist: 'Bram Underhill & the Mossy Fiddlers',
			title: 'Mending Socks by Moonlight',
			seconds: 215
		},
		{ number: 4, artist: 'Pip', title: 'Lost Spoon Blues', seconds: 158 },
		{
			number: 5,
			artist: 'Dame Hazel Cobblewick',
			title: 'The Geese Have Opinions About the Parish Council',
			seconds: 331
		},
		{ number: 6, artist: 'Old Nettle', title: 'Lullaby for a Sleepy Kettle', seconds: 276 }
	].map((track) => ({ ...track, id: `track-${track.number}` }));

	/** The row that shows the play icon. */
	const nowPlayingId = 'track-2';

	const formatDuration = (seconds: number) =>
		`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

	const trackColumns: DetailsTableColumn<Track>[] = [
		// No label: the column only holds the play icon, so it stays narrow and fixed.
		{ key: 'playing', label: '', width: '2.5rem', align: 'center' },
		{ key: 'number', label: '#', sortable: true, align: 'right' },
		// Artist and title take the spare width in a 1 : 2 split; the rest stay at content width.
		{ key: 'artist', label: 'Artist', sortable: true, fitFlex: 1 },
		{ key: 'title', label: 'Title', sortable: true, fitFlex: 2 },
		{
			key: 'seconds',
			label: 'Duration',
			sortable: true,
			align: 'right',
			value: (track) => track.seconds
		}
	];

	const columns: DetailsTableColumn<Spell>[] = [
		{ key: 'name', label: 'Name', sortable: true, width: 'minmax(12rem, 3fr)' },
		{ key: 'caster', label: 'Caster', sortable: true },
		{ key: 'mood', label: 'Mood', sortable: true, width: '8rem' },
		{ key: 'kettles', label: 'Kettles', sortable: true, align: 'right', width: '6rem' }
	];

	/** Values with no break points, to prove long content can't stretch a row. */
	const longRows: Spell[] = makeSpells(1, 6).map((spell) => ({
		...spell,
		name: `${spell.name}-${'supercalifragilistic'.repeat(6)}`,
		caster: 'Archmagister-Thistlewick-Underhill-Cobblewick-of-the-Seven-Hollows'
	}));

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
	let columnWidths = $state<Record<string, number>>({});
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

<Story name="Buttons and progress">
	{#snippet children()}
		<p>Fixed-width columns keep the buttons and bars the same size on every row.</p>
		<DetailsTable
			rows={smallRows}
			columns={[
				{ key: 'name', label: 'Name', sortable: true, width: 'minmax(12rem, 3fr)' },
				{
					key: 'kettles',
					label: 'Kettles',
					sortable: true,
					width: '10rem',
					listWidth: '8rem',
					cell: kettleCell
				},
				{
					key: 'action',
					label: 'Actions',
					align: 'right',
					width: '7rem',
					listWidth: '6rem',
					cell: brewCell
				}
			]}
			rowKey={(row) => row.id}
			height="20rem"
			layout="table"
		/>
	{/snippet}
</Story>

<Story name="List layout">
	{#snippet children()}
		<p>Forced list layout: each row is a card, and sorting is in the menu.</p>
		<div style="max-width: 24rem;">
			<DetailsTable
				rows={pagedRows}
				columns={[
					{ key: 'name', label: 'Name', sortable: true },
					{ key: 'caster', label: 'Caster', sortable: true },
					{ key: 'mood', label: 'Mood', sortable: true, cell: moodCell },
					{
						key: 'kettles',
						label: 'Kettles',
						sortable: true,
						listWidth: '8rem',
						cell: kettleCell
					},
					{ key: 'action', label: 'Actions', listWidth: '6rem', cell: brewCell }
				]}
				rowKey={(row) => row.id}
				height="30rem"
				layout="list"
				aria-label="Spells, list"
				hasMore={pagedRows.length < totalSpells}
				{isLoading}
				onloadmore={loadMore}
				bind:sort={pagedSort}
				onsortchange={handleSortChange}
			/>
		</div>
	{/snippet}
</Story>

<Story name="List without labels">
	{#snippet children()}
		<div style="max-width: 24rem;">
			<DetailsTable
				rows={smallRows}
				columns={[
					{ key: 'name', label: 'Name', sortable: true },
					{ key: 'caster', label: 'Caster', sortable: true },
					{ key: 'kettles', label: 'Kettles', sortable: true, hideInList: true }
				]}
				rowKey={(row) => row.id}
				height="24rem"
				layout="list"
				listLabels={false}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Responsive">
	{#snippet children()}
		<p>Drag the corner to resize. Below 640px wide the table becomes a list.</p>
		<div
			style="width: 48rem; max-width: 100%; min-width: 16rem; resize: horizontal; overflow: hidden; padding-bottom: 0.5rem;"
		>
			<DetailsTable
				rows={smallRows}
				columns={[
					{ key: 'name', label: 'Name', sortable: true, width: 'minmax(10rem, 3fr)' },
					{ key: 'mood', label: 'Mood', sortable: true, width: '8rem', cell: moodCell },
					{
						key: 'kettles',
						label: 'Kettles',
						sortable: true,
						width: '10rem',
						listWidth: '8rem',
						cell: kettleCell
					},
					{
						key: 'action',
						label: 'Actions',
						align: 'right',
						width: '7rem',
						listWidth: '6rem',
						cell: brewCell
					}
				]}
				rowKey={(row) => row.id}
				height="26rem"
			/>
		</div>
	{/snippet}
</Story>

<Story name="Resizable columns">
	{#snippet children()}
		<p>
			Drag a header's right edge, or focus it and use the arrow keys (shift for bigger steps).
			Double-click to reset. Mood is not resizable.
		</p>
		<DetailsTable
			rows={smallRows}
			columns={[
				{
					key: 'name',
					label: 'Name',
					sortable: true,
					width: '14rem',
					resizable: true,
					minWidth: 96
				},
				{ key: 'caster', label: 'Caster', sortable: true, resizable: true },
				{ key: 'mood', label: 'Mood', sortable: true, width: '8rem' },
				{
					key: 'kettles',
					label: 'Kettles',
					sortable: true,
					align: 'right',
					width: '8rem',
					resizable: true,
					maxWidth: 240
				}
			]}
			rowKey={(row) => row.id}
			height="20rem"
			layout="table"
			bind:columnWidths
		/>
		<p><code>columnWidths</code>: {JSON.stringify(columnWidths)}</p>
	{/snippet}
</Story>

<Story name="Auto fit">
	{#snippet children()}
		<p>
			<code>autoFit</code> sizes each column to its longest rendered value, so short columns stay tight
			and long ones get the space. Narrow the pane and the widest columns clip first.
		</p>
		<DetailsTable
			rows={smallRows}
			columns={[
				{ key: 'name', label: 'Name', sortable: true, maxWidth: 360 },
				{ key: 'caster', label: 'Caster', sortable: true },
				{ key: 'mood', label: 'Mood', sortable: true },
				{ key: 'kettles', label: 'Kettles', sortable: true, align: 'right' }
			]}
			rowKey={(row) => row.id}
			height="20rem"
			layout="table"
			autoFit
		/>
		<p>
			With <code>fitFlex</code> the spare width is shared in proportion (Name 2 : Caster 1), so the table
			fills its container.
		</p>
		<DetailsTable
			rows={smallRows}
			columns={[
				{ key: 'name', label: 'Name', sortable: true, fitFlex: 2 },
				{ key: 'caster', label: 'Caster', sortable: true, fitFlex: 1 },
				{ key: 'mood', label: 'Mood', sortable: true },
				{ key: 'kettles', label: 'Kettles', sortable: true, align: 'right' }
			]}
			rowKey={(row) => row.id}
			height="20rem"
			layout="table"
			autoFit
		/>
	{/snippet}
</Story>

<Story name="Auto fit track listing">
	{#snippet children()}
		<p>
			A CD track listing. The unlabelled first column is a fixed width and shows a play icon on the
			playing track. The number and duration fit their content; artist and title share the spare
			width 1 : 2.
		</p>
		<DetailsTable
			rows={trackListing}
			columns={trackColumns}
			rowKey={(track) => track.id}
			layout="table"
			autoFit
			aria-label="Track listing"
		>
			{#snippet cell(track, column)}
				{#if column.key === 'playing'}
					{#if track.id === nowPlayingId}
						<!--
							To centre non-text content (icons, buttons, badges) in a cell, wrap it in a
							`display: grid; place-items: center` element. Bare inline content sits on the text
							baseline, so it looks too high. The wrapper takes it out of the text line, and the
							row centres the cell.
						-->
						<span style="display: grid; place-items: center;">
							<Icon name="play-fill" alt="Now playing" />
						</span>
					{/if}
				{:else if column.key === 'seconds'}
					{formatDuration(track.seconds)}
				{:else}
					{track[column.key as 'number' | 'artist' | 'title']}
				{/if}
			{/snippet}
		</DetailsTable>
	{/snippet}
</Story>

<Story name="Long values">
	{#snippet children()}
		<p>Long unbroken values are cut off with an ellipsis; they never widen a row.</p>
		<div style="display: flex;">
			<DetailsTable
				rows={longRows}
				{columns}
				rowKey={(row) => row.id}
				height="16rem"
				layout="table"
			/>
		</div>
		<div style="max-width: 20rem; margin-top: 1rem;">
			<DetailsTable
				rows={longRows}
				{columns}
				rowKey={(row) => row.id}
				height="20rem"
				layout="list"
			/>
		</div>
	{/snippet}
</Story>

<Story name="Large">
	{#snippet children()}
		<DetailsTable rows={smallRows} {columns} rowKey={(row) => row.id} height="26rem" size="large" />
	{/snippet}
</Story>

<Story name="Borderless">
	{#snippet children()}
		<p>Flush with its container: no border, radius or shadow.</p>
		<div
			style="border: 1px solid var(--akui-border-input); border-radius: var(--akui-radius-m); overflow: hidden;"
		>
			<DetailsTable
				rows={smallRows}
				{columns}
				rowKey={(row) => row.id}
				height="16rem"
				border={false}
			/>
		</div>
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

{#snippet kettleCell(row: Spell)}
	<!-- Width 100% of the fixed column, so every bar is the same length. -->
	<ProgressBar value={row.kettles} max={100} size="small" />
{/snippet}

{#snippet brewCell(row: Spell)}
	<!-- A grid wrapper stretches the inline button to the column width, so every button matches. -->
	<div class="fill-cell">
		<Button size="small" label="Brew" onclick={() => alert(`Brewing ${row.name}`)} />
	</div>
{/snippet}

{#snippet moodCell(row: Spell)}
	<Badge colour={row.mood === 'Cosy' ? 'green' : row.mood === 'Sleepy' ? 'orange' : 'amber'}>
		{row.mood}
	</Badge>
{/snippet}

<style>
	/* Grid stretches the button to the (fixed-width) column. */
	.fill-cell {
		display: grid;
		width: 100%;
	}
</style>
