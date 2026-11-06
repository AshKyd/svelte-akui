<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import StorybookDecorator from '../StorybookDecorator.svelte';

	// No `component`: each story renders Slider itself.
	const { Story } = defineMeta({
		title: 'Components/Slider',
		decorators: [() => StorybookDecorator]
	});
</script>

<script lang="ts">
	import Slider from './Slider.svelte';
	import Toggle from '../Input/Toggle/Toggle.svelte';
	import type { SliderSegment } from './types.js';

	let broomSpeed = $state(35);
	let kettleBuffer = $state(62);
	let bellRehearsal = $state(40);
	let isBuffering = $state(true);

	/** Stages of the village hall's morning bake-off set-up. */
	const bakeOffStages: SliderSegment[] = [
		{ to: 30, colour: 'orange', label: 'Fetching flour' },
		{ to: 70, colour: 'blue', label: 'Proving dough' },
		{ to: 100, colour: 'green', label: 'Cooling on the sill' }
	];
</script>

<Story name="Range">
	{#snippet children()}
		<div style="width: 320px; display: grid; gap: 8px;">
			<Slider bind:value={broomSpeed} label="Broom speed" />
			<span>Broom speed: {broomSpeed}</span>
		</div>
	{/snippet}
</Story>

<Story name="Progress">
	{#snippet children()}
		<div style="width: 320px; display: grid; gap: 20px;">
			<Slider mode="progress" value={25} label="Kettle warming" />
			<Slider mode="progress" value={60} colour="green" />
			<Slider mode="progress" value={90} colour="purple" />
		</div>
	{/snippet}
</Story>

<Story name="Heights">
	{#snippet children()}
		<div style="width: 320px; display: grid; gap: 20px;">
			<Slider value={50} height={3} />
			<Slider value={50} />
			<Slider value={50} height={12} />
			<Slider value={50} height="1.5rem" />
		</div>
	{/snippet}
</Story>

<Story name="Colours">
	{#snippet children()}
		<div style="width: 320px; display: grid; gap: 20px;">
			{#each ['accent', 'blue', 'green', 'orange', 'pink', 'purple', 'amber'] as const as colour (colour)}
				<Slider {colour} value={55} label={colour} />
			{/each}
		</div>
	{/snippet}
</Story>

<Story name="Segments">
	{#snippet children()}
		<div style="width: 360px; display: grid; gap: 24px;">
			<Slider segments={bakeOffStages} bind:value={bellRehearsal} label="Bake-off set-up" />
			<Slider mode="progress" segments={bakeOffStages} value={bellRehearsal} height={10} />
		</div>
	{/snippet}
</Story>

<Story name="Joined segments">
	{#snippet children()}
		<div style="width: 360px; display: grid; gap: 24px;">
			<Slider segments={bakeOffStages} joined bind:value={bellRehearsal} />
			<Slider mode="progress" segments={bakeOffStages} joined value={bellRehearsal} height={10} />
		</div>
	{/snippet}
</Story>

<Story name="Rectangle scrubber">
	{#snippet children()}
		<div style="width: 360px; display: grid; gap: 24px;">
			<Slider bind:value={broomSpeed} thumbShape="rect" />
			<Slider bind:value={broomSpeed} thumbShape="rect" segments={bakeOffStages} joined height={10} />
		</div>
	{/snippet}
</Story>

<Story name="Custom scrubber">
	{#snippet children()}
		<div style="width: 360px; display: grid; gap: 24px;">
			<Slider bind:value={broomSpeed} thumbSize={28} segments={bakeOffStages}>
				{#snippet thumb({ colour })}
					<span
						style="display: grid; place-items: center; width: 100%; height: 100%; border-radius: 50%; background: {colour}; font-size: 14px;"
						>🧹</span
					>
				{/snippet}
			</Slider>
		</div>
	{/snippet}
</Story>

<Story name="Loading">
	{#snippet children()}
		<div style="width: 360px; display: grid; gap: 20px;">
			<Toggle bind:checked={isBuffering} label="Waiting on the owl post" />
			<Slider bind:value={kettleBuffer} loading={isBuffering} label="Parcel progress" />
			<Slider
				mode="progress"
				value={kettleBuffer}
				segments={bakeOffStages}
				loading={isBuffering}
				height={10}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Disabled">
	{#snippet children()}
		<div style="width: 360px; display: grid; gap: 20px;">
			<Slider value={45} disabled />
			<Slider value={45} segments={bakeOffStages} disabled />
			<Slider mode="progress" value={45} disabled />
		</div>
	{/snippet}
</Story>
