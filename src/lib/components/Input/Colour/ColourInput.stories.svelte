<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ColourInput from './ColourInput.svelte';
	import { Field } from '../index.ts';

	const { Story } = defineMeta({
		title: 'Components/Input/ColourInput',
		tags: ['autodocs']
	});
</script>

<Story name="Default">
	<div style="max-width: 400px;">
		<ColourInput value="#ff0000" />
	</div>
</Story>

<Story name="Sizes">
	<div style="max-width: 400px; display: flex; flex-direction: column; gap: 1rem;">
		<ColourInput size="small" value="#00ff00" />
		<ColourInput size="medium" value="#0000ff" />
		<ColourInput size="large" value="#ffff00" />
	</div>
</Story>

<Story name="As Field">
	<div style="max-width: 400px; display: flex; flex-direction: column; gap: 1rem;">
		<Field label="Pick a colour" hint="Select a colour for your theme">
			<ColourInput value="#6366f1" />
		</Field>
		<Field label="Disabled Colour">
			<ColourInput value="#e2e8f0" disabled />
		</Field>
		<Field label="Readonly Colour">
			<ColourInput value="#f43f5e" readonly />
		</Field>
	</div>
</Story>

<Story name="States">
	<div style="max-width: 400px; display: flex; flex-direction: column; gap: 1rem;">
		<ColourInput disabled value="#cccccc" />
		<ColourInput readonly value="#ff00ff" />
		<ColourInput required placeholder="Required*" />
	</div>
</Story>
