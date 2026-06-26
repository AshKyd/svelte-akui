<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SwipeAction from './SwipeAction.svelte';

	const { Story } = defineMeta({
		title: 'Components/SwipeAction',
		tags: ['autodocs']
	});
</script>

<script lang="ts">
	import FeedItemRow from '../FeedItemRow/FeedItemRow.svelte';
	import Icon from '../Icon/Icon.svelte';
	import LayoutContentWidth from '../LayoutContentWidth/LayoutContentWidth.svelte';

	// Create dynamic state for our interactive demo items
	let items = $state([
		{
			id: '1',
			title: 'Town council allocates 300 gold pieces to pixie-light maintenance',
			excerpt:
				'Following a heated debate on municipal spending, the council approved a budget prioritizing public pathway illumination over the proposed wizarding statue, citing citizen safety during moonless nights.',
			tag: 'Council',
			time: '15m ago',
			unread: true,
			bookmarked: false
		},
		{
			id: '2',
			title: 'Local cooperative begins community-led renovation of the abandoned drop tower',
			excerpt:
				'The historic structure, once used by hot-headed alchemists, is set to be converted into a multi-level nesting site for migrating swallows and a cozy reading room for short-statured goblins.',
			tag: 'Hearth & Home',
			time: '2h ago',
			unread: true,
			bookmarked: true
		},
		{
			id: '3',
			title: 'Archmage Jarethan Kilgrave funds new library wing, denies influence-peddling rumours',
			excerpt:
				'Kilgrave stated his donation was purely out of community goodwill and nothing to do with his pending zoning permit for a dark summoning circle.',
			tag: 'Local Politics',
			time: 'Yesterday',
			unread: false,
			bookmarked: false
		}
	]);

	function toggleRead(id: string) {
		const item = items.find((i) => i.id === id);
		if (item) {
			item.unread = !item.unread;
		}
	}

	function toggleBookmark(id: string) {
		const item = items.find((i) => i.id === id);
		if (item) {
			item.bookmarked = !item.bookmarked;
		}
	}
</script>

<Story name="Interactive List">
	<LayoutContentWidth size="medium" class="demo-container">
		<div class="demo-instructions">
			<Icon name="info-circle" size={16} />
			<span>
				<strong>Touch Device Required:</strong> Swipe interactions only work with touch input. Please
				enable device emulation (e.g. mobile view) in your browser DevTools to test dragging.
			</span>
		</div>

		<div class="feed-list">
			{#each items as item (item.id)}
				{#snippet leftIconSnippet({ percentage, thresholdReached })}
					<div
						class="custom-action-icon"
						class:threshold-reached={thresholdReached}
						style:transform="scale({percentage})"
						style:opacity={percentage}
					>
						<Icon
							name={item.bookmarked ? 'bookmark-fill' : 'bookmark'}
							size={24}
							colour="var(--akui-color-amber-fg, #b58100)"
						/>
					</div>
				{/snippet}

				{#snippet rightIconSnippet({ percentage, thresholdReached })}
					<div
						class="custom-action-icon"
						class:threshold-reached={thresholdReached}
						style:transform="scale({percentage})"
						style:opacity={percentage}
					>
						<Icon
							name={item.unread ? 'envelope-open' : 'envelope'}
							size={24}
							colour="var(--akui-color-blue-fg, #0056b3)"
						/>
					</div>
				{/snippet}

				<SwipeAction
					leftIcon={leftIconSnippet}
					leftBackgroundColour="var(--akui-color-amber-bg, #ffc107)"
					leftForegroundColour="var(--akui-color-amber-fg, #b58100)"
					onSwipeRight={() => toggleBookmark(item.id)}
					rightIcon={rightIconSnippet}
					rightBackgroundColour="var(--akui-color-blue-bg, #007bff)"
					rightForegroundColour="var(--akui-color-blue-fg, #0056b3)"
					onSwipeLeft={() => toggleRead(item.id)}
					threshold={64}
				>
					<FeedItemRow
						title={item.title}
						excerpt={item.excerpt}
						tag={item.tag}
						time={item.time}
						unread={item.unread}
						bookmarked={item.bookmarked}
						onbookmark={() => toggleBookmark(item.id)}
						icon="newspaper"
						href="#"
					/>
				</SwipeAction>
			{/each}
		</div>
	</LayoutContentWidth>
</Story>

<Story name="Interactive List (No Icons)">
	<LayoutContentWidth size="medium" class="demo-container">
		<div class="demo-instructions">
			<Icon name="info-circle" size={16} />
			<span>
				<strong>No Favicons:</strong> This demo shows swipe actions and bookmark triggers on rows without
				any default icons. Hovering on the left reveals the bookmark button and dynamically slides the
				content.
			</span>
		</div>

		<div class="feed-list">
			{#each items as item (item.id + '-no-icon')}
				{#snippet leftIconSnippet({ percentage, thresholdReached })}
					<div
						class="custom-action-icon"
						class:threshold-reached={thresholdReached}
						style:transform="scale({percentage})"
						style:opacity={percentage}
					>
						<Icon
							name={item.bookmarked ? 'bookmark-fill' : 'bookmark'}
							size={24}
							colour="var(--akui-color-amber-fg, #b58100)"
						/>
					</div>
				{/snippet}

				{#snippet rightIconSnippet({ percentage, thresholdReached })}
					<div
						class="custom-action-icon"
						class:threshold-reached={thresholdReached}
						style:transform="scale({percentage})"
						style:opacity={percentage}
					>
						<Icon
							name={item.unread ? 'envelope-open' : 'envelope'}
							size={24}
							colour="var(--akui-color-blue-fg, #0056b3)"
						/>
					</div>
				{/snippet}

				<SwipeAction
					leftIcon={leftIconSnippet}
					leftBackgroundColour="var(--akui-color-amber-bg, #ffc107)"
					leftForegroundColour="var(--akui-color-amber-fg, #b58100)"
					onSwipeRight={() => toggleBookmark(item.id)}
					rightIcon={rightIconSnippet}
					rightBackgroundColour="var(--akui-color-blue-bg, #007bff)"
					rightForegroundColour="var(--akui-color-blue-fg, #0056b3)"
					onSwipeLeft={() => toggleRead(item.id)}
					threshold={64}
				>
					<FeedItemRow
						title={item.title}
						excerpt={item.excerpt}
						tag={item.tag}
						time={item.time}
						unread={item.unread}
						bookmarked={item.bookmarked}
						onbookmark={() => toggleBookmark(item.id)}
						href="#"
					/>
				</SwipeAction>
			{/each}
		</div>
	</LayoutContentWidth>
</Story>

<style>
	.demo-container {
		display: flex;
		flex-direction: column;
		gap: var(--akui-space-m, 1rem);
		padding-top: var(--akui-space-m, 1rem);
		padding-bottom: var(--akui-space-m, 1rem);
	}

	.demo-instructions {
		display: flex;
		gap: 0.5rem;
		align-items: flex-start;
		background-color: var(--akui-bg-secondary, #f8f9fa);
		padding: var(--akui-space-m, 1rem);
		border-radius: var(--akui-radius-m, 8px);
		border: 1px solid var(--akui-border, #dee2e6);
		font-size: var(--akui-font-size-s, 0.875rem);
		color: var(--akui-fg-secondary, #6c757d);
	}

	.feed-list {
		border: 1px solid var(--akui-border, #dee2e6);
		border-radius: var(--akui-radius-m, 8px);
		overflow: hidden;
		background: var(--akui-bg, #ffffff);
	}

	.custom-action-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
		will-change: transform;
	}

	.custom-action-icon.threshold-reached {
		transform: scale(1.3) !important;
	}
</style>
