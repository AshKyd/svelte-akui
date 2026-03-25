<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TextArea from './TextArea.svelte';

	const { Story } = defineMeta({
		title: 'Components/Input/TextArea',
		tags: ['autodocs']
	});
</script>

<Story name="Basic Usage">
	<div style="max-width: 400px;">
		<TextArea placeholder="Tell us about yourself..." />
	</div>
</Story>

<Story name="Sizes">
	<div style="max-width: 400px; display: flex; flex-direction: column; gap: 1rem;">
		<TextArea size="small" placeholder="Small textarea" />
		<TextArea size="medium" placeholder="Medium textarea" />
		<TextArea size="large" placeholder="Large textarea" />
	</div>
</Story>

<Story name="States">
	<div style="max-width: 400px; display: flex; flex-direction: column; gap: 1rem;">
		<TextArea disabled value="Disabled textarea" />
		<TextArea readonly value="Readonly textarea" />
	</div>
</Story>
