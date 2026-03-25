<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import InputGroup from './InputGroup.svelte';
	import { Field, TextInput, Select } from './index.ts';
	import Button from '../Button/Button.svelte';
	import Panel from '../Panel/Panel.svelte';
	import Padding from '../Padding/Padding.svelte';

	const { Story } = defineMeta({
		title: 'Components/Input/InputGroup',
		tags: ['autodocs']
	});
</script>

<Story name="Disabled Fields">
	<div style="max-width: 500px;">
		<Panel>
			<Padding size="l">
				<div style="display: flex; flex-direction: column; gap: 1rem;">
					<Field label="Disabled Input">
						<TextInput value="Cannot edit this" disabled />
					</Field>
					<Field label="Readonly Input">
						<TextInput value="Can select but not edit" readonly />
					</Field>
				</div>
			</Padding>
		</Panel>
	</div>
</Story>

<Story name="Joined Group (Default)">
	<div style="max-width: 500px;">
		<Panel>
			<Padding size="l">
				<p style="margin-bottom: 1rem; font-size: 0.875rem; color: var(--akui-fg-secondary);">
					Joint groups share a single outer shadow and border-radius.
				</p>
				<InputGroup joined>
					<Field label="Search">
						<TextInput placeholder="Search components..." />
					</Field>
					<Button variant="accent" label="Search" />
				</InputGroup>
			</Padding>
		</Panel>
	</div>
</Story>

<Story name="Standard Row (Gapped)">
	<div style="max-width: 500px;">
		<Panel>
			<Padding size="l">
				<InputGroup>
					<Field label="First Name">
						<TextInput placeholder="John" />
					</Field>
					<Field label="Last Name">
						<TextInput placeholder="Doe" />
					</Field>
					<Button label="Save" />
				</InputGroup>
			</Padding>
		</Panel>
	</div>
</Story>

<Story name="Size Inheritance">
	<div style="display: flex; flex-direction: column; gap: 2rem;">
		<InputGroup joined size="small">
			<Field label="Small">
				<TextInput placeholder="Small size..." />
			</Field>
			<Button label="Small" />
		</InputGroup>

		<InputGroup joined size="medium">
			<Field label="Medium">
				<TextInput placeholder="Medium size..." />
			</Field>
			<Button label="Medium" />
		</InputGroup>

		<InputGroup joined size="large">
			<Field label="Large">
				<TextInput placeholder="Large size..." />
			</Field>
			<Button label="Large" />
		</InputGroup>
	</div>
</Story>

<Story name="Mixed Content (Joined)">
	<div style="max-width: 600px;">
		<Panel>
			<Padding size="l">
				<InputGroup joined>
					<Field label="Protocol" style="width: 100px;">
						<Select
							options={[
								{ value: 'http', label: 'http://' },
								{ value: 'https', label: 'https://' }
							]}
						/>
					</Field>
					<Field label="Domain">
						<TextInput placeholder="example.com" />
					</Field>
					<Button variant="accent" icon="plus" iconPosition="only" label="Add" />
				</InputGroup>
			</Padding>
		</Panel>
	</div>
</Story>

<Story name="Legacy Button Group Pattern">
	<div style="max-width: 500px;">
		<Panel>
			<Padding size="l">
				<p style="margin-bottom: 1rem; font-size: 0.875rem; color: var(--akui-fg-secondary);">
					Replicating the old ButtonGroup functionality using InputGroup.
				</p>
				<InputGroup joined>
					<Button label="Left Action" />
					<Button label="Middle Action" />
					<Button label="Right Action" />
				</InputGroup>

				<div style="margin-top: 2rem;">
					<InputGroup joined size="small">
						<Button icon="align-left" iconPosition="only" label="Align Left" />
						<Button icon="align-center" iconPosition="only" label="Align Center" />
						<Button icon="align-right" iconPosition="only" label="Align Right" />
					</InputGroup>
				</div>
			</Padding>
		</Panel>
	</div>
</Story>

<Story name="Search Bar Pattern">
	<div style="max-width: 600px;">
		<Panel>
			<Padding size="l">
				<InputGroup joined style="width: 100%;">
					<Field label="Search">
						<TextInput placeholder="Search for files, users, and more..." />
					</Field>
					<Button variant="accent" label="Search" />
				</InputGroup>
			</Padding>
		</Panel>
	</div>
</Story>

<Story name="Input with Clear/Action Button">
	<div style="max-width: 400px;">
		<Panel>
			<Padding size="l">
				<InputGroup joined>
					<Field label="API Key">
						<TextInput value="sk_test_51Mz..." readonly />
					</Field>
					<Button icon="clipboard" iconPosition="only" label="Copy" />
					<Button icon="arrow-clockwise" iconPosition="only" label="Regenerate" />
				</InputGroup>
			</Padding>
		</Panel>
	</div>
</Story>
