<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import LocationPicker from './LocationPicker.svelte';

	const { Story } = defineMeta({
		title: 'Components/LocationPicker',
		tags: ['autodocs']
	});
</script>

<script lang="ts">
	let interactiveLng = $state(151.2093);
	let interactiveLat = $state(-33.8688);
	let interactiveName = $state('Sydney');
</script>

<Story name="Interactive">
	{#snippet children()}
		<div
			style="max-width: 500px; margin: 0 auto; display: flex; flex-direction: column; gap: 1rem;"
		>
			<LocationPicker
				bind:longitude={interactiveLng}
				bind:latitude={interactiveLat}
				bind:name={interactiveName}
			/>
			<p style="font-size: 0.85rem; color: var(--akui-fg-secondary, #6b7280);">
				Selected: <strong>{interactiveName || 'Unresolved'}</strong> ({interactiveLat}, {interactiveLng})
			</p>
		</div>
	{/snippet}
</Story>

<Story name="Readonly">
	{#snippet children()}
		<div style="max-width: 500px; margin: 0 auto;">
			<LocationPicker
				longitude={144.9631}
				latitude={-37.8136}
				name="Melbourne"
				readonly={true}
			/>
		</div>
	{/snippet}
</Story>
