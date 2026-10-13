<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';

	// No `component` here: we render Settings ourselves below.
	const { Story } = defineMeta({
		title: 'Components/Settings',
		tags: ['autodocs']
	});
</script>

<script lang="ts">
	import Settings from './Settings.svelte';
	import type { SettingsSection } from './types.js';
	import { ControlGroup, ControlItemExpanded, ControlSection } from '../ControlGroup/index.js';

	let broomSweeping = $state(true);
	let owlPost = $state(false);
	let selectedId = $state<string | null>(null);

	// Sections are defined as snippets-in-an-array so each story can share them.
	const sections: SettingsSection[] = [
		{ id: 'broom', label: 'Broom Parking', icon: 'house', description: 'Bays, curfews and tidy-ups', children: broomContent },
		{ id: 'post', label: 'Owl Post', icon: 'envelope', description: 'Deliveries and perching', children: postContent },
		{ id: 'about', label: 'About', icon: 'info-circle', description: 'Village hall version', children: aboutContent }
	];
</script>

{#snippet broomContent()}
	<ControlSection title="Evening rules">
		<ControlGroup>
			<ControlItemExpanded
				label="Sweep the bay after parking"
				description="Gnome volunteers will tidy leaf litter by morning."
				layout="horizontal"
				controlType="checkbox"
				bind:checked={broomSweeping}
			/>
		</ControlGroup>
	</ControlSection>
{/snippet}

{#snippet postContent()}
	<ControlSection title="Perching">
		<ControlGroup>
			<ControlItemExpanded
				label="Allow owls on the windowsill"
				description="Only between dusk and the first bakery bell."
				layout="horizontal"
				controlType="checkbox"
				bind:checked={owlPost}
			/>
		</ControlGroup>
	</ControlSection>
{/snippet}

{#snippet aboutContent()}
	<p>Village Hall Notices, version 0.3 (mossy).</p>
{/snippet}

<Story name="Desktop">
	{#snippet children()}
		<div style="width: 900px; max-width: 100%; height: 480px; border: 1px solid var(--akui-border-input);">
			<Settings {sections} title="Settings" onback={() => {}} />
		</div>
	{/snippet}
</Story>

<Story name="Mobile">
	{#snippet children()}
		<div style="width: 375px; max-width: 100%; height: 600px; border: 1px solid var(--akui-border-input);">
			<Settings {sections} title="Settings" onback={() => {}} />
		</div>
	{/snippet}
</Story>

<Story name="Controlled (router style)">
	{#snippet children()}
		<p>selectedId: <code>{selectedId ?? 'null'}</code></p>
		<div style="width: 375px; max-width: 100%; height: 520px; border: 1px solid var(--akui-border-input);">
			<Settings {sections} {selectedId} onselect={(id) => (selectedId = id)} />
		</div>
	{/snippet}
</Story>
