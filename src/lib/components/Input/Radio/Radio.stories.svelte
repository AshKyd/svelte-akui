<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Radio from './Radio.svelte';

	// No `component`: the stories render Radio themselves.
	const { Story } = defineMeta({
		title: 'Components/Input/Radio',
		tags: ['autodocs']
	});

	const sizes = ['small', 'medium', 'large'] as const;
</script>

<script lang="ts">
	let broom = $state('willow');
	let sizeGroup = $state('medium');
</script>

<Story name="Basic Usage">
	{#snippet children()}
		<div role="radiogroup" aria-label="Broom type" style="display: flex; flex-direction: column; gap: 0.75rem;">
			<Radio name="broom" value="willow" label="Willow twig broom" bind:group={broom} />
			<Radio name="broom" value="birch" label="Birch besom" bind:group={broom} />
			<Radio name="broom" value="sprout" label="Self-sweeping (still learning)" bind:group={broom} />
			<Radio name="broom" value="retired" label="Retired from sweeping" disabled bind:group={broom} />
		</div>
		<p>Selected: {broom}</p>
	{/snippet}
</Story>

<Story name="Sizes">
	{#snippet children()}
		<div style="display: flex; flex-direction: column; gap: 1rem;">
			{#each sizes as size (size)}
				<Radio {size} name="size-demo" value={size} label="{size} radio" bind:group={sizeGroup} />
			{/each}
		</div>
	{/snippet}
</Story>
