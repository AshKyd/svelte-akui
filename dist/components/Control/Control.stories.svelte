<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { ControlGroup, ControlItem, ControlContent, ControlHeader } from './index.js';
	import { InputGroup } from '../Input/index.js';
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
			<ControlItem icon="person" label="Profile Settings" />
			<ControlItem icon="bell" label="Notifications" />

			<ControlContent>
				<div style="display: flex; flex-direction: column; gap: 0.75rem;">
					<ControlHeader label="Display Mode" />
					<InputGroup joined style="display: flex;">
						<Button style="flex: 1;" size="small" variant="accent" label="Light" />
						<Button style="flex: 1;" size="small" label="Dark" />
						<Button style="flex: 1;" size="small" label="Auto" />
					</InputGroup>
				</div>
			</ControlContent>

			<ControlContent>
				<div style="display: flex; flex-direction: column; gap: 0.5rem;">
					<ControlHeader label="Brightness" extra="80%" />
					<input type="range" style="width: 100%;" min="0" max="100" value="80" />
				</div>
			</ControlContent>

			<ControlItem icon="shield-lock" label="Privacy & Security" />
			<ControlItem icon="box-arrow-right" label="Sign Out" style="color: #ef4444;" />
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
