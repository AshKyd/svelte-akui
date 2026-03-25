<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PasswordInput from './PasswordInput.svelte';

	const { Story } = defineMeta({
		title: 'Components/Input/PasswordInput',
		tags: ['autodocs']
	});
</script>

<Story name="Toggleable (Default)">
	<div style="max-width: 400px;">
		<PasswordInput placeholder="Enter password" value="hunter2" />
	</div>
</Story>

<Story name="Simple (No toggle)">
	<div style="max-width: 400px;">
		<PasswordInput placeholder="Enter password" value="secret" toggleable={false} />
	</div>
</Story>

<Story name="Sizes">
	<div style="max-width: 400px; display: flex; flex-direction: column; gap: 1rem;">
		<PasswordInput size="small" placeholder="Small" />
		<PasswordInput size="medium" placeholder="Medium" />
		<PasswordInput size="large" placeholder="Large" />
	</div>
</Story>

<Story name="Disabled">
	<div style="max-width: 400px;">
		<PasswordInput disabled value="cannot see this" />
	</div>
</Story>
