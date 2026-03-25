<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Fieldset from './Fieldset.svelte';
	import Button from '../Button/Button.svelte';
	import { InputField } from '../Input/index.ts';

	const { Story } = defineMeta({
		title: 'Components/Fieldset',
		component: Fieldset,
		tags: ['autodocs']
	});
</script>

<Story name="Basic">
	<div style="max-width: 500px;">
		<Fieldset legend="Account Settings">
			<InputField label="Username" placeholder="johndoe" />
			<InputField label="Email" type="email" placeholder="john@example.com" />
		</Fieldset>
	</div>
</Story>

<Story name="With Extra Actions">
	<div style="max-width: 500px;">
		<Fieldset legend="Notifications">
			{#snippet extra()}
				<Button size="small" label="Enable All" />
				<Button size="small" label="Reset" />
			{/snippet}

			<InputField
				label="Email Notifications"
				type="select"
				options={[
					{ value: 'on', label: 'On' },
					{ value: 'off', label: 'Off' }
				]}
			/>
			<InputField
				label="SMS Alerts"
				type="select"
				options={[
					{ value: 'on', label: 'On' },
					{ value: 'off', label: 'Off' }
				]}
			/>
		</Fieldset>
	</div>
</Story>

<Story name="Custom Heading Level">
	<div style="max-width: 500px; display: flex; flex-direction: column; gap: 2rem;">
		<Fieldset legend="Level 1 Heading" level={1}>
			<p>Used for primary sections.</p>
		</Fieldset>
		<Fieldset legend="Level 3 Heading" level={3}>
			<p>Used for nested subsections.</p>
		</Fieldset>
	</div>
</Story>

<Story name="In Form (ARIA group)">
	<div style="max-width: 500px;">
		<form onsubmit={(e) => e.preventDefault()}>
			<Fieldset legend="Personal Details" isInForm>
				<InputField label="First Name" />
				<InputField label="Last Name" />
			</Fieldset>
		</form>
	</div>
</Story>
