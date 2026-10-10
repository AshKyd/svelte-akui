<script lang="ts">
	import {
		TextInput,
		ClearableInput,
		PasswordInput,
		TextArea,
		Select,
		Typeahead,
		InputGroup,
		InputWithIcon,
		Field,
		Fieldset,
		SelectableItem,
		ControlGroup,
		ControlSection,
		ControlItemText,
		ControlItemExpanded,
		Button,
		Icon
	} from '../../../index.js';

	const sizes = ['small', 'medium', 'large'] as const;
	const textTypes = ['text', 'email', 'tel', 'url', 'search', 'number', 'date'] as const;
	const selectOptions = [
		{ value: 'a', label: 'Option A' },
		{ value: 'b', label: 'Option B' },
		{ value: 'c', label: 'Disabled option', disabled: true }
	];
	const typeaheadValues = [
		{ value: 'apple', label: 'Apple' },
		{ value: 'banana', label: 'Banana' },
		{ value: 'cherry', label: 'Cherry' }
	];

	let clearable = $state('Clear me');
	let checkedSettings = $state(true);
</script>

<section>
	<h2>Form elements</h2>

	<h3>Text inputs by size and variant</h3>
	<div class="demo-row">
		{#each sizes as size (size)}
			<div class="demo-cell">
				<TextInput {size} placeholder="{size} regular" />
				<TextInput {size} variant="ghost" placeholder="{size} ghost" />
			</div>
		{/each}
	</div>

	<h3>Text input types</h3>
	<div class="demo-row">
		{#each textTypes as type (type)}
			<div class="demo-cell">
				<TextInput {type} placeholder={type} />
			</div>
		{/each}
	</div>

	<h3>States</h3>
	<div class="demo-row">
		<div class="demo-cell"><TextInput placeholder="Required" required /></div>
		<div class="demo-cell"><TextInput value="Read only" readonly /></div>
		<div class="demo-cell"><TextInput value="Disabled" disabled /></div>
		<div class="demo-cell"><ClearableInput bind:value={clearable} placeholder="Clearable" /></div>
		<div class="demo-cell"><PasswordInput toggleable placeholder="Password" /></div>
	</div>

	<h3>Selection and long text</h3>
	<div class="demo-row">
		<div class="demo-cell"><TextArea autosize placeholder="Autosizing text area" /></div>
		<div class="demo-cell"><Select options={selectOptions} placeholder="Select…" /></div>
		<div class="demo-cell"><Select options={selectOptions} value="a" disabled /></div>
		<div class="demo-cell">
			<Typeahead values={typeaheadValues} placeholder="Typeahead…" />
		</div>
		<div class="demo-cell">
			<Typeahead allowFreetext value={['svelte', 'akui']} placeholder="Tags…" />
		</div>
	</div>

	<h3>Composition</h3>
	<div class="demo-row">
		<div class="demo-cell">
			<Field label="Field label" hint="Helpful hint text" required>
				<TextInput placeholder="Inside a Field" />
			</Field>
		</div>
		<div class="demo-cell">
			<InputGroup joined>
				<TextInput placeholder="Joined input" />
				<Button variant="accent">Go</Button>
			</InputGroup>
		</div>
		<div class="demo-cell">
			<InputWithIcon>
				{#snippet left()}<Icon name="search" />{/snippet}
				<TextInput placeholder="Icon on the left" />
			</InputWithIcon>
		</div>
		<div class="demo-cell">
			<Fieldset legend="Fieldset legend">
				<TextInput placeholder="First" />
				<TextInput placeholder="Second" />
			</Fieldset>
		</div>
	</div>

	<h3>Selectable items</h3>
	<div class="demo-row">
		<SelectableItem type="radio" group="demo-radio" value="one">Radio one</SelectableItem>
		<SelectableItem type="radio" group="demo-radio" value="two">Radio two</SelectableItem>
		<SelectableItem type="checkbox" checked>Checkbox checked</SelectableItem>
		<SelectableItem type="checkbox">Checkbox</SelectableItem>
		<SelectableItem type="checkbox" disabled>Checkbox disabled</SelectableItem>
	</div>

	<h3>Control groups</h3>
	<div class="demo-row">
		<div class="demo-cell">
			<ControlGroup>
				<ControlSection title="Section" icon="gear">
					<ControlItemText icon="house" label="Plain item" />
					<ControlItemText icon="person" label="Selected item" selected />
					<ControlItemText label="Checkbox item" controlType="checkbox" bind:checked={checkedSettings} />
				</ControlSection>
			</ControlGroup>
		</div>
		<div class="demo-cell">
			<ControlGroup>
				<ControlItemExpanded
					label="Expanded vertical"
					description="Description sits beneath the label."
				>
					{#snippet extraSnippet()}<TextInput placeholder="Extra control" />{/snippet}
				</ControlItemExpanded>
				<ControlItemExpanded
					label="Expanded horizontal"
					description="Control sits to the side."
					layout="horizontal"
					controlType="checkbox"
					checked
				/>
			</ControlGroup>
		</div>
	</div>
</section>
