<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Field from './Field.svelte';
	import TextInput from '../Text/TextInput.svelte';
	import TextArea from '../TextArea/TextArea.svelte';
	import Select from '../Select/Select.svelte';

	const { Story } = defineMeta({
		title: 'Components/Input/Field',
		tags: ['autodocs']
	});
</script>

<Story name="Standard Usage">
	<div style="max-width: 400px; display: flex; flex-direction: column; gap: 1.5rem;">
		<Field label="Username" for="user" hint="This will be your public display name.">
			<TextInput id="user" placeholder="e.g. jdoe" />
		</Field>

		<Field label="Biography" for="bio" required>
			<TextArea id="bio" placeholder="Tell us about yourself..." />
		</Field>

		<Field label="Role" for="role">
			<Select
				id="role"
				placeholder="Select a role"
				options={[
					{ value: 'admin', label: 'Administrator' },
					{ value: 'user', label: 'User' }
				]}
			/>
		</Field>
	</div>
</Story>

<Story name="Sizes">
	<div style="max-width: 400px; display: flex; flex-direction: column; gap: 1.5rem;">
		<Field label="Small Field" for="s1">
			<TextInput id="s1" size="small" placeholder="Small input" />
		</Field>
		<Field label="Medium Field" for="m1">
			<TextInput id="m1" size="medium" placeholder="Medium input" />
		</Field>
		<Field label="Large Field" for="l1">
			<TextInput id="l1" size="large" placeholder="Large input" />
		</Field>
	</div>
</Story>
