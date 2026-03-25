<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { ControlGroup, ControlButton, ControlContent, ControlHeader } from './index.ts';
	import ButtonGroup from '../ButtonGroup/ButtonGroup.svelte';
	import Button from '../Button/Button.svelte';
	import Padding from '../Padding/Padding.svelte';

	const { Story } = defineMeta({
		title: 'Components/Control',
		component: ControlGroup,
		tags: ['autodocs']
	});
</script>

<Story name="Control Group Demo">
	<div
		style="max-width: 320px; border: 1px solid var(--akui-border-input); border-radius: var(--akui-radius-m); overflow: hidden; background: var(--akui-bg);"
	>
		<ControlGroup>
			<ControlButton icon="person" label="Profile Settings" />
			<ControlButton icon="bell" label="Notifications" />

			<ControlContent>
				<div style="display: flex; flex-direction: column; gap: 0.75rem;">
					<ControlHeader label="Display Mode" />
					<ButtonGroup>
						<Button style="flex: 1;" size="small" variant="accent">Light</Button>
						<Button style="flex: 1;" size="small">Dark</Button>
						<Button style="flex: 1;" size="small">Auto</Button>
					</ButtonGroup>
				</div>
			</ControlContent>

			<ControlContent>
				<div style="display: flex; flex-direction: column; gap: 0.5rem;">
					<ControlHeader label="Brightness" extra="80%" />
					<input type="range" style="width: 100%;" min="0" max="100" value="80" />
				</div>
			</ControlContent>

			<ControlButton icon="shield-lock" label="Privacy & Security" />
			<ControlButton icon="box-arrow-right" label="Sign Out" style="color: #ef4444;" />
		</ControlGroup>
	</div>
</Story>

<Story name="Empty State">
	<div
		style="max-width: 320px; border: 1px solid var(--akui-border-input); border-radius: var(--akui-radius-m); padding: 1rem; text-align: center; color: var(--akui-fg-secondary);"
	>
		<ControlGroup>
			<!-- Empty control groups are valid but usually indicate no actions available -->
		</ControlGroup>
		<p style="font-size: 0.875rem;">No actions available</p>
	</div>
</Story>
