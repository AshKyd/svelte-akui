<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import InputGroup from './InputGroup.svelte';
	import InputField from './InputField.svelte';
	import Button from '../Button/Button.svelte';
	import Panel from '../Panel/Panel.svelte';
	import Padding from '../Padding/Padding.svelte';

	const { Story } = defineMeta({
		title: 'Components/Input/InputGroup',
		component: InputGroup,
		tags: ['autodocs']
	});
</script>

<Story name="Disabled Fields">
	<div style="max-width: 500px;">
		<Panel>
			<Padding size="l">
				<div style="display: flex; flex-direction: column; gap: 1rem;">
					<InputField label="Disabled Input" value="Cannot edit this" disabled />
					<InputField label="Readonly Input" value="Can select but not edit" readonly />
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
					<InputField label="Search" placeholder="Search components..." />
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
					<InputField label="First Name" placeholder="John" />
					<InputField label="Last Name" placeholder="Doe" />
					<Button label="Save" />
				</InputGroup>
			</Padding>
		</Panel>
	</div>
</Story>

<Story name="Size Inheritance">
	<div style="display: flex; flex-direction: column; gap: 2rem;">
		<InputGroup joined size="small">
			<InputField label="Small" placeholder="Small size..." />
			<Button label="Small" />
		</InputGroup>

		<InputGroup joined size="medium">
			<InputField label="Medium" placeholder="Medium size..." />
			<Button label="Medium" />
		</InputGroup>

		<InputGroup joined size="large">
			<InputField label="Large" placeholder="Large size..." />
			<Button label="Large" />
		</InputGroup>
	</div>
</Story>

<Story name="Mixed Content (Joined)">
	<div style="max-width: 600px;">
		<Panel>
			<Padding size="l">
				<InputGroup joined>
					<InputField
						label="Protocol"
						type="select"
						options={[
							{ value: 'http', label: 'http://' },
							{ value: 'https', label: 'https://' }
						]}
						style="width: 100px;"
					/>
					<InputField label="Domain" placeholder="example.com" />
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
					<InputField label="Search" placeholder="Search for files, users, and more..." />
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
					<InputField label="API Key" value="sk_test_51Mz..." readonly />
					<Button icon="clipboard" iconPosition="only" label="Copy" />
					<Button icon="arrow-clockwise" iconPosition="only" label="Regenerate" />
				</InputGroup>
			</Padding>
		</Panel>
	</div>
</Story>
