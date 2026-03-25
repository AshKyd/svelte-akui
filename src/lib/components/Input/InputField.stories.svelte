<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import InputField from './InputField.svelte';

	const { Story } = defineMeta({
		title: 'Components/Input/InputField',
		component: InputField,
		tags: ['autodocs']
	});
</script>

<Story name="Basic Inputs">
	<div style="max-width: 400px; display: flex; flex-direction: column; gap: 1.5rem;">
		<InputField label="Text Input" placeholder="Type something..." />
		<InputField label="Email Input" type="email" placeholder="you@example.com" />
		<InputField label="Password Input" type="password" value="secret" />
		<InputField label="Number Input" type="number" value={42} />
	</div>
</Story>

<Story name="Select & Textarea">
	<div style="max-width: 400px; display: flex; flex-direction: column; gap: 1.5rem;">
		<InputField
			label="Select Role"
			type="select"
			options={[
				{ value: 'dev', label: 'Developer' },
				{ value: 'des', label: 'Designer' },
				{ value: 'ops', label: 'Operations' }
			]}
		/>
		<InputField label="Biography" type="textarea" placeholder="Tell us about yourself..." />
	</div>
</Story>

<Story name="States & Hints">
	<div style="max-width: 400px; display: flex; flex-direction: column; gap: 1.5rem;">
		<InputField label="Required Field" required placeholder="Required..." />
		<InputField label="Disabled Field" disabled value="Cannot edit this" />
		<InputField label="Readonly Field" readonly value="https://akui.design" />
		<InputField label="With Hint" hint="Enter your full legal name." placeholder="John Doe" />
	</div>
</Story>
