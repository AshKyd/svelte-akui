<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Divider from './Divider.svelte';
	import StorybookDecorator from '../StorybookDecorator.svelte';

	const { Story } = defineMeta({
		title: 'Layout & Foundation/Divider',
		component: Divider,
		decorators: [() => StorybookDecorator]
	});
</script>

<Story name="Horizontal (Default)">
	<div style="width: 300px; background: var(--akui-bg-secondary); padding: 1rem; border-radius: var(--akui-radius-m);">
		<p style="margin: 0 0 1rem 0; color: var(--akui-fg);">Top Content</p>
		<Divider />
		<p style="margin: 1rem 0 0 0; color: var(--akui-fg);">Bottom Content</p>
	</div>
</Story>

<Story name="Vertical">
	<div style="height: 150px; background: var(--akui-bg-secondary); padding: 1rem; border-radius: var(--akui-radius-m); display: flex; gap: 1rem;">
		<p style="margin: 0; color: var(--akui-fg); flex: 1;">Left Content</p>
		<Divider orientation="vertical" />
		<p style="margin: 0; color: var(--akui-fg); flex: 1;">Right Content</p>
	</div>
</Story>
