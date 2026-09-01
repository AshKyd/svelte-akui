<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Wysiwyg from './Wysiwyg.svelte';

	const { Story } = defineMeta({
		title: 'Components/Wysiwyg',
		tags: ['autodocs']
	});
</script>

<Story name="Default">
	<Wysiwyg value="Hello, Milkdown Crepe!" />
</Story>

<Story name="Empty (No Placeholder)">
	<Wysiwyg value="" />
</Story>

<Story name="Custom Placeholder">
	<Wysiwyg value="" placeholder="Write your thoughts here..." />
</Story>

<Story name="Cosy Fantasy Notice Board">
	<Wysiwyg
		value={`# The Hearthside Chronicle

Welcome to the editor of **The Hearthside Chronicle**! 
Here is a draft of the upcoming notices for the village of Oakhaven:

## Local Council & Guild Notices
- **Gnome Orchard Cooperative**: The cider press is repaired! Volunteers needed for the elderberry harvest on Thursday. Bring your own bucket.
- **Divination Group**: Meeting is postponed. The committee regrets they did not foresee the tea-leaf shipment being delayed by the river sprites.
- **Napping Dragon Bylaws**: Friendly reminder that napping dragons in public squares must be draped with a safety blanket to prevent stubbed toes.

*May your hearth be warm and your kettle always whistling.*`}
	/>
</Story>

