<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Loader from './Loader.svelte';

	const { Story } = defineMeta({
		title: 'Components/Loader',
		component: Loader,
		tags: ['autodocs']
	});
</script>

<Story name="Default">
	<Loader />
</Story>
