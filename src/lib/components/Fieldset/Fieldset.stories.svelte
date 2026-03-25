<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Fieldset from './Fieldset.svelte';
	import Button from '../Button/Button.svelte';
	import { Field, TextInput, Select } from '../Input/index.ts';

	const { Story } = defineMeta({
		title: 'Components/Fieldset',
		tags: ['autodocs']
	});
</script>

<Story name="Basic">
	<div style="max-width: 500px;">
		<Fieldset legend="Account Settings">
			<Field label="Username">
				<TextInput placeholder="johndoe" />
			</Field>
			<Field label="Email">
				<TextInput type="email" placeholder="john@example.com" />
			</Field>
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

			<Field label="Email Notifications">
				<Select
					options={[
						{ value: 'on', label: 'On' },
						{ value: 'off', label: 'Off' }
					]}
				/>
			</Field>
			<Field label="SMS Alerts">
				<Select
					options={[
						{ value: 'on', label: 'On' },
						{ value: 'off', label: 'Off' }
					]}
				/>
			</Field>
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
				<Field label="First Name">
					<TextInput />
				</Field>
				<Field label="Last Name">
					<TextInput />
				</Field>
			</Fieldset>
		</form>
	</div>
</Story>
