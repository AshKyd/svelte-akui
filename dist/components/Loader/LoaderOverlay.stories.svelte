<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import LoaderOverlay from './LoaderOverlay.svelte';

	const { Story } = defineMeta({
		title: 'Components/LoaderOverlay',
		component: LoaderOverlay,
		tags: ['autodocs']
	});
</script>

<Story name="Default">
	<div
		style="position: relative; height: 150px; width: 250px; border: 1px solid var(--akui-border-input); border-radius: 8px; overflow: hidden;"
	>
		<LoaderOverlay />
	</div>
</Story>
