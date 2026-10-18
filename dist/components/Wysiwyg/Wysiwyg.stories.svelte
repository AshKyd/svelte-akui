<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Wysiwyg from './Wysiwyg.svelte';
	import type { SlashMenuConfig } from './WysiwygEditor.svelte';
	import { KEYBINDING_REFERENCE } from './extensions/Keybindings';

	const { Story } = defineMeta({
		title: 'Components/Wysiwyg',
		tags: ['autodocs']
	});

	// Only text and list commands — no code block or divider in the menu.
	const scopedSlashMenu: SlashMenuConfig = {
		items: (defaults) => defaults.filter(({ id }) => !['code-block', 'divider'].includes(id))
	};

	// Demonstrates a consumer adding their own command to the menu via `items`.
	const extendedSlashMenu: SlashMenuConfig = {
		items: (defaults) => [
			...defaults,
			{
				id: 'dragon-nap',
				label: 'Dragon Nap Notice',
				keywords: ['dragon', 'nap'],
				onRun: (editor) =>
					editor.chain().focus().insertContent('A dragon is napping here. Please tiptoe.').run()
			}
		]
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

	const witchErrands = `- [ ] Return the borrowed cauldron to Mrs Thistlewick
- [ ] Reshelve the overdue grimoires at the parish library
- [ ] Ask the council about broom parking on market day
- [x] Feed the toad
- [x] Sweep the moth wings off the porch`;
</script>

<Story name="Default">
	<Wysiwyg value="Hello, Tiptap!" />
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

<!-- Ticked items move to a collapsible "completed" section at the end of the list. -->
<Story name="Grouped Completed Tasks">
	<Wysiwyg value={witchErrands} groupCompletedTasks />
</Story>

<!-- An empty editor opens on an empty H1. Typing more than 20 characters turns it into a paragraph, once. -->
<Story name="Start With Heading (Auto-Demote)">
	<Wysiwyg
		value=""
		placeholder="Name your spell…"
		startWithHeading
		demoteLongHeadingAt={20}
		minHeight="120px"
	/>
</Story>

<!-- The "/" slash menu is opt-in via the `slashMenu` prop. -->
<Story name="Slash Menu (Defaults)">
	<Wysiwyg value="" placeholder="Type / to see the menu..." slashMenu />
</Story>

<Story name="Slash Menu (Scoped to Text & Lists)">
	<Wysiwyg
		value=""
		placeholder="Type / — only text and list commands appear"
		slashMenu={scopedSlashMenu}
	/>
</Story>

<Story name="Slash Menu (Custom Command via items)">
	<Wysiwyg
		value=""
		placeholder="Type / and look for 'Dragon Nap Notice'"
		slashMenu={extendedSlashMenu}
	/>
</Story>

<Story name="Slash Menu (Large)">
	<Wysiwyg value="" placeholder="Type / to see the roomier menu..." slashMenu={{ size: 'large' }} />
</Story>

<Story name="Keybindings">
	<ul>
		{#each KEYBINDING_REFERENCE as { keys, action } (keys)}
			<li><kbd>{keys}</kbd> — {action}</li>
		{/each}
	</ul>
	<Wysiwyg value="Try the shortcuts here." slashMenu minHeight="120px" />
</Story>
