<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Wysiwyg from './Wysiwyg.svelte';
	import type { SlashMenuConfig } from './WysiwygEditor.svelte';

	const { Story } = defineMeta({
		title: 'Components/Wysiwyg',
		tags: ['autodocs']
	});

	// Only headings, blockquotes, dividers and lists — no images/tables/code/math in the menu.
	const scopedSlashMenu: SlashMenuConfig = {
		advancedGroup: null
	};

	// Demonstrates a consumer adding their own command to the menu via `buildMenu`.
	const extendedSlashMenu: SlashMenuConfig = {
		advancedGroup: null,
		buildMenu: (builder) => {
			builder.addGroup('oakhaven', 'Oakhaven').addItem('dragon-nap', {
				label: 'Dragon Nap Notice',
				icon: '🐉',
				onRun: async (ctx) => {
					const { editorViewCtx } = await import('@milkdown/kit/core');
					const view = ctx.get(editorViewCtx);
					view.dispatch(view.state.tr.insertText('A dragon is napping here. Please tiptoe.'));
				}
			});
		}
	};

	const fantasyNoticeBoard = `# The Hearthside Chronicle

Welcome to the editor of **The Hearthside Chronicle**! 
Here is a draft of the upcoming notices for the village of Oakhaven:

## Local Council & Guild Notices
- **Gnome Orchard Cooperative**: The cider press is repaired! Run \`brew-cider --elderberry\` or bring your own bucket on Thursday.
- **Divination Group**: Meeting is postponed. The committee regrets they did not foresee the tea-leaf shipment being delayed by the river sprites.
- **Napping Dragon Bylaws**: Friendly reminder that napping dragons in public squares must be draped with a safety blanket to prevent stubbed toes.

\`\`\`potion-recipe
# Draught of Peaceful Dreams
1. Steep 3 dried chamomile flowers
2. Add half a drop of star-dew
3. Stir counter-clockwise twice
\`\`\`

*May your hearth be warm and your kettle always whistling.*`;
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

<!-- A short editor for quick-entry panels, where the default 250px would dominate the page. -->
<Story name="Compact">
	<Wysiwyg value="" placeholder="Take a note…" minHeight="80px" />
</Story>

<Story name="Cosy Fantasy Notice Board">
	<Wysiwyg value={fantasyNoticeBoard} />
</Story>

<!-- The "/" slash menu and block-drag-handle are opt-in via the `slashMenu` prop. -->
<Story name="Slash Menu (Defaults)">
	<Wysiwyg value="" placeholder="Type / to see the menu..." slashMenu />
</Story>

<Story name="Slash Menu (Scoped to Text & Lists)">
	<Wysiwyg
		value=""
		placeholder="Type / — only headings, blockquote, dividers and lists appear"
		slashMenu={scopedSlashMenu}
	/>
</Story>

<Story name="Slash Menu (Custom Command via buildMenu)">
	<Wysiwyg
		value=""
		placeholder="Type / and look for the 'Oakhaven' group"
		slashMenu={extendedSlashMenu}
	/>
</Story>
