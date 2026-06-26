<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Components/MarkdownContent',
		tags: ['autodocs']
	});
</script>

<script lang="ts">
	import MarkdownContent from './MarkdownContent.svelte';
	import LayoutContentWidth from '../LayoutContentWidth/LayoutContentWidth.svelte';
</script>

<Story name="Default / Simple Content">
	{#snippet children()}
		<LayoutContentWidth size="medium">
			<MarkdownContent
				content={`
# The Meadow Haven Pixie Dispatch
*Est. 842 by the Elderberry Grove*

Welcome to this week's issue! Today we are covering the local news and tea brewing recommendations.

## Elderberry Tea Recipe
For a slow Sunday afternoon, try this gentle recipe perfected by Barnaby, our resident napping dragon:
1. Harvest **fresh elderberries** at sunrise when the dew is sweetest.
2. Steep with three crushed leaves of **sun-warmed mint**.
3. Let it simmer gently on a stone warmed by a sleeping dragon's snout. Do not disturb the dragon.
4. Add a drop of wild clover honey.
				`}
			/>
		</LayoutContentWidth>
	{/snippet}
</Story>

<Story name="Rich Formatting & Tables">
	{#snippet children()}
		<LayoutContentWidth size="medium">
			<MarkdownContent
				content={`
# Mossy Bottom Village Council Meeting Minutes
**Date:** Midsummer Eve
**Chair:** Elder Hazelwood (Gnome)

### Agenda & Discussion

The meeting commenced with a status report on the **Pixie Relocation Initiative**. Several pixies have been tying the tails of sleeping badgers into ornate bows, causing a minor dip in badger productivity.

| Action Item | Responsible Party | Expected Completion | Status |
| :--- | :--- | :--- | :--- |
| Negotiate berry bribery | Elder Hazelwood | Next New Moon | In Progress |
| Distribute tiny tea cups | Beatrice (Witch) | Completed | Done |
| Relocate hammock tree | Timothy (Forest Spirit) | Midsummer Night | Scheduled |

> "The badgers have agreed not to grumble, provided they receive at least two extra honey-cakes per week during the transition."
> 
> — *Mossy Bottom Council Rapporteur*

For more details, visit the [Council Archives](#archives).
				`}
			/>
		</LayoutContentWidth>
	{/snippet}
</Story>

<Story name="Code and Blockquotes">
	{#snippet children()}
		<LayoutContentWidth size="medium">
			<MarkdownContent
				content={`
# Hearth-Magic Automation
Modern hedge-witches are beginning to use automation syntax for their domestic spells. Here is an example script for auto-stoking a fireplace:

\`\`\`javascript
// Hearth-Magic Spell Script v1.2.0
import { stokeHearth, checkLogs } from 'forest-magic';

async function maintainCosiness() {
  const currentTemp = await checkLogs();
  if (currentTemp < 22) {
    // Stoke with dry oak logs and a whisper of fire-sprite blessing
    await stokeHearth({ logs: 'oak', intensity: 'whisper' });
    console.log("Hearth stoked. Cosy levels restored.");
  }
}
\`\`\`

Ensure you include a \`catch\` block for when the fire-sprite demands a sugar cube.
				`}
			/>
		</LayoutContentWidth>
	{/snippet}
</Story>
