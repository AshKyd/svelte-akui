<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ClearableInput from './ClearableInput.svelte';

	const { Story } = defineMeta({
		title: 'Components/Input/ClearableInput',
		component: ClearableInput,
		tags: ['autodocs']
	});
</script>

<Story name="Default">
	<div style="max-width: 400px;">
		<ClearableInput placeholder="Type something to see the clear button..." />
	</div>
</Story>

<Story name="With Initial Value">
	<div style="max-width: 400px;">
		<ClearableInput value="Clear me!" placeholder="Search..." />
	</div>
</Story>

<Story name="Sizes">
	<div style="max-width: 400px; display: flex; flex-direction: column; gap: 1rem;">
		<ClearableInput size="small" value="Small" />
		<ClearableInput size="medium" value="Medium" />
		<ClearableInput size="large" value="Large" />
	</div>
</Story>

<Story name="Disabled State">
	<div style="max-width: 400px;">
		<ClearableInput disabled value="Cannot clear this" />
	</div>
</Story>
