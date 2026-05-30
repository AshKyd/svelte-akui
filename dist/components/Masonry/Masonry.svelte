<script lang="ts">
	/**
	 * @file
	 * A lightweight, height-balanced masonry grid component for Svelte 5.
	 * Packs grid items dynamically by placing each new item into the currently shortest column
	 * to maintain a logical reading and tab focus order.
	 * This file was inspired by https://github.com/janzheng/svelte-masonry which in turn was
	 * inspired by from Ana Tudor via CSS tricks.
	 */

	import { onMount, tick, type Snippet } from 'svelte';
	import { type HTMLAttributes } from 'svelte/elements';

	interface GridInfo {
		_el: HTMLElement;
		gap: number;
		items: HTMLElement[];
		ncol: number;
		mod: number;
	}

	interface Props extends HTMLAttributes<HTMLDivElement> {
		/** Spacing between grid items */
		gridGap?: string;
		/** Padding around the grid container */
		padding?: string;
		/** Column width specification */
		colWidth?: string;
		/** Svelte snippet containing grid items */
		children?: Snippet;
		/** Bindable function to manually trigger a relayout */
		refreshLayout?: () => Promise<void>;
	}

	let {
		gridGap = '0.5em',
		padding = '0px',
		colWidth = 'minmax(Min(20em, 100%), 1fr)',
		children,
		refreshLayout = $bindable(),
		...restProps
	}: Props = $props();

	let grids: GridInfo[] = [];
	let masonryElement: HTMLElement | undefined = $state();
	let containerWidth = $state(0);

	const refresh = async () => {
		grids.forEach(async (grid) => {
			const style = getComputedStyle(grid._el);
			const gap = parseFloat(style.gridRowGap || style.gap || '0');
			const cols = style.gridTemplateColumns.split(' ');
			const ncol = cols.length;
			const colWidth = parseFloat(cols[0]);

			if (!ncol || isNaN(ncol) || grid.items.length === 0) {
				grid._el.style.removeProperty('height');
				return;
			}

			// Calculate widths and offsets relative to the padding boundary
			const containerWidthVal = grid._el.getBoundingClientRect().width;
			const paddingLeft = parseFloat(style.paddingLeft || '0');
			const paddingRight = parseFloat(style.paddingRight || '0');
			const paddingTop = parseFloat(style.paddingTop || '0');
			const paddingBottom = parseFloat(style.paddingBottom || '0');

			const contentWidth = containerWidthVal - paddingLeft - paddingRight;
			const totalGridWidth = ncol * colWidth + (ncol - 1) * gap;
			const remainingSpace = Math.max(0, contentWidth - totalGridWidth);
			const justifyContent = style.justifyContent || 'center';

			const leftOffset = justifyContent.includes('center')
				? remainingSpace / 2
				: justifyContent.includes('end') || justifyContent.includes('right')
					? remainingSpace
					: 0;

			// Set width on all items first so they wrap content at the correct column width
			grid.items.forEach((item) => {
				item.style.width = `${colWidth}px`;
			});

			// Wait for Svelte / browser layout to apply widths before measuring
			await tick();

			// Layout items in memory by assigning each to the shortest column
			const colHeights = new Array(ncol).fill(0);
			const placements = grid.items.map((item) => {
				let minCol = 0;
				let minHeight = colHeights[0];
				for (let col = 1; col < ncol; col++) {
					if (colHeights[col] < minHeight) {
						minHeight = colHeights[col];
						minCol = col;
					}
				}

				const height = item.getBoundingClientRect().height;
				const left = leftOffset + minCol * (colWidth + gap);
				const top = colHeights[minCol];

				colHeights[minCol] = top + height + gap;

				return { item, left, top };
			});

			// Write calculated positions to DOM in one batch
			placements.forEach(({ item, left, top }) => {
				item.style.left = `${left}px`;
				item.style.top = `${top}px`;
			});

			// Constrain container height to match the tallest column
			const maxColHeight = Math.max(...colHeights);
			const containerHeight = Math.max(0, maxColHeight - gap) + paddingTop + paddingBottom;
			grid._el.style.height = `${containerHeight}px`;
		});
	};

	// Expose the layout refresh function to parents
	refreshLayout = refresh;

	const calcGrid = async (masonryArr: HTMLElement[]) => {
		await tick();
		if (masonryArr.length && getComputedStyle(masonryArr[0]).gridTemplateRows !== 'masonry') {
			grids = masonryArr.map((grid) => ({
				_el: grid,
				gap: parseFloat(getComputedStyle(grid).gridRowGap || '0'),
				items: Array.from(grid.childNodes).filter(
					(c): c is HTMLElement =>
						c.nodeType === 1 && Number(getComputedStyle(c as HTMLElement).gridColumnEnd) !== -1
				),
				ncol: 0,
				mod: 0
			}));
			refresh();
		}
	};

	onMount(() => {
		let mutationObserver: MutationObserver | null = null;

		if (masonryElement) {
			mutationObserver = new MutationObserver(() => {
				calcGrid([masonryElement!]);
			});
			mutationObserver.observe(masonryElement, {
				childList: true
			});
		}

		return () => {
			if (mutationObserver) {
				mutationObserver.disconnect();
			}
		};
	});

	// Re-initialize layout when container reference is set
	$effect(() => {
		if (masonryElement) {
			calcGrid([masonryElement]);
		}
	});

	// Reactively trigger layout updates whenever container width changes (e.g. sidebar toggles)
	$effect(() => {
		if (containerWidth > 0) {
			refresh();
		}
	});
</script>

<svelte:window onresize={refresh} />

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
	{@render children?.()}
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
</style>
