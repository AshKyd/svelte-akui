<script lang="ts">
	import ProgressXmasTreeBox from './ProgressXmasTreeBox.svelte';

	export interface ProgressItem {
		/** Unique identifier for keying items */
		id: string | number;
		/** Indicates if this specific task or item update has finished */
		complete: boolean;
		/** Optional colour override for when this item lights up */
		colour?: string;
		/** Friendly text shown in the tooltip on hover */
		label?: string;
	}

	interface Props {
		/** List of items to track and render as status boxes */
		items: ProgressItem[];
		/** Fallback colour theme name to use for complete boxes */
		colour?: 'accent' | 'blue' | 'green' | 'orange' | 'pink' | 'purple' | 'amber';
		/** Class names added to the root element wrapper */
		class?: string;
	}

	let {
		items = [],
		colour = 'accent',
		class: className = ''
	}: Props = $props();

	let containerEl = $state<HTMLDivElement>();
	let width = $state(0);
	let height = $state(0);

	/**
	 * Compute optimal layout columns, rows, square box sizes and gaps to fit the container space.
	 * If height is not constrained, falls back to a squared column structure based on item count.
	 */
	const layout = $derived.by(() => {
		const N = items.length;
		if (N === 0 || width === 0) {
			return { cols: 1, rows: 1, size: 0, gap: 1 };
		}

		// Height counts as unconstrained if container height is set to auto or remains too small
		const isHeightConstrained = height > 20;

		let bestCols = 1;
		let bestRows = 1;
		let bestSize = 0;

		if (!isHeightConstrained) {
			bestCols = Math.ceil(Math.sqrt(N));
			bestRows = Math.ceil(N / bestCols);
			const gap = Math.max(1, Math.min(8, Math.floor(width / (bestCols * 10))));
			bestSize = (width - (bestCols - 1) * gap) / bestCols;
			return { cols: bestCols, rows: bestRows, size: bestSize, gap };
		}

		// Try all possible column widths to maximize individual box sizes
		for (let cols = 1; cols <= N; cols++) {
			const rows = Math.ceil(N / cols);
			const testGap = Math.max(1, Math.min(8, Math.floor(width / (cols * 10))));
			const boxW = (width - (cols - 1) * testGap) / cols;
			const boxH = (height - (rows - 1) * testGap) / rows;
			const boxSize = Math.min(boxW, boxH);

			if (boxSize > bestSize) {
				bestSize = boxSize;
				bestCols = cols;
				bestRows = rows;
			}
		}

		const gap = Math.max(1, Math.min(8, Math.floor(bestSize * 0.1)));
		return {
			cols: bestCols,
			rows: bestRows,
			size: bestSize,
			gap
		};
	});
</script>

<div
	bind:this={containerEl}
	bind:clientWidth={width}
	bind:clientHeight={height}
	class="akui-progress-xmas-tree {className}"
	style="
		grid-template-columns: repeat({layout.cols}, {layout.size}px);
		grid-template-rows: repeat({layout.rows}, {layout.size}px);
		gap: {layout.gap}px;
	"
>
	{#each items as item (item.id)}
		<ProgressXmasTreeBox
			complete={item.complete}
			colour={item.colour || colour}
			label={item.label}
			size={layout.size}
		/>
	{/each}
</div>

<style>
	.akui-progress-xmas-tree {
		width: 100%;
		height: 100%;
		box-sizing: border-box;
		display: grid;
		justify-content: center;
		align-content: center;
	}
</style>
