<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Loader from './Loader.svelte';
	import Button from '../Button/Button.svelte';

	const { Story } = defineMeta({
		title: 'Components/Loader',
		component: Loader,
		tags: ['autodocs'],
		argTypes: {
			size: {
				control: { type: 'text' }
			},
			colour: {
				control: { type: 'color' }
			}
		}
	});
</script>

<Story name="Default">
	<Loader />
</Story>

<Story name="Sizes">
	<div style="display: flex; align-items: center; gap: 1rem;">
		<Loader size="1rem" />
		<Loader size="1.5rem" />
		<Loader size="2rem" />
		<Loader size="3rem" />
	</div>
</Story>

<Story name="Colours">
	<div style="display: flex; align-items: center; gap: 1rem;">
		<Loader colour="var(--akui-bg-accent)" />
		<Loader colour="var(--akui-fg-secondary)" />
		<Loader colour="red" />
	</div>
</Story>

<Story name="In Button">
	<Button variant="accent">
		<Loader size="1em" colour="white" />
		Loading...
	</Button>
</Story>
