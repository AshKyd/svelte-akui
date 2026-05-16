<script lang="ts">
	import FeedItemRow from '../FeedItemRow/FeedItemRow.svelte';
	import Divider from '../Divider/Divider.svelte';
	import Icon from '../Icon/Icon.svelte';
	import DynamicImage from '../DynamicImage/DynamicImage.svelte';
	import { type Snippet, type ComponentProps } from 'svelte';

	// Extract props from FeedItemRow but exclude 'class'
	type RowProps = ComponentProps<typeof FeedItemRow>;

	interface ItemData extends RowProps {
		/** Unique identifier for the item */
		id: string | number;
	}

	interface Props {
		/** Array of feed items to display */
		items: ItemData[];
		/** Shared layout for all items (compact or hero) */
		layout?: 'compact' | 'hero';
		/** Shared fit mode for all images */
		fit?: 'cover' | 'contain' | 'auto';
		/** Shared aspect ratio for all thumbnails */
		ratio?: string | number;
		/** Callback when an item is clicked */
		onselect?: (id: string | number) => void;
		/** Optional snippet override for icons in this column */
		icon?: Snippet<[ItemData]>;
		/** Optional snippet override for images in this column */
		image?: Snippet<[ItemData]>;
		/** Additional CSS classes for the container */
		class?: string;
	}

	let {
		items = [],
		layout = 'compact',
		fit = 'auto',
		ratio,
		onselect,
		icon,
		image,
		class: className = ''
	}: Props = $props();
</script>

<div class="akui-feed-items-column {className}">
	{#each items as item, i (item.id)}
		{#snippet rowIcon()}
			{#if icon}
				{@render icon(item)}
			{:else if item.icon}
				{#if typeof item.icon === 'string'}
					<Icon name={item.icon} size={16} />
				{:else}
					{@render item.icon()}
				{/if}
			{/if}
		{/snippet}

		{#snippet rowImage()}
			{#if image}
				{@render image(item)}
			{:else if item.image}
				{#if typeof item.image === 'string'}
					<DynamicImage src={item.image} fit={item.fit ?? fit} ratio={item.ratio ?? ratio} />
				{:else}
					{@render item.image()}
				{/if}
			{/if}
		{/snippet}

		<div class="akui-feed-items-column-item">
			<FeedItemRow
				{...item}
				layout={item.layout ?? layout}
				fit={item.fit ?? fit}
				ratio={item.ratio ?? ratio}
				icon={(icon || item.icon) ? rowIcon : undefined}
				image={(image || item.image) ? rowImage : undefined}
				onclick={() => onselect?.(item.id)}
			/>
		</div>
		{#if i < items.length - 1}
			<Divider />
		{/if}
	{/each}
</div>

<style>
	.akui-feed-items-column {
		display: flex;
		flex-direction: column;
		width: 100%;
	}
</style>
