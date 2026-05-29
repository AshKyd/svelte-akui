<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ProgressBar from './ProgressBar.svelte';
	import StorybookDecorator from '../StorybookDecorator.svelte';

	const { Story } = defineMeta({
		title: 'Components/ProgressBar',
		decorators: [() => StorybookDecorator]
	});
</script>

<Story name="Default">
	<ProgressBar value={60} max={100} />
</Story>

<Story name="Colours">
	<div style="display: flex; flex-direction: column; gap: 20px; width: 300px;">
		<ProgressBar value={10} colour="accent" />
		<ProgressBar value={25} colour="blue" />
		<ProgressBar value={40} colour="green" />
		<ProgressBar value={55} colour="orange" />
		<ProgressBar value={70} colour="pink" />
		<ProgressBar value={85} colour="purple" />
		<ProgressBar value={100} colour="amber" />
	</div>
</Story>

<Story name="Sizes">
	<div style="display: flex; flex-direction: column; gap: 20px; width: 300px;">
		<ProgressBar value={50} size="small" />
		<ProgressBar value={50} size="medium" />
		<ProgressBar value={50} size="large" />
	</div>
</Story>
