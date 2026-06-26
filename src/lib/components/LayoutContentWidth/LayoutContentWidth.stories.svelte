<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import LayoutContentWidth from './LayoutContentWidth.svelte';
	import Padding from '../Padding/Padding.svelte';
	import Small from '../Small/Small.svelte';

	const { Story } = defineMeta({
		title: 'Components/LayoutContentWidth',
		tags: ['autodocs']
	});
</script>

<Story name="Small Column (480px)">
	{#snippet children()}
		<LayoutContentWidth size="small">
			<h4>Cottage Access Spell</h4>
			<p>
				Enter your personal fairy name and whisper the passphrase to gain entry to the kitchen hearth settings. Capped at 480px.
			</p>
		</LayoutContentWidth>
	{/snippet}
</Story>

<Story name="Medium Column (680px)">
	{#snippet children()}
		<LayoutContentWidth size="medium">
			<h3>Gnome Council Dispatch: Weekly Harvest Guide</h3>
			<Small tag="span">Published by Elder Oakwood • 3 mins read</Small>
			<p style="margin-top: 1rem;">
				The local garden council is pleased to report that the toadstools around the south meadow have reached peak plumpness. Gnomes are advised to harvest only what is needed for their family's weekly stew, leaving the rest to dry naturally for the winter solstice festivities. Capped at 680px.
			</p>
		</LayoutContentWidth>
	{/snippet}
</Story>

<Story name="Large Column (960px)">
	{#snippet children()}
		<LayoutContentWidth size="large">
			<h3>Architectural Rules for Cottage Expansion</h3>
			<p style="margin-top: 1rem;">
				To preserve the whimsical and pastoral charm of our woodland village, all cottage extensions must strictly adhere to the guidelines set forth by the Treehouse Guild. Any chimney built must be constructed from creek-worn river pebbles and feature a chimney pot designed to resemble a mushroom cap. Capped at 960px.
			</p>
		</LayoutContentWidth>
	{/snippet}
</Story>
