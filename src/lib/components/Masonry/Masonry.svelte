<script lang="ts" generics="T = any">
	/**
	 * @file
	 * A lightweight, height-balanced masonry grid component for Svelte 5.
	 * Packs grid items dynamically by placing each new item into the currently shortest column
	 * to maintain a logical reading and tab focus order.
	 * Reflow is animated with a View Transition (see `reflowTransition.ts`) rather than CSS
	 * transitions on `left`/`top`, so no layout runs per frame.
	 * Layout only — dragging and reordering are a consumer concern: wrap items in `<Draggable>`
	 * and add `<DropTarget>`s (or `dropTarget()` attachments) to build reorder or move behaviour.
	 */

	import { tick, type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { animateReflow, canAnimateReflow } from '../../utils/reflowTransition.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		/** Spacing between grid items */
		gridGap?: string;
		/** Padding around the grid container */
		padding?: string;
		/** Column width specification */
		colWidth?: string;
		/** Svelte snippet containing grid items */
		children?: Snippet;
		/** Optional data items array for data-driven rendering */
		items?: T[];
		/** Optional custom snippet for rendering each data item when `items` is provided */
		itemSnippet?: Snippet<[T, number]>;
		/** Optional key derivation function for `items` loop. Defaults to item.id or index. */
		getKey?: (item: T, index: number) => any;
		/** Bindable function to manually trigger a relayout; pass `false` to move items instantly. */
		refreshLayout?: (animated?: boolean) => Promise<void>;
		/** Allow the layout to recalculate on resize. Defaults to true. */
		allowResize?: boolean;
		/** Animate items gliding to their new positions with a view transition. Defaults to false. */
		animate?: boolean;
		/** Duration of the reflow animation */
		transitionDuration?: string;
		/** Easing function of the reflow animation */
		transitionEasing?: string;
	}

	let {
		gridGap = '0.5em',
		padding = '0px',
		colWidth = 'minmax(Min(20em, 100%), 1fr)',
		children,
		items = $bindable(),
		itemSnippet,
		getKey = (item: any, index: number) => item?.id ?? index,
		refreshLayout = $bindable(),
		allowResize = true,
		animate = false,
		transitionDuration = '0.25s',
		transitionEasing = 'cubic-bezier(0.2, 0, 0, 1)',
		...restProps
	}: Props = $props();

	let masonryElement: HTMLElement | undefined = $state();
	let containerWidth = $state(0);
	/** The first layout has no previous positions to animate from. */
	let hasCalculated = false;

	/** Returns real grid item elements (excluding internal helper elements). */
	const getDirectGridItems = (grid: HTMLElement) =>
		Array.from(grid.children).filter(
			(child): child is HTMLElement =>
				child instanceof HTMLElement && Number(getComputedStyle(child).gridColumnEnd) !== -1
		);

	/**
	 * Packs the items into columns, then writes the positions, inside a view transition when
	 * `animated` so the browser tweens each card from its old slot.
	 */
	const pack = async (grid: HTMLElement, animated: boolean) => {
		const style = getComputedStyle(grid);
		// Native `grid-template-rows: masonry` lays itself out.
		if (style.gridTemplateRows === 'masonry') return;

		const gridItems = getDirectGridItems(grid);
		const gap = parseFloat(style.gridRowGap || style.gap || '0');
		const columnWidths = style.gridTemplateColumns.split(' ');
		const columnCount = columnWidths.length;
		const columnWidth = parseFloat(columnWidths[0]);

		if (!columnCount || isNaN(columnWidth) || gridItems.length === 0) {
			grid.style.removeProperty('height');
			return;
		}

		// Spare width is shared out the way `justify-content` would
		const contentWidth =
			grid.getBoundingClientRect().width -
			parseFloat(style.paddingLeft || '0') -
			parseFloat(style.paddingRight || '0');
		const spareWidth = Math.max(
			0,
			contentWidth - (columnCount * columnWidth + (columnCount - 1) * gap)
		);
		const justifyContent = style.justifyContent || 'center';
		const leftOffset = justifyContent.includes('center')
			? spareWidth / 2
			: justifyContent.includes('end') || justifyContent.includes('right')
				? spareWidth
				: 0;

		// Items take the column width before measuring so their text wraps at the right height
		gridItems.forEach((item) => (item.style.width = `${columnWidth}px`));
		await tick();

		// Each item goes in the shortest column so far
		const columnHeights = new Array<number>(columnCount).fill(0);
		const placements = gridItems.map((item) => {
			const column = columnHeights.indexOf(Math.min(...columnHeights));
			const top = columnHeights[column];
			columnHeights[column] = top + item.getBoundingClientRect().height + gap;
			return { item, left: leftOffset + column * (columnWidth + gap), top };
		});
		const height =
			Math.max(0, Math.max(...columnHeights) - gap) +
			parseFloat(style.paddingTop || '0') +
			parseFloat(style.paddingBottom || '0');

		const write = () => {
			placements.forEach(({ item, left, top }) => {
				item.style.left = `${left}px`;
				item.style.top = `${top}px`;
			});
			grid.style.height = `${height}px`;
		};

		// Image decodes re-pack to identical positions; don't start an empty transition.
		const hasChanged =
			grid.style.height !== `${height}px` ||
			placements.some(
				({ item, left, top }) => item.style.left !== `${left}px` || item.style.top !== `${top}px`
			);

		// Only items that already had a slot and now sit elsewhere are named for the transition. New
		// items have nothing to glide from, and a named item is lifted out of the page's stacking
		// order, so naming idle cards makes them paint over popovers and menus.
		const movingItems = placements
			.filter(
				({ item, left, top }) =>
					item.style.left !== '' &&
					item.style.top !== '' &&
					(item.style.left !== `${left}px` || item.style.top !== `${top}px`)
			)
			.map(({ item }) => item);

		if (movingItems.length > 0 && animated && animate && hasCalculated && canAnimateReflow()) {
			await animateReflow({
				items: movingItems,
				write,
				duration: transitionDuration,
				easing: transitionEasing
			});
		} else if (hasChanged) {
			write();
		}
		hasCalculated = true;
	};

	let isPacking = false;
	/** A refresh requested mid-pass; `true` if any of the requests wanted animation. */
	let queuedAnimated: boolean | null = null;

	/**
	 * Re-packs the grid, one pass at a time. A drop fires several refreshes at once (Svelte effect,
	 * MutationObserver), and packing concurrently would write positions from stale measurements.
	 * Extra requests collapse into a single follow-up pass.
	 */
	const refresh = async (animated = false): Promise<void> => {
		if (!masonryElement) return;
		if (isPacking) {
			queuedAnimated = (queuedAnimated ?? false) || animated;
			return;
		}

		isPacking = true;
		await pack(masonryElement, animated).finally(() => (isPacking = false));
		observeItemSizes();

		if (queuedAnimated === null) return;
		const followUpAnimated = queuedAnimated;
		queuedAnimated = null;
		await refresh(followUpAnimated);
	};

	// Parents call this after content changes (items added, removed, reordered or grown).
	refreshLayout = (animated = true) => refresh(animated);

	/**
	 * Heights are measured once per pass. Anything that grows an item *after* that — async image
	 * decode, web-font swap, late-arriving content — has to trigger another pass or the columns
	 * keep the stale heights and overlap. The usual cause is images in a card decoding at
	 * different times, so bursts are debounced into one instant re-pack.
	 */
	let itemResizeObserver: ResizeObserver | undefined;
	const observedItems = new WeakSet<HTMLElement>();

	const observeItemSizes = () => {
		if (!masonryElement || typeof ResizeObserver === 'undefined') return;

		let timer: ReturnType<typeof setTimeout>;
		itemResizeObserver ??= new ResizeObserver(() => {
			clearTimeout(timer);
			timer = setTimeout(() => refresh(), 60);
		});

		// Observe only new items: re-observing would re-fire every item's initial callback each pass.
		getDirectGridItems(masonryElement)
			.filter((item) => !observedItems.has(item))
			.forEach((item) => {
				observedItems.add(item);
				itemResizeObserver!.observe(item);
			});
	};

	// First layout, and every time children are added or removed
	$effect(() => {
		if (!masonryElement) return;
		tick().then(() => refresh(true));

		const mutationObserver = new MutationObserver(() => refresh(true));
		mutationObserver.observe(masonryElement, { childList: true });
		return () => {
			mutationObserver.disconnect();
			itemResizeObserver?.disconnect();
		};
	});

	// Width changes (window resize, sidebar toggle) re-pack once they settle: a drag-resize fires
	// continuously, and a view transition started mid-resize would be cancelled by the next event.
	$effect(() => {
		if (!allowResize || containerWidth <= 0) return;
		const timer = setTimeout(() => refresh(true), 150);
		return () => clearTimeout(timer);
	});
</script>

<div
	bind:this={masonryElement}
	bind:clientWidth={containerWidth}
	class="akui-masonry"
	style={`
      --masonry-grid-gap: ${gridGap};
      --masonry-padding: ${padding};
      --masonry-col-width: ${colWidth};
     `}
	{...restProps}
>
	{#if items && itemSnippet}
		{#each items as item, index (getKey(item, index))}
			{@render itemSnippet(item, index)}
		{/each}
	{:else}
		{@render children?.()}
	{/if}
</div>

<style>
	.akui-masonry {
		position: relative;
		display: grid;
		grid-template-columns: repeat(auto-fill, var(--masonry-col-width));
		justify-content: center;
		grid-gap: var(--masonry-grid-gap);
		padding: var(--masonry-padding);
		box-sizing: border-box;
	}
	.akui-masonry > :global(*) {
		position: absolute;
		box-sizing: border-box;
	}

	/* `animateReflow` sets the attribute and variables while a reflow runs. Cards take the timing;
	   the page-wide `root` snapshot is frozen so the rest of the UI doesn't crossfade. */
	:global(html[data-akui-masonry-vt]::view-transition-group(*)),
	:global(html[data-akui-masonry-vt]::view-transition-old(*)),
	:global(html[data-akui-masonry-vt]::view-transition-new(*)) {
		animation-duration: var(--akui-masonry-vt-duration, 0.25s);
		animation-timing-function: var(--akui-masonry-vt-easing, ease);
	}
	:global(html[data-akui-masonry-vt]::view-transition-old(root)),
	:global(html[data-akui-masonry-vt]::view-transition-new(root)) {
		animation: none;
	}
</style>
