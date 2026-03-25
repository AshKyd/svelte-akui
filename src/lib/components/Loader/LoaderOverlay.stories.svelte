<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import LoaderOverlay from './LoaderOverlay.svelte';
	import Panel from '../Panel/Panel.svelte';
	import Padding from '../Padding/Padding.svelte';

	const { Story } = defineMeta({
		title: 'Components/LoaderOverlay',
		component: LoaderOverlay,
		tags: ['autodocs']
	});
</script>

<Story name="Default">
	<div
		style="position: relative; height: 200px; width: 300px; border: 1px solid var(--akui-border-input);"
	>
		<LoaderOverlay />
	</div>
</Story>

<Story name="In Panel">
	<div style="position: relative; display: inline-block;">
		<Panel>
			<Padding>
				<h3>Panel Content</h3>
				<p>This content is being loaded...</p>
				<p>Additional details here.</p>
			</Padding>
		</Panel>
		<LoaderOverlay opacity={0.7} />
	</div>
</Story>

<Story name="Custom Styles">
	<div
		style="position: relative; height: 200px; width: 300px; border: 1px solid var(--akui-border-input);"
	>
		<LoaderOverlay backdrop="rgba(0,0,0,0.8)" colour="white" size="3rem" />
	</div>
</Story>
