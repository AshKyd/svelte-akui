<script lang="ts" generics="T extends { width: number; height: number; src?: string; alt?: string }">
	import type { Snippet } from 'svelte';
	import { DynamicImage } from '../DynamicImage/index.js';

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
	const layoutRows = $derived.by(() => {
		if (items.length === 0) return [];
		const width = containerWidth || 1000; // Fallback for SSR and tests

		if (rows && rows.length > 0) {
			const result = [];
			let index = 0;
			let rowPatternIndex = 0;

			while (index < items.length) {
				const rowCount = rows[rowPatternIndex % rows.length];
				result.push(items.slice(index, index + rowCount));
				index += rowCount;
				rowPatternIndex++;
			}
			return result;
		}

		// Auto-balance logic based on aspect ratio
		const sortedItems = [...items].sort((a, b) => a.width / a.height - b.width / b.height);
		return sortedItems.reduce<T[][]>((acc, item) => {
			if (acc.length === 0) return [[item]];

			const currentRow = acc[acc.length - 1];
			currentRow.push(item);

			const totalAspect = currentRow.reduce((sum, i) => sum + i.width / i.height, 0);
			const availableWidth = width - gap * (currentRow.length - 1);

			const minItemWidth = currentRow.reduce((min, i) => {
				const itemWidth = availableWidth * (i.width / i.height / totalAspect);
				return Math.min(min, itemWidth);
			}, Infinity);

			if (minItemWidth < minWidth && currentRow.length > 1) {
				currentRow.pop();
				acc.push([item]);
			}

			return acc;
		}, []);
	});

	/**
	 * Flattens rows and calculates fractional widths for the CSS grid/flex layout
	 */
	const layoutItems = $derived.by(() =>
		layoutRows.flatMap((row) => {
			const totalAspect = row.reduce((sum, item) => sum + item.width / item.height, 0);

			return row.map((item) => {
				const aspect = item.width / item.height;
				const fraction = aspect / totalAspect;
				// Total gap space in the row is gap * (row.length - 1)
				// Each item needs to subtract a proportional share of that gap from its percentage width
				const gapPx = fraction * gap * (row.length - 1);

				return {
					item,
					widthCalc: `calc(${fraction * 100}% - ${gapPx}px)`,
					aspectRatio: aspect
				};
			});
		})
	);
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
