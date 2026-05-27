<script lang="ts">
	import FeedItemRow from '../FeedItemRow/FeedItemRow.svelte';
	import Divider from '../Divider/Divider.svelte';
	import Icon from '../Icon/Icon.svelte';
	import DynamicImage from '../DynamicImage/DynamicImage.svelte';
	import { type Snippet, type ComponentProps } from 'svelte';

	// Extract props from FeedItemRow but exclude 'class'
	type RowProps = ComponentProps<typeof FeedItemRow>;

	interface ItemData extends Omit<RowProps, 'id'> {
		/** Unique identifier for the item */
		id: string | number;
	}

	interface Props {
		/** Array of feed items to display */
		items: ItemData[];
		/** Layout orientation of the items group */
		display?: 'column' | 'grid';
		/** Shared layout for all items (compact or hero) */
		layout?: 'compact' | 'hero';
		/** Shared fit mode for all images */
		fit?: 'cover' | 'contain' | 'auto';
		/** Shared aspect ratio for all thumbnails */
		ratio?: string | number;
		/** Callback when an item is clicked */
		onselect?: (id: string | number) => void;
		/** Optional snippet override for icons in this group */
		icon?: Snippet<[ItemData]>;
		/** Optional snippet override for images in this group */
		image?: Snippet<[ItemData]>;
		/** Additional CSS classes for the container */
		class?: string;
	}

	let {
		items = [],
		display = 'column',
		layout = 'compact',
		fit = 'auto',
		ratio,
		onselect,
		icon,
		image,
		class: className = ''
	}: Props = $props();
</script>

<div class="akui-feed-item-group akui-display-{display} {className}">
	{#each items as item, i (item.id)}
		<div class="akui-feed-item-group-item">
			<FeedItemRow
				{...item}
				id={String(item.id)}
				layout={item.layout ?? layout}
				fit={item.fit ?? fit}
				ratio={item.ratio ?? ratio}
				icon={icon ? () => icon(item) : item.icon}
				image={image ? () => image(item) : item.image}
				onclick={() => onselect?.(item.id)}
			/>
		</div>
		{#if display === 'column' && i < items.length - 1}
			<Divider />
		{/if}
	{/each}
</div>

<style>
	.akui-feed-item-group {
		width: 100%;
	}

	.akui-feed-item-group.akui-display-column {
		display: flex;
		flex-direction: column;
	}

	.akui-feed-item-group.akui-display-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
		gap: 16px;
	}
</style>
