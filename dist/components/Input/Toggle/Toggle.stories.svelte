<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Toggle from './Toggle.svelte';

	// No `component`: the stories render Toggle themselves.
	const { Story } = defineMeta({
		title: 'Components/Input/Toggle',
		tags: ['autodocs']
	});

	const sizes = ['small', 'medium', 'large'] as const;
</script>

<script lang="ts">
	let porchLight = $state(true);
</script>

<Story name="Basic Usage">
	{#snippet children()}
		<Toggle label="Keep the porch lantern lit" bind:checked={porchLight} />
		<p>Lantern is {porchLight ? 'lit' : 'out'}.</p>
	{/snippet}
</Story>

<Story name="Sizes">
	{#snippet children()}
		<div style="display: flex; flex-direction: column; gap: 1rem;">
			{#each sizes as size (size)}
				<Toggle {size} label="{size} toggle" checked />
			{/each}
		</div>
	{/snippet}
</Story>

<Story name="States">
	{#snippet children()}
		<div style="display: flex; flex-direction: column; gap: 1rem;">
			<Toggle label="Off" />
			<Toggle label="On" checked />
			<Toggle label="Disabled" disabled />
			<Toggle label="Disabled and on" disabled checked />
		</div>
	{/snippet}
</Story>
