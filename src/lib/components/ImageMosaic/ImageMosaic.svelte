<script lang="ts" generics="T extends { width: number; height: number; src?: string; alt?: string }">
	import type { Snippet } from 'svelte';
	import { DynamicImage } from '../DynamicImage/index.js';

	import { groupItemsIntoRows, calculateLayoutItems } from './utils.js';

	interface Props {
		/** Array of items to display in the mosaic */
		items: T[];
		/** Minimum width for an item when auto-balancing (default: 200) */
		minWidth?: number;
		/** Gap between items in pixels (default: 8) */
		gap?: number;
		/** Explicit row sizes (e.g. [2, 1] means 2 items in first row, 1 in second, then repeat) */
		rows?: number[];
		/** Custom class for the container */
		class?: string;
		/** Custom style for the container */
		style?: string;
		/** Custom snippet to render each item */
		children?: Snippet<[T]>;
	}

	let {
		items,
		minWidth = 200,
		gap = 8,
		rows,
		class: className = '',
		style = '',
		children
	}: Props = $props();

	let containerWidth = $state(0);

	/**
	 * Determines the row groupings based on explicit sizes or auto-balancing
	 */
	const layoutRows = $derived(groupItemsIntoRows(items, containerWidth, minWidth, gap, rows));

	/**
	 * Flattens rows and calculates fractional widths for the CSS layout
	 */
	const layoutItems = $derived(calculateLayoutItems(layoutRows, gap));
</script>

<div
	class="ak-mosaic {className}"
	style="--ak-mosaic-gap: {gap}px; {style}"
	bind:clientWidth={containerWidth}
>
	{#each layoutItems as { item, widthCalc, aspectRatio }}
		<div class="ak-mosaic-item" style="width: {widthCalc}; aspect-ratio: {aspectRatio};">
			{#if children}
				{@render children(item)}
			{:else if item.src}
				<DynamicImage src={item.src} alt={item.alt || ''} fit="cover" class="ak-mosaic-image" />
			{/if}
		</div>
	{/each}
</div>

<style>
	.ak-mosaic {
		display: flex;
		flex-wrap: wrap;
		gap: var(--ak-mosaic-gap);
		width: 100%;
	}
	.ak-mosaic-item {
		overflow: hidden;
		position: relative;
	}
	/* Ensure whatever content inside scales correctly without breaking layout */
	:global(.ak-mosaic-item > *) {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
</style>
