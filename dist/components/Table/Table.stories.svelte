<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Table, { type TableColumn } from './Table.svelte';
	import { Button } from '../Button/index.js';
	import { Badge } from '../Badge/index.js';

	const { Story } = defineMeta({
		title: 'Components/Table',
		tags: ['autodocs']
	});
</script>

<script lang="ts">
	const columns: TableColumn[] = [
		{ key: 'name', label: 'Name', sortable: true },
		{ key: 'role', label: 'Role', sortable: true },
		{ key: 'status', label: 'Status', sortable: true, align: 'center' },
		{ key: 'action', label: 'Actions', align: 'right' }
	];

	const data = [
		{ id: '1', name: 'Alice Witch', role: 'Potion Master', status: 'Active' },
		{ id: '2', name: 'Bob Gnome', role: 'Garden Engineer', status: 'On Leave' },
		{ id: '3', name: 'Charlie Dragon', role: 'Treasurer', status: 'Sleeping' }
	];
</script>

<Story name="Default">
	<Table {columns} {data} />
</Story>

<Story name="With Custom Cells">
	<Table {columns} {data}>
		{#snippet cell(row, column)}
			{#if column.key === 'name'}
				<strong style="color: var(--akui-bg-accent);">{row.name}</strong>
			{:else if column.key === 'status'}
				<Badge
					colour={row.status === 'Active' ? 'green' : row.status === 'Sleeping' ? 'orange' : 'amber'}
				>
					{row.status}
				</Badge>
			{:else if column.key === 'action'}
				<Button size="small" variant="ghost" onclick={() => alert(`Edit ${row.name}`)}>
					Edit
				</Button>
			{:else}
				{row[column.key]}
			{/if}
		{/snippet}
	</Table>
</Story>
