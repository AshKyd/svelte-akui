<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Components/AdaptivePane',
		parameters: {
			layout: 'fullscreen'
		}
	});
</script>

<script lang="ts">
	import AdaptivePane from './AdaptivePane.svelte';
	import Header from '../Header/Header.svelte';
	import FeedItemRow from '../FeedItemRow/FeedItemRow.svelte';
	import Button from '../Button/Button.svelte';

	interface FeedItem {
		id: string;
		title: string;
		excerpt: string;
		tag: string;
		time: string;
		icon: string;
		content: string;
	}

	const cosyFeeds: FeedItem[] = [
		{
			id: 'gnome-moss',
			title: 'Moss-gathering techniques for forest gnomes',
			excerpt:
				'Gargamel the Elder shares insights on cultivating the softest moss under damp pine trees.',
			tag: 'Gnome Council',
			time: '10m ago',
			icon: 'tree',
			content:
				'The Gnome Council hosted a moss workshop today. Gargamel the Elder explained that moss cultivated in complete shadow, watered with morning dew mixed with pine needle extract, yields the absolute softest bedding for nap-time. Attendees were gifted tiny ceramic watering pots.'
		},
		{
			id: 'hearth-cozy',
			title: 'Cozy fireplace hearth renovations',
			excerpt:
				'With the chilly months approaching, the Hearth & Home committee has published their annual guide to chimney maintenance. Highlights include instructions on installing double-jointed baking hooks for heavy cast-iron soup pots, and decorating the mantelpiece with dried lavender and rosemary.',
			tag: 'Hearth & Home',
			time: '2h ago',
			icon: 'house',
			content:
				'With the chilly months approaching, the Hearth & Home committee has published their annual guide to chimney maintenance. Highlights include instructions on installing double-jointed baking hooks for heavy cast-iron soup pots, and decorating the mantelpiece with dried lavender and rosemary.'
		},
		{
			id: 'moon-dew',
			title: "Witch's guide to brewing moon-dew tea",
			excerpt:
				'Harvesting dew at exactly 2:00 AM under a waxing crescent moon yields the best calming tea.',
			tag: 'Alchemical Society',
			time: '1d ago',
			icon: 'moon',
			content:
				'Mistress Elspeth published her breakthrough recipe for Moon-Dew Tea. To ensure complete tranquility during evening reading sessions, harvest dew from chamomile petals at exactly 2:00 AM under a waxing crescent moon. Steeping must be performed in a porcelain teapot with a cobalt glaze.'
		}
	];

	let currentRouteId = $state('/inbox');
	let lastActiveItem = $state<FeedItem | null>(null);

	$effect(() => {
		const found = cosyFeeds.find((item) => `/inbox/${item.id}` === currentRouteId);
		if (found) {
			lastActiveItem = found;
		}
	});

	// State specifically for the expand-on-select story
	let expandRouteId = $state('/inbox');
	let lastExpandActiveItem = $state<FeedItem | null>(null);

	$effect(() => {
		const found = cosyFeeds.find((item) => `/inbox/${item.id}` === expandRouteId);
		if (found) {
			lastExpandActiveItem = found;
		}
	});

	let mainPaneWidth = $state(320);
</script>

{#snippet mainPane({ isStacked })}
	<div style="display: flex; flex-direction: column; height: 100%;">
		<Header>
			{#snippet title()}
				<span style="font-weight: 700; color: var(--akui-bg-accent, #2563eb);">Reader</span>
			{/snippet}
			{#snippet actions()}
				<Button variant="ghost" icon="search" iconPosition="only" />
				<Button variant="ghost" icon="gear" iconPosition="only" />
			{/snippet}
		</Header>
		<div style="flex: 1; overflow-y: auto;">
			{#each cosyFeeds as item (item.id)}
				<FeedItemRow
					title={item.title}
					excerpt={item.excerpt}
					tag={item.tag}
					time={item.time}
					icon={item.icon}
					active={currentRouteId === `/inbox/${item.id}`}
					onclick={() => (currentRouteId = `/inbox/${item.id}`)}
				/>
			{/each}
		</div>
	</div>
{/snippet}

{#snippet nestedPane({ isStacked })}
	<div style="display: flex; flex-direction: column; height: 100%;">
		<Header>
			{#snippet navigation()}
				{#if isStacked}
					<Button
						variant="ghost"
						icon="arrow-left"
						iconPosition="only"
						onclick={() => (currentRouteId = '/inbox')}
					/>
				{/if}
			{/snippet}
			{#snippet title()}
				<span>{lastActiveItem ? lastActiveItem.tag : 'Detail'}</span>
			{/snippet}
		</Header>
		<div
			style="flex: 1; overflow-y: auto; padding: var(--akui-space-l); background: var(--akui-bg);"
		>
			{#if lastActiveItem}
				<h1 style="font-size: 1.5rem; margin-bottom: 0.5rem; font-weight: 700;">
					{lastActiveItem.title}
				</h1>
				<div
					style="font-size: 0.85rem; color: var(--akui-fg-secondary); margin-bottom: 1.5rem; display: flex; gap: 1rem;"
				>
					<span>By Elves & Gnomes</span>
					<span>•</span>
					<span>{lastActiveItem.time}</span>
				</div>
				<p style="line-height: 1.6; font-size: 1rem; color: var(--akui-fg); white-space: pre-wrap;">
					{lastActiveItem.content}
				</p>
			{:else}
				<div
					style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--akui-fg-secondary);"
				>
					<span style="font-size: 3rem; margin-bottom: 1rem;">📭</span>
					<p>No story selected. Pick one from the list to begin reading!</p>
				</div>
			{/if}
		</div>
	</div>
{/snippet}

{#snippet expandMainPane({ isStacked })}
	<div style="display: flex; flex-direction: column; height: 100%;">
		<Header>
			{#snippet title()}
				<span style="font-weight: 700; color: var(--akui-bg-accent, #2563eb);">Reader</span>
			{/snippet}
			{#snippet actions()}
				<Button variant="ghost" icon="search" iconPosition="only" />
			{/snippet}
		</Header>
		<div style="flex: 1; overflow-y: auto;">
			{#each cosyFeeds as item (item.id)}
				<FeedItemRow
					title={item.title}
					excerpt={item.excerpt}
					tag={item.tag}
					time={item.time}
					icon={item.icon}
					active={expandRouteId === `/inbox/${item.id}`}
					onclick={() => (expandRouteId = `/inbox/${item.id}`)}
				/>
			{/each}
		</div>
	</div>
{/snippet}

{#snippet expandNestedPane({ isStacked })}
	<div style="display: flex; flex-direction: column; height: 100%;">
		<Header>
			{#snippet navigation()}
				{#if isStacked}
					<Button
						variant="ghost"
						icon="arrow-left"
						iconPosition="only"
						onclick={() => (expandRouteId = '/inbox')}
					/>
				{:else}
					<Button
						variant="ghost"
						icon="x-lg"
						iconPosition="only"
						onclick={() => (expandRouteId = '/inbox')}
					/>
				{/if}
			{/snippet}
			{#snippet title()}
				<span>{lastExpandActiveItem ? lastExpandActiveItem.tag : 'Detail'}</span>
			{/snippet}
		</Header>
		<div
			style="flex: 1; overflow-y: auto; padding: var(--akui-space-l); background: var(--akui-bg);"
		>
			{#if lastExpandActiveItem}
				<h1 style="font-size: 1.5rem; margin-bottom: 0.5rem; font-weight: 700;">
					{lastExpandActiveItem.title}
				</h1>
				<div
					style="font-size: 0.85rem; color: var(--akui-fg-secondary); margin-bottom: 1.5rem; display: flex; gap: 1rem;"
				>
					<span>By Elves & Gnomes</span>
					<span>•</span>
					<span>{lastExpandActiveItem.time}</span>
				</div>
				<p style="line-height: 1.6; font-size: 1rem; color: var(--akui-fg); white-space: pre-wrap;">
					{lastExpandActiveItem.content}
				</p>
			{/if}
		</div>
	</div>
{/snippet}

<!-- Standard desktop view (split with resizable support) -->
<Story name="Desktop (Split View, Resizable)">
	<div
		style="display: flex; flex-direction: column; gap: 0.5rem; height: 650px; width: 100%;"
	>
		<p style="margin: 0; padding: 0 1rem; font-size: 0.9rem; color: var(--akui-fg-secondary);">
			Main pane width: {mainPaneWidth}px (drag border to resize)
		</p>
		<div
			style="flex: 1; border: 1px solid var(--akui-border-input); border-radius: 8px; overflow: hidden; background-color: var(--akui-bg-secondary, #f9fafb);"
		>
			<AdaptivePane
				minWidth={768}
				baseRouteId="/inbox"
				{currentRouteId}
				{mainPane}
				{nestedPane}
				bind:mainPaneWidth
			/>
		</div>
	</div>
</Story>

<!-- Desktop view where the detail pane expands out dynamically upon item selection -->
<Story name="Desktop (Expand on Select)">
	<div
		style="height: 600px; width: 100%; border: 1px solid var(--akui-border-input); border-radius: 8px; overflow: hidden; background-color: var(--akui-bg-secondary, #f9fafb);"
	>
		<AdaptivePane
			minWidth={768}
			baseRouteId="/inbox"
			currentRouteId={expandRouteId}
			hideNestedWhenEmpty={true}
			mainPane={expandMainPane}
			nestedPane={expandNestedPane}
		/>
	</div>
</Story>

<!-- Simulated mobile view (stacked) -->
<Story name="Mobile Simulation">
	<div
		style="padding: 2rem; background-color: var(--akui-bg-secondary, #f9fafb); display: grid; place-items: center;"
	>
		<div
			style="height: 600px; width: 375px; border: 8px solid #111; border-radius: 32px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); position: relative;"
		>
			<AdaptivePane minWidth={768} baseRouteId="/inbox" {currentRouteId} {mainPane} {nestedPane} />
		</div>
	</div>
</Story>
