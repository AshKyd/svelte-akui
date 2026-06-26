<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { ControlGroup, ControlItemText, ControlItemExpanded, ControlSection } from './index.js';
	import { InputGroup } from '../Input/index.js';
	import Button from '../Button/Button.svelte';
	import LayoutContentWidth from '../LayoutContentWidth/LayoutContentWidth.svelte';

	const { Story } = defineMeta({
		title: 'Components/ControlGroup',
		tags: ['autodocs']
	});
</script>

<script lang="ts">
	let displayMode = $state('light');
	let cauldronTemp = $state(82);
	let toadHiss = $state(true);
	let autoSweep = $state(false);
	let broomSpeed = $state('moderate');
	let dispatchChecked = $state(true);

	// Settings section variables
	let owlPostEnabled = $state(true);
	let pixieShieldEnabled = $state(false);
</script>

<Story name="Control Group Cozy Demo">
	{#snippet children()}
		<LayoutContentWidth size="small">
			<ControlGroup>
				<ControlItemText icon="journal-bookmark" label="Gnome Council Dispatches" onclick={() => alert('Opening dispatches...')} />
				<ControlItemText icon="moon-stars" label="Dreamweaver Preferences" onclick={() => alert('Dreamweaver settings loaded.')} />

				<ControlItemExpanded label="Cauldron Brewing Temperature" extra={`${cauldronTemp}°C`} description="Set the heat for daily stew or standard healing brews.">
					<input type="range" style="width: 100%;" min="0" max="120" bind:value={cauldronTemp} />
				</ControlItemExpanded>

				<ControlItemExpanded label="Display Mode" description="Choose the magical lighting for your spellbook.">
					<InputGroup joined style="display: flex; width: 100%;">
						<Button style="flex: 1;" size="small" variant={displayMode === 'light' ? 'accent' : 'none'} label="Candlelight" onclick={() => displayMode = 'light'} />
						<Button style="flex: 1;" size="small" variant={displayMode === 'dark' ? 'accent' : 'none'} label="Moonlight" onclick={() => displayMode = 'dark'} />
						<Button style="flex: 1;" size="small" variant={displayMode === 'auto' ? 'accent' : 'none'} label="Will-o-Wisp" onclick={() => displayMode = 'auto'} />
					</InputGroup>
				</ControlItemExpanded>

				<ControlItemExpanded
					label="Toadstool Hiss Filter"
					description="Muffle background croaks and mushroom spores."
					layout="horizontal"
					controlType="checkbox"
					bind:checked={toadHiss}
				/>

				<ControlItemExpanded
					label="Auto-sweep Hearth"
					description="Brooms will sweep dust automatically at dusk."
					layout="horizontal"
					controlType="checkbox"
					bind:checked={autoSweep}
				/>

				<ControlItemText
					icon="send"
					label="Receive Dispatch Notifications"
					controlType="checkbox"
					bind:checked={dispatchChecked}
				/>

				<ControlItemText icon="door-open" label="Leave the Cottage" style="color: #ef4444;" onclick={() => alert('Goodbye!')} />
			</ControlGroup>
		</LayoutContentWidth>
	{/snippet}
</Story>

<Story name="Selection List (Radios)">
	{#snippet children()}
		<LayoutContentWidth size="small">
			<ControlGroup>
				<ControlItemText
					label="Moderate Broom Speed"
					controlType="radio"
					checked={broomSpeed === 'moderate'}
					onclick={() => broomSpeed = 'moderate'}
				/>
				<ControlItemText
					label="Fast (Windrider Spell)"
					controlType="radio"
					checked={broomSpeed === 'fast'}
					onclick={() => broomSpeed = 'fast'}
				/>
				<ControlItemText
					label="Comfortable Hover"
					controlType="radio"
					checked={broomSpeed === 'hover'}
					onclick={() => broomSpeed = 'hover'}
				/>
			</ControlGroup>
		</LayoutContentWidth>
	{/snippet}
</Story>

<Story name="Settings Page Layout">
	{#snippet children()}
		<LayoutContentWidth size="medium">
			<h2>Cottage Settings</h2>

			<ControlSection title="Audio Hardware" icon="mic">
				<ControlGroup>
					<ControlItemExpanded
						label="Noise Cancellation"
						description="Reduce background hiss and forest croaks."
						layout="horizontal"
						controlType="checkbox"
						bind:checked={toadHiss}
					/>
				</ControlGroup>
			</ControlSection>

			<ControlSection title="Post Preferences" icon="hash">
				<ControlGroup>
					<ControlItemExpanded
						label="Append #VoiceNote"
						description="Include the hashtag in posts so we can find them in the app."
						layout="horizontal"
						controlType="checkbox"
						bind:checked={dispatchChecked}
					/>
				</ControlGroup>
			</ControlSection>

			<ControlSection title="Security & Spells" icon="shield-lock">
				<ControlGroup>
					<ControlItemExpanded
						label="Owl Post Redirection"
						description="Encrypt dispatch deliveries via high-flying carrier owls."
						layout="horizontal"
						controlType="checkbox"
						bind:checked={owlPostEnabled}
					/>
					<ControlItemExpanded
						label="Pixie Shield Protection"
						description="Cast a minor protection ward against mischievous pixies."
						layout="horizontal"
						controlType="checkbox"
						bind:checked={pixieShieldEnabled}
					/>
				</ControlGroup>
			</ControlSection>
		</LayoutContentWidth>
	{/snippet}
</Story>

<Story name="Empty State">
	{#snippet children()}
		<LayoutContentWidth size="small">
			<ControlGroup>
				<!-- Empty control groups are valid but usually indicate no actions available -->
			</ControlGroup>
			<p style="text-align: center; color: var(--akui-fg-secondary);">No fairy circles or spells active</p>
		</LayoutContentWidth>
	{/snippet}
</Story>
