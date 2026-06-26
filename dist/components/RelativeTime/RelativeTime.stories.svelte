<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import RelativeTime from './RelativeTime.svelte';
	import Padding from '../Padding/Padding.svelte';
	import Panel from '../Panel/Panel.svelte';

	const { Story } = defineMeta({
		title: 'Components/RelativeTime',
		tags: ['autodocs']
	});
</script>

<Story name="Gnome Bread Baking">
	{#snippet children()}
		{@const date = new Date(Date.now() - 15 * 60 * 1000)} <!-- 15 minutes ago -->
		<Padding size="m">
			<Panel colour="regular">
				<Padding size="m">
					<p style="margin: 0;">
						🍞 Eldrin the Gnome's sourdough bread finished baking:
						<strong><RelativeTime {date} /></strong>.
					</p>
				</Padding>
			</Panel>
		</Padding>
	{/snippet}
</Story>

<Story name="Cauldron Brewing">
	{#snippet children()}
		{@const date = new Date(Date.now() - 2.5 * 60 * 60 * 1000)} <!-- 2.5 hours ago -->
		<Padding size="m">
			<Panel colour="regular">
				<Padding size="m">
					<p style="margin: 0;">
						🧪 The lavender sleeping draught was set to simmer in the copper cauldron:
						<strong><RelativeTime {date} /></strong>.
					</p>
				</Padding>
			</Panel>
		</Padding>
	{/snippet}
</Story>

<Story name="Dragon Naps">
	{#snippet children()}
		{@const date = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)} <!-- 4 days ago -->
		<Padding size="m">
			<Panel colour="regular">
				<Padding size="m">
					<p style="margin: 0;">
						💤 Pip the tiny dragon last napped on the windowsill:
						<strong><RelativeTime {date} /></strong>.
					</p>
				</Padding>
			</Panel>
		</Padding>
	{/snippet}
</Story>

<Story name="Old Toadstool Council Meeting">
	{#snippet children()}
		{@const date = new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)} <!-- 12 days ago -->
		<Padding size="m">
			<Panel colour="regular">
				<Padding size="m">
					<p style="margin: 0;">
						🍄 The last Toadstool Council debate over acorn distribution rules took place:
						<strong><RelativeTime {date} thresholdDays={7} /></strong> (exceeds 7-day threshold, showing short date).
					</p>
				</Padding>
			</Panel>
		</Padding>
	{/snippet}
</Story>
