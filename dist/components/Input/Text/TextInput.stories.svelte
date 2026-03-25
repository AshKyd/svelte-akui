<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TextInput from './TextInput.svelte';

	const { Story } = defineMeta({
		title: 'Components/Input/TextInput',
		tags: ['autodocs']
	});
</script>

<Story name="Standard Types">
	<div style="max-width: 400px; display: flex; flex-direction: column; gap: 1rem;">
		<TextInput placeholder="Text" />
		<TextInput type="email" placeholder="Email" />
		<TextInput type="number" placeholder="Number" />
		<TextInput type="tel" placeholder="Telephone" />
		<TextInput type="url" placeholder="URL" />
		<TextInput type="search" placeholder="Search" />
	</div>
</Story>

<Story name="Sizes">
	<div style="max-width: 400px; display: flex; flex-direction: column; gap: 1rem;">
		<TextInput size="small" placeholder="Small input" />
		<TextInput size="medium" placeholder="Medium input" />
		<TextInput size="large" placeholder="Large input" />
	</div>
</Story>

<Story name="States">
	<div style="max-width: 400px; display: flex; flex-direction: column; gap: 1rem;">
		<TextInput disabled value="Disabled input" />
		<TextInput readonly value="Readonly input" />
		<TextInput required placeholder="Required*" />
	</div>
</Story>
