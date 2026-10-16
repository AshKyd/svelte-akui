<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Checkbox from './Checkbox.svelte';

	// No `component`: the stories render Checkbox themselves.
	const { Story } = defineMeta({
		title: 'Components/Input/Checkbox',
		tags: ['autodocs']
	});

	const sizes = ['small', 'medium', 'large'] as const;
</script>

<script lang="ts">
	let allChores = $state(false);
	let chores = $state([false, true, false]);
	const choreNames = ['Sweep the moss', 'Polish the cauldron', 'Feed the hedge sprites'];
	const ticked = $derived(chores.filter(Boolean).length);
</script>

<Story name="Basic Usage">
	{#snippet children()}
		<Checkbox label="Leave a saucer of milk out for the brownie" />
	{/snippet}
</Story>

<Story name="Sizes">
	{#snippet children()}
		<div style="display: flex; flex-direction: column; gap: 1rem;">
			{#each sizes as size (size)}
				<Checkbox {size} label="{size} checkbox" checked />
			{/each}
		</div>
	{/snippet}
</Story>

<Story name="States">
	{#snippet children()}
		<div style="display: flex; flex-direction: column; gap: 1rem;">
			<Checkbox label="Unchecked" />
			<Checkbox label="Checked" checked />
			<Checkbox label="Indeterminate" indeterminate />
			<Checkbox label="Disabled" disabled />
			<Checkbox label="Disabled and checked" disabled checked />
		</div>
	{/snippet}
</Story>

<Story name="Indeterminate Select All">
	{#snippet children()}
		<div style="display: flex; flex-direction: column; gap: 0.75rem;">
			<Checkbox
				label="All chores"
				checked={ticked === chores.length}
				indeterminate={ticked > 0 && ticked < chores.length}
				onchange={(event: Event) => {
					const on = (event.currentTarget as HTMLInputElement).checked;
					chores = chores.map(() => on);
				}}
			/>
			<div style="display: flex; flex-direction: column; gap: 0.5rem; padding-left: 1.75rem;">
				{#each choreNames as name, index (name)}
					<Checkbox label={name} bind:checked={chores[index]} />
				{/each}
			</div>
		</div>
	{/snippet}
</Story>
