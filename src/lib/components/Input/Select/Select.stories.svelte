<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Select from './Select.svelte';

	const { Story } = defineMeta({
		title: 'Components/Input/Select',
		tags: ['autodocs']
	});

	const options = [
		{ value: 'potion-brewer', label: 'Apprentice Potion Brewer' },
		{ value: 'toadstool-forager', label: 'Senior Toadstool Forager' },
		{ value: 'parish-diviner', label: 'Parish Diviner & Cloud Whisperer' },
		{ value: 'hedge-witch', label: 'Registered Hedge Witch' }
	];
</script>

<Story name="Basic Usage">
	<div style="max-width: 400px;">
		<Select placeholder="Choose your guild occupation…" {options} />
	</div>
</Story>

<Story name="Sizes">
	<div style="max-width: 400px; display: flex; flex-direction: column; gap: 1rem;">
		<Select size="small" {options} />
		<Select size="medium" {options} />
		<Select size="large" {options} />
	</div>
</Story>

<Story name="Disabled">
	<div style="max-width: 400px;">
		<Select disabled {options} />
	</div>
</Story>
