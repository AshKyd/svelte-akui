<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Components/FilePicker',
		tags: ['autodocs']
	});
</script>

<script lang="ts">
	import FilePicker from './FilePicker.svelte';
	import Button from '../Button/Button.svelte';
	import Icon from '../Icon/Icon.svelte';
	import Padding from '../Padding/Padding.svelte';
	import Small from '../Small/Small.svelte';

	let chosenFiles = $state<File[]>([]);

	function handleFileChange(files: File[]) {
		chosenFiles = files;
	}

	function clearSelection() {
		chosenFiles = [];
	}
</script>

<Story name="Regular FilePicker">
	<FilePicker label="Choose File" onchange={handleFileChange} />
</Story>

<Story name="Accent Variant">
	<FilePicker variant="accent" label="Upload Document" icon="cloud-arrow-up" onchange={handleFileChange} />
</Story>

<Story name="Ghost Variant">
	<FilePicker variant="ghost" label="Select Photos" icon="image" accept="image/*" multiple={true} onchange={handleFileChange} />
</Story>

<Story name="Custom Snippet Content">
	<FilePicker variant="regular">
		<strong>Choose Files...</strong>
	</FilePicker>
</Story>

<Story name="Sizes">
	<div style="display: flex; gap: 0.5rem; align-items: center;">
		<FilePicker size="small" label="Small Picker" />
		<FilePicker size="medium" label="Medium Picker" />
		<FilePicker size="large" label="Large Picker" />
	</div>
</Story>

<Story name="Stateful Selection Demo">
	<div style="max-width: 400px; display: flex; flex-direction: column; gap: var(--akui-space-s, 0.5rem); border: 1px solid var(--akui-border, #dee2e6); padding: var(--akui-space-m, 1rem); border-radius: var(--akui-radius-m, 8px);">
		<div style="display: flex; gap: var(--akui-space-s, 0.5rem);">
			<FilePicker
				variant="accent"
				label="Select Files"
				icon="files"
				multiple={true}
				onchange={handleFileChange}
			/>
			{#if chosenFiles.length > 0}
				<Button variant="ghost" label="Clear" onclick={clearSelection} />
			{/if}
		</div>

		{#if chosenFiles.length > 0}
			<div style="margin-top: var(--akui-space-s, 0.5rem); display: flex; flex-direction: column; gap: var(--akui-space-xs, 0.25rem);">
				<Small><strong>Selected Files ({chosenFiles.length}):</strong></Small>
				<ul style="margin: 0; padding-left: var(--akui-space-m, 1rem); font-size: 0.875rem; color: var(--akui-fg, #111827);">
					{#each chosenFiles as file}
						<li>{file.name} ({Math.round(file.size / 1024)} KB)</li>
					{/each}
				</ul>
			</div>
		{:else}
			<div style="font-size: 0.875rem; color: var(--akui-fg-secondary, #6c757d); font-style: italic;">
				No files selected
			</div>
		{/if}
	</div>
</Story>
