<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';

	// No `component` here: each story renders SelectableItem itself, with its own contents.
	const { Story } = defineMeta({
		title: 'Components/SelectableItem'
	});
</script>

<script lang="ts">
	import SelectableItem from './SelectableItem.svelte';
	import Small from '../Small/Small.svelte';

	const cottages = [
		{ value: 'toadstool', label: 'Toadstool Cottage', blurb: 'Damp, but cosy.' },
		{ value: 'hollow', label: 'Hollow Oak', blurb: 'Owls on the night shift.' },
		{ value: 'teapot', label: 'Teapot Lodge', blurb: 'Always warm.' }
	];
	const chores = [
		{ value: 'moss', label: 'Sweep the moss' },
		{ value: 'lanterns', label: 'Trim the lanterns' },
		{ value: 'jam', label: 'Label the jam' }
	];

	let cottage = $state('hollow');
	let ticked = $state<string[]>(['jam']);
	let submitted = $state('');
</script>

<Story name="Radio group">
	{#snippet children()}
		<div style="padding: 1rem; display: flex; gap: 1rem; flex-wrap: wrap;" role="radiogroup" aria-label="Cottage">
			{#each cottages as item (item.value)}
				<SelectableItem name="cottage" value={item.value} bind:group={cottage}>
					<div style="padding: 0.75rem 1rem; width: 10rem;">
						<strong>{item.label}</strong><br />
						<Small>{item.blurb}</Small>
					</div>
				</SelectableItem>
			{/each}
		</div>
		<p style="padding: 0 1rem;"><Small>Chosen: {cottage}</Small></p>
	{/snippet}
</Story>

<Story name="Checkboxes">
	{#snippet children()}
		<div style="padding: 1rem; display: flex; gap: 1rem; flex-wrap: wrap;">
			{#each chores as item (item.value)}
				<SelectableItem
					type="checkbox"
					name="chores"
					value={item.value}
					checked={ticked.includes(item.value)}
					onchange={(event) => {
						const on = (event.currentTarget as HTMLInputElement).checked;
						ticked = on ? [...ticked, item.value] : ticked.filter((v) => v !== item.value);
					}}
				>
					<div style="padding: 0.75rem 1rem;">{item.label}</div>
				</SelectableItem>
			{/each}
		</div>
		<p style="padding: 0 1rem;"><Small>Ticked: {ticked.join(', ') || 'nothing'}</Small></p>
	{/snippet}
</Story>

<Story name="Inside a form">
	{#snippet children()}
		<form
			style="padding: 1rem; display: flex; flex-direction: column; gap: 1rem;"
			onsubmit={(event) => {
				event.preventDefault();
				submitted = JSON.stringify(Object.fromEntries(new FormData(event.currentTarget as HTMLFormElement)));
			}}
		>
			<div style="display: flex; gap: 1rem; flex-wrap: wrap;">
				{#each cottages as item, index (item.value)}
					<SelectableItem name="home" value={item.value} required={index === 0}>
						<div style="padding: 0.75rem 1rem;">{item.label}</div>
					</SelectableItem>
				{/each}
			</div>
			<div style="display: flex; gap: 1rem;">
				<button type="reset">Reset</button>
				<button type="submit">Submit</button>
			</div>
			<Small>Submitted: {submitted || 'nothing yet'}</Small>
		</form>
	{/snippet}
</Story>

<Story name="Disabled">
	{#snippet children()}
		<div style="padding: 1rem; display: flex; gap: 1rem;">
			<SelectableItem name="locked" value="a" disabled>
				<div style="padding: 0.75rem 1rem;">Locked pantry</div>
			</SelectableItem>
			<SelectableItem type="checkbox" checked disabled>
				<div style="padding: 0.75rem 1rem;">Locked and ticked</div>
			</SelectableItem>
		</div>
	{/snippet}
</Story>
