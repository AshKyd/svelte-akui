<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Tabs from './Tabs.svelte';
	import TextInput from '../Input/Text/TextInput.svelte';
	import Field from '../Input/Field/Field.svelte';

	const { Story } = defineMeta({
		title: 'Components/Tabs',
		tags: ['autodocs']
	});
</script>

<script lang="ts">
	let activeId = $state('tab1');
</script>

{#snippet fileContent()}
	<div style="display: flex; flex-direction: column; gap: 1rem;">
		<p>Manage your files here.</p>
		<Field label="Filename">
			<TextInput placeholder="Untitled.txt" />
		</Field>
	</div>
{/snippet}

{#snippet viewContent()}
	<p>Adjust your view settings.</p>
{/snippet}

{#snippet settingsContent()}
	<p>Configure application settings.</p>
{/snippet}

<Story name="Full Featured">
	<div style="max-width: 600px;">
		<Tabs
			items={[
				{ id: 'file', label: 'File', content: fileContent },
				{ id: 'view', label: 'View', content: viewContent },
				{ id: 'settings', label: 'Settings', content: settingsContent }
			]}
		/>
	</div>
</Story>

<Story name="Navigation Only">
	<div style="max-width: 600px;">
		<p style="margin-bottom: 2rem;">Content is managed outside the component.</p>
		<Tabs
			items={[
				{ id: 'tab1', label: 'First Tab' },
				{ id: 'tab2', label: 'Second Tab' },
				{ id: 'tab3', label: 'Third Tab' }
			]}
		/>
	</div>
</Story>

<Story name="Dynamic Active Tab">
	<div style="max-width: 600px;">
		<div style="margin-bottom: 1rem;">
			Active Tab: <strong>{activeId}</strong>
		</div>
		<Tabs
			bind:activeId
			items={[
				{ id: 'tab1', label: 'Tab 1', content: fileContent },
				{ id: 'tab2', label: 'Tab 2', content: viewContent }
			]}
		/>
	</div>
</Story>
