<script lang="ts" generics="T = any">
	/**
	 * @file
	 * A lightweight, height-balanced masonry grid component for Svelte 5.
	 * Packs grid items dynamically by placing each new item into the currently shortest column
	 * to maintain a logical reading and tab focus order.
	 * Supports pointer-based drag-and-drop rearrangement where cards remain stationary while dragging,
	 * the hovered destination card displays a dotted outline drop indicator, and all cards rearrange
	 * smoothly on drop.
	 */

	import { onMount, tick, type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	import { getDropManager, type DragPayload } from '../../hooks/dropManager.svelte.js';

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
		/** Optional data items array for data-driven rendering with automatic reordering */
		items?: T[];
		/** Optional custom snippet for rendering each data item when `items` is provided */
		itemSnippet?: Snippet<[T, number]>;
		/** Optional key derivation function for `items` loop. Defaults to item.id or index. */
		getKey?: (item: T, index: number) => any;
		/** Bindable function to manually trigger a relayout */
		refreshLayout?: () => Promise<void>;
		/** Allow the layout to recalculate on resize. Defaults to true. */
		allowResize?: boolean;
		/** Enable smooth slide transitions when items change position. Defaults to false. */
		animate?: boolean;
		/** Duration of the slide transition animation */
		transitionDuration?: string;
		/** Easing function of the slide transition animation */
		transitionEasing?: string;
		/** Enable pointer-based drag-and-drop rearrangement of grid items. Defaults to false. */
		reorderable?: boolean;
		/** Scale factor applied to the item while dragging. Defaults to 0.5. */
		dragScale?: number;
		/** Optional CSS selector targeting a specific drag handle element within an item. */
		dragHandleSelector?: string;
		/** Touch hold duration in milliseconds before initiating drag on touch devices. Defaults to 350. */
		longPressDelay?: number;
		/** Optional callback to construct a DragPayload for global drop targets */
		getDragPayload?: (item: T, index: number) => DragPayload;
		/** Callback invoked when an item is successfully dropped into a new position. */
		onreorder?: (detail: { fromIndex: number; toIndex: number; items?: T[] }) => void;
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
		reorderable = false,
		dragScale = 0.5,
		dragHandleSelector,
		longPressDelay = 350,
		getDragPayload,
		onreorder,
		...restProps
	}: Props = $props();

	const dropManager = getDropManager();

	let grids: GridInfo[] = [];
	let masonryElement: HTMLElement | undefined = $state();
	let originSlotElement: HTMLElement | undefined = $state();
	let containerWidth = $state(0);
	let hasCalculated = $state(false);

	// Drag & drop state
	let isDragging = $state(false);
	let isSettling = $state(false);
	let draggedItem: HTMLElement | null = null;
	let originalItemsList: HTMLElement[] = [];
	let currentDropTargetItem: HTMLElement | null = null;
	let initialDragIndex = 0;
	let draggedStartLeft = 0;
	let draggedStartTop = 0;
	let itemWidth = 0;
	let itemHeight = 0;
	let pointerStartX = 0;
	let pointerStartY = 0;
	let activePointerId: number | null = null;
	let pendingDragItem: HTMLElement | null = null;
	let longPressTimer: ReturnType<typeof setTimeout> | null = null;
	let hasMovedAfterDrag = false;
	let isPointerInsideBounds = true;

	// In-memory cache of static destination slot coordinates for each element
	interface SlotRect {
		left: number;
		top: number;
		width: number;
		height: number;
		centerX: number;
		centerY: number;
	}
	const cachedPlacements = new Map<HTMLElement, SlotRect>();

	/**
	 * Returns real grid item elements (excluding internal helper elements).
	 */
	function getDirectGridItems(): HTMLElement[] {
		if (!masonryElement) return [];
		return Array.from(masonryElement.childNodes).filter(
			(c): c is HTMLElement =>
				c.nodeType === 1 &&
				c !== originSlotElement &&
				Number(getComputedStyle(c as HTMLElement).gridColumnEnd) !== -1
		);
	}

	/**
	 * Calculates and applies column-packed positions for an ordered array of items.
	 */
	const applyLayoutToItems = async (grid: GridInfo, itemsToLayout: HTMLElement[]) => {
		const style = getComputedStyle(grid._el);
		const gap = parseFloat(style.gridRowGap || style.gap || '0');
		const cols = style.gridTemplateColumns.split(' ');
		const ncol = cols.length;
		const colWidthVal = parseFloat(cols[0]);

		if (!ncol || isNaN(ncol) || itemsToLayout.length === 0) {
			grid._el.style.removeProperty('height');
			return;
		}

		const containerWidthVal = grid._el.getBoundingClientRect().width;
		const paddingLeft = parseFloat(style.paddingLeft || '0');
		const paddingRight = parseFloat(style.paddingRight || '0');
		const paddingTop = parseFloat(style.paddingTop || '0');
		const paddingBottom = parseFloat(style.paddingBottom || '0');

		const contentWidth = containerWidthVal - paddingLeft - paddingRight;
		const totalGridWidth = ncol * colWidthVal + (ncol - 1) * gap;
		const remainingSpace = Math.max(0, contentWidth - totalGridWidth);
		const justifyContent = style.justifyContent || 'center';

		const leftOffset = justifyContent.includes('center')
			? remainingSpace / 2
			: justifyContent.includes('end') || justifyContent.includes('right')
				? remainingSpace
				: 0;

		// Set width on all items first so they wrap content at the correct column width
		itemsToLayout.forEach((item) => {
			item.style.width = `${colWidthVal}px`;
		});

		// Wait for layout to apply widths before measuring heights
		await tick();
		void grid._el.offsetHeight;

		// Layout items in memory by assigning each to the shortest column
		const colHeights = new Array(ncol).fill(0);
		const placements = itemsToLayout.map((item) => {
			let minCol = 0;
			let minHeight = colHeights[0];
			for (let col = 1; col < ncol; col++) {
				if (colHeights[col] < minHeight) {
					minHeight = colHeights[col];
					minCol = col;
				}
			}

			const height = item.getBoundingClientRect().height || item.offsetHeight;
			const left = leftOffset + minCol * (colWidthVal + gap);
			const top = colHeights[minCol];

			colHeights[minCol] = top + height + gap;

			return { item, left, top, width: colWidthVal, height };
		});

		// Cache static destination slot geometries
		placements.forEach(({ item, left, top, width, height }) => {
			cachedPlacements.set(item, {
				left,
				top,
				width,
				height,
				centerX: left + width / 2,
				centerY: top + height / 2
			});
		});

		// Write calculated destination positions to DOM
		placements.forEach(({ item, left, top }) => {
			item.style.left = `${left}px`;
			item.style.top = `${top}px`;
		});

		// Constrain container height to match the tallest column
		const maxColHeight = Math.max(...colHeights);
		const containerHeight = Math.max(0, maxColHeight - gap) + paddingTop + paddingBottom;
		grid._el.style.height = `${containerHeight}px`;

		hasCalculated = true;
	};

	const refresh = async () => {
		if (isDragging || isSettling) return;

		if (masonryElement && getComputedStyle(masonryElement).gridTemplateRows !== 'masonry') {
			grids = [
				{
					_el: masonryElement,
					gap: parseFloat(getComputedStyle(masonryElement).gridRowGap || '0'),
					items: getDirectGridItems(),
					ncol: 0,
					mod: 0
				}
			];
		}

		await Promise.all(
			grids.map(async (grid) => {
				await applyLayoutToItems(grid, grid.items);
			})
		);
	};

	// Expose the layout refresh function to parents
	refreshLayout = refresh;

	const calcGrid = async (masonryArr: HTMLElement[]) => {
		if (isDragging || isSettling) return;
		await tick();
		if (masonryArr.length && getComputedStyle(masonryArr[0]).gridTemplateRows !== 'masonry') {
			grids = masonryArr.map((grid) => ({
				_el: grid,
				gap: parseFloat(getComputedStyle(grid).gridRowGap || '0'),
				items: getDirectGridItems(),
				ncol: 0,
				mod: 0
			}));
			refresh();
		}
	};

	// --- Drag & Drop Implementation ---

	function findGridItemFromEvent(target: EventTarget | null): HTMLElement | null {
		if (!masonryElement || !(target instanceof HTMLElement)) return null;
		const directChildren = getDirectGridItems();
		let current: HTMLElement | null = target;
		while (current && current !== masonryElement) {
			if (directChildren.includes(current)) {
				return current;
			}
			current = current.parentElement;
		}
		return null;
	}

	function startDragging(item: HTMLElement) {
		if (!masonryElement || isDragging || isSettling) return;

		const currentItems = getDirectGridItems();
		const itemIndex = currentItems.indexOf(item);
		if (itemIndex === -1) return;

		console.log(
			JSON.stringify({
				event: 'startDragging',
				itemIndex,
				totalItems: currentItems.length
			})
		);

		if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
			try {
				navigator.vibrate(40);
			} catch {
				// Haptics optional
			}
		}

		isDragging = true;
		hasMovedAfterDrag = true;
		draggedItem = item;
		originalItemsList = [...currentItems];
		initialDragIndex = itemIndex;
		currentDropTargetItem = item;
		isPointerInsideBounds = true;

		draggedStartLeft = parseFloat(item.style.left || '0');
		draggedStartTop = parseFloat(item.style.top || '0');
		itemWidth = item.offsetWidth;
		itemHeight = item.offsetHeight;

		// Set up origin slot placeholder at starting location
		if (originSlotElement) {
			originSlotElement.style.width = `${itemWidth}px`;
			originSlotElement.style.height = `${itemHeight}px`;
			originSlotElement.style.left = `${draggedStartLeft}px`;
			originSlotElement.style.top = `${draggedStartTop}px`;
		}

		// Anchor scale transform around the exact pointer grab location
		const itemRect = item.getBoundingClientRect();
		const grabOffsetX = pointerStartX - itemRect.left;
		const grabOffsetY = pointerStartY - itemRect.top;
		item.style.transformOrigin = `${grabOffsetX}px ${grabOffsetY}px`;
		item.style.transform = `translate3d(0px, 0px, 0px) scale(${dragScale})`;
		item.classList.add('akui-masonry-item-dragging');

		// Notify global drop manager
		const itemData = items ? items[itemIndex] : undefined;
		const payload: DragPayload = getDragPayload
			? getDragPayload(itemData as T, itemIndex)
			: {
					type: 'akui-masonry-item',
					data: itemData ?? item,
					source: 'masonry'
				};
		dropManager.startDrag(payload);
	}

	function cleanupDragState() {
		dropManager.endDrag();
		if (longPressTimer) {
			clearTimeout(longPressTimer);
			longPressTimer = null;
		}
		if (draggedItem) {
			draggedItem.classList.remove('akui-masonry-item-dragging');
			draggedItem.style.removeProperty('transform');
			draggedItem.style.removeProperty('transform-origin');
			draggedItem.style.removeProperty('transition');
		}
		if (currentDropTargetItem && currentDropTargetItem !== draggedItem) {
			currentDropTargetItem.classList.remove('akui-masonry-drop-target');
		}
		if (originSlotElement) {
			originSlotElement.style.removeProperty('width');
			originSlotElement.style.removeProperty('height');
			originSlotElement.style.removeProperty('left');
			originSlotElement.style.removeProperty('top');
		}
		isDragging = false;
		isSettling = false;
		draggedItem = null;
		currentDropTargetItem = null;
		pendingDragItem = null;
		activePointerId = null;
		originalItemsList = [];
	}

	async function cancelDrag(reason = 'unknown') {
		console.log(
			JSON.stringify({
				event: 'cancelDrag',
				reason,
				wasDragging: isDragging
			})
		);

		if (!isDragging || !draggedItem || !masonryElement) {
			cleanupDragState();
			return;
		}

		isSettling = true;
		if (currentDropTargetItem && currentDropTargetItem !== draggedItem) {
			currentDropTargetItem.classList.remove('akui-masonry-drop-target');
		}

		// Smoothly snap dragged card back to starting coordinates and scale back to 1
		draggedItem.style.transition = 'transform 150ms cubic-bezier(0.2, 0, 0, 1)';
		draggedItem.style.transform = 'translate3d(0px, 0px, 0px) scale(1)';

		setTimeout(() => {
			if (draggedItem) {
				draggedItem.style.left = `${draggedStartLeft}px`;
				draggedItem.style.top = `${draggedStartTop}px`;
			}
			cleanupDragState();
		}, 150);
	}

	async function commitDrop() {
		if (!isDragging || !draggedItem || !masonryElement) {
			cleanupDragState();
			return;
		}

		const fromIndex = initialDragIndex;
		const toIndex =
			currentDropTargetItem && currentDropTargetItem !== draggedItem
				? originalItemsList.indexOf(currentDropTargetItem)
				: initialDragIndex;

		console.log(
			JSON.stringify({
				event: 'commitDrop',
				fromIndex,
				toIndex
			})
		);

		isSettling = true;

		// Calculate destination coordinates
		let targetLeft = draggedStartLeft;
		let targetTop = draggedStartTop;

		if (currentDropTargetItem && currentDropTargetItem !== draggedItem) {
			const targetSlot = cachedPlacements.get(currentDropTargetItem);
			if (targetSlot) {
				targetLeft = targetSlot.left;
				targetTop = targetSlot.top;
			}
		}

		// Calculate snap offset relative to starting position
		const snapDeltaX = targetLeft - draggedStartLeft;
		const snapDeltaY = targetTop - draggedStartTop;

		// Smoothly animate dragged item into destination slot and expand to 100% scale
		draggedItem.style.transition = 'transform 150ms cubic-bezier(0.2, 0, 0, 1)';
		draggedItem.style.transform = `translate3d(${snapDeltaX}px, ${snapDeltaY}px, 0) scale(1)`;

		setTimeout(async () => {
			if (!draggedItem) {
				cleanupDragState();
				return;
			}

			// Clean up inline transform and drop-target styling
			draggedItem.style.transition = 'none';
			draggedItem.style.left = `${targetLeft}px`;
			draggedItem.style.top = `${targetTop}px`;
			draggedItem.style.removeProperty('transform');
			draggedItem.style.removeProperty('transform-origin');
			draggedItem.classList.remove('akui-masonry-item-dragging');

			if (currentDropTargetItem && currentDropTargetItem !== draggedItem) {
				currentDropTargetItem.classList.remove('akui-masonry-drop-target');
			}
			if (originSlotElement) {
				originSlotElement.style.removeProperty('width');
				originSlotElement.style.removeProperty('height');
				originSlotElement.style.removeProperty('left');
				originSlotElement.style.removeProperty('top');
			}

			// Rearrange all cards into their new layout order ON DROP
			if (fromIndex !== toIndex && fromIndex !== -1 && toIndex !== -1) {
				const nextOrder = [...originalItemsList];
				const [moved] = nextOrder.splice(fromIndex, 1);
				nextOrder.splice(toIndex, 0, moved);

				const grid = grids[0];
				if (grid) {
					await applyLayoutToItems(grid, nextOrder);
				}

				// Update data items if bound
				let reorderedItemsArray: T[] | undefined;
				if (items) {
					const nextData = [...items];
					const [movedData] = nextData.splice(fromIndex, 1);
					nextData.splice(toIndex, 0, movedData);
					items = nextData;
					reorderedItemsArray = nextData;
				}

				onreorder?.({ fromIndex, toIndex, items: reorderedItemsArray });
			}

			cleanupDragState();
		}, 150);
	}

	function handlePointerDown(e: PointerEvent) {
		if (!reorderable || isDragging || isSettling || !masonryElement) return;

		// Only handle primary button for mouse
		if (e.pointerType === 'mouse' && e.button !== 0) return;

		const target = e.target as HTMLElement;

		// If drag handle selector is specified, require click on handle
		if (dragHandleSelector && !target.closest(dragHandleSelector)) {
			return;
		}

		// Don't intercept form input editing (text inputs, selects, textareas)
		if (!dragHandleSelector && target.closest('input, textarea, select, [contenteditable="true"]')) {
			return;
		}

		const item = findGridItemFromEvent(target);
		if (!item) return;

		hasMovedAfterDrag = false;
		pendingDragItem = item;
		pointerStartX = e.clientX;
		pointerStartY = e.clientY;
		activePointerId = e.pointerId;

		console.log(
			JSON.stringify({
				event: 'pointerdown',
				pointerType: e.pointerType,
				pointerId: e.pointerId,
				targetTag: target.tagName,
				itemIndex: getDirectGridItems().indexOf(item)
			})
		);

		if (e.pointerType === 'touch') {
			longPressTimer = setTimeout(() => {
				console.log(
					JSON.stringify({
						event: 'longPressTriggered',
						pointerId: activePointerId
					})
				);
				if (pendingDragItem) {
					startDragging(pendingDragItem);
				}
			}, longPressDelay);
		}
	}

	function handlePointerMove(e: PointerEvent) {
		if (activePointerId !== null && e.pointerId !== activePointerId) return;

		const deltaX = e.clientX - pointerStartX;
		const deltaY = e.clientY - pointerStartY;
		const distance = Math.hypot(deltaX, deltaY);

		// Cancel pending long press if user is scrolling/gesturing before threshold
		if (longPressTimer && distance > 8) {
			console.log(
				JSON.stringify({
					event: 'longPressCancelledDueToMovement',
					distance
				})
			);
			clearTimeout(longPressTimer);
			longPressTimer = null;
		}

		// Mouse drag initiation threshold
		if (!isDragging && !isSettling && pendingDragItem && e.pointerType === 'mouse' && distance > 4) {
			startDragging(pendingDragItem);
		}

		if (!isDragging || isSettling || !draggedItem || !masonryElement) return;

		e.preventDefault();

		// Move dragged card smoothly 1:1 with cursor, applying scale in transform
		draggedItem.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${dragScale})`;

		// Update global drop target pointer position
		dropManager.updatePointer(e.clientX, e.clientY);

		// Check if pointer is inside drop zone boundary
		const rect = masonryElement.getBoundingClientRect();
		const margin = 24;
		const inside =
			e.clientX >= rect.left - margin &&
			e.clientX <= rect.right + margin &&
			e.clientY >= rect.top - margin &&
			e.clientY <= rect.bottom + margin;

		if (!inside) {
			if (isPointerInsideBounds) {
				isPointerInsideBounds = false;
				console.log(JSON.stringify({ event: 'pointerLeftBounds' }));
				if (currentDropTargetItem && currentDropTargetItem !== draggedItem) {
					currentDropTargetItem.classList.remove('akui-masonry-drop-target');
				}
				currentDropTargetItem = draggedItem;
			}
			return;
		}

		isPointerInsideBounds = true;

		// Detect hovered destination card using container-relative coordinates
		const relPointerX = e.clientX - rect.left;
		const relPointerY = e.clientY - rect.top;

		let targetItem: HTMLElement | null = null;
		let minDistance = Infinity;

		// Check if pointer is directly over original slot
		const isOverOrigin =
			relPointerX >= draggedStartLeft &&
			relPointerX <= draggedStartLeft + itemWidth &&
			relPointerY >= draggedStartTop &&
			relPointerY <= draggedStartTop + itemHeight;

		if (isOverOrigin) {
			targetItem = draggedItem;
		} else {
			for (const item of originalItemsList) {
				if (item === draggedItem) continue;
				const slot = cachedPlacements.get(item);
				if (!slot) continue;

				if (
					relPointerX >= slot.left &&
					relPointerX <= slot.left + slot.width &&
					relPointerY >= slot.top &&
					relPointerY <= slot.top + slot.height
				) {
					targetItem = item;
					break;
				}

				const dist = Math.hypot(relPointerX - slot.centerX, relPointerY - slot.centerY);
				if (dist < minDistance && dist < slot.width * 0.8) {
					minDistance = dist;
					targetItem = item;
				}
			}
		}

		// Update dotted outline on destination card
		if (targetItem !== currentDropTargetItem) {
			if (currentDropTargetItem && currentDropTargetItem !== draggedItem) {
				currentDropTargetItem.classList.remove('akui-masonry-drop-target');
			}
			currentDropTargetItem = targetItem;
			if (currentDropTargetItem && currentDropTargetItem !== draggedItem) {
				currentDropTargetItem.classList.add('akui-masonry-drop-target');
			}
		}
	}

	function handlePointerUp(e: PointerEvent) {
		if (activePointerId !== null && e.pointerId !== activePointerId) return;

		console.log(
			JSON.stringify({
				event: 'pointerup',
				isDragging,
				isPointerInsideBounds
			})
		);

		if (longPressTimer) {
			clearTimeout(longPressTimer);
			longPressTimer = null;
		}

		if (isDragging && !isSettling) {
			// Check if handled by an external drop target first
			const handledExternally = dropManager.handleDrop(e);
			if (handledExternally) {
				cancelDrag('droppedOnExternalTarget');
			} else if (isPointerInsideBounds) {
				commitDrop();
			} else {
				cancelDrag('droppedOutsideBounds');
			}
		} else if (!isSettling) {
			cleanupDragState();
		}
	}

	function handlePointerCancel(e: PointerEvent) {
		console.log(
			JSON.stringify({
				event: 'pointercancel',
				pointerId: e.pointerId,
				isDragging
			})
		);

		if (longPressTimer) {
			clearTimeout(longPressTimer);
			longPressTimer = null;
		}
		if (isDragging && !isSettling) {
			cancelDrag('pointercancelled');
		} else if (!isSettling) {
			cleanupDragState();
		}
	}

	function handleContextMenu(e: MouseEvent) {
		if (isDragging || pendingDragItem || longPressTimer) {
			console.log(JSON.stringify({ event: 'contextmenuSuppressed' }));
			e.preventDefault();
		}
	}

	function handleClickCapture(e: MouseEvent) {
		if (hasMovedAfterDrag) {
			console.log(JSON.stringify({ event: 'clickSuppressedAfterDrag' }));
			e.preventDefault();
			e.stopPropagation();
			hasMovedAfterDrag = false;
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Escape' && isDragging && !isSettling) {
			e.preventDefault();
			cancelDrag('escapePressed');
		}
	}

	// Re-initialize layout when container reference is set
	$effect(() => {
		if (masonryElement) {
			calcGrid([masonryElement]);
		}
	});

	// Reactively trigger layout updates whenever container width changes (e.g. sidebar toggles)
	$effect(() => {
		if (containerWidth > 0 && allowResize && !isDragging && !isSettling) {
			refresh();
		}
	});

	// Trigger layout refresh when resizing is re-enabled to snap immediately to final width
	$effect(() => {
		if (allowResize && !isDragging && !isSettling) {
			refresh();
		}
	});

	onMount(() => {
		let mutationObserver: MutationObserver | null = null;

		if (masonryElement) {
			mutationObserver = new MutationObserver(() => {
				if (!isDragging && !isSettling) {
					calcGrid([masonryElement!]);
				}
			});
			mutationObserver.observe(masonryElement, {
				childList: true
			});
		}

		window.addEventListener('keydown', handleKeyDown);

		return () => {
			if (mutationObserver) {
				mutationObserver.disconnect();
			}
			window.removeEventListener('keydown', handleKeyDown);
			if (longPressTimer) {
				clearTimeout(longPressTimer);
			}
		};
	});
</script>

<svelte:window
	onresize={refresh}
	onpointermove={handlePointerMove}
	onpointerup={handlePointerUp}
	onpointercancel={handlePointerCancel}
/>

<div
	bind:this={masonryElement}
	bind:clientWidth={containerWidth}
	class="akui-masonry"
	class:akui-masonry-reorderable={reorderable}
	class:akui-masonry-is-dragging={isDragging}
	onpointerdown={handlePointerDown}
	oncontextmenu={handleContextMenu}
	onclickcapture={handleClickCapture}
	ondragstart={(e) => {
		if (reorderable) e.preventDefault();
	}}
	style={`
      --masonry-grid-gap: ${gridGap}; 
      --masonry-padding: ${padding};
      --masonry-col-width: ${colWidth};
      ${animate && hasCalculated ? `--masonry-transition: left ${transitionDuration} ${transitionEasing}, top ${transitionDuration} ${transitionEasing}, width ${transitionDuration} ${transitionEasing};` : ''}
     `}
	{...restProps}
>
	<div
		bind:this={originSlotElement}
		class="akui-masonry-origin-slot"
		aria-hidden="true"
	></div>

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
		transition: var(--masonry-transition, none);
	}
	.akui-masonry-reorderable > :global(*) {
		user-select: none;
		-webkit-user-select: none;
		-webkit-touch-callout: none;
		touch-action: none;
	}
	.akui-masonry-reorderable :global(a),
	.akui-masonry-reorderable :global(img) {
		-webkit-user-drag: none;
		-webkit-touch-callout: none;
	}
	.akui-masonry > :global(*.akui-masonry-item-dragging) {
		z-index: 1000 !important;
		opacity: 0.95;
		box-shadow: var(--akui-shadow-l, 0 14px 28px rgba(0, 0, 0, 0.22));
		pointer-events: none !important;
		cursor: grabbing;
	}
	.akui-masonry > :global(*.akui-masonry-drop-target) {
		border: 2px dashed var(--akui-border-subtle, rgba(128, 128, 128, 0.4)) !important;
		background: var(--akui-bg-secondary, rgba(128, 128, 128, 0.08)) !important;
		border-radius: var(--akui-radius-m, 8px) !important;
		box-sizing: border-box !important;
		box-shadow: none !important;
	}
	.akui-masonry > :global(*.akui-masonry-drop-target > *) {
		opacity: 0 !important;
		visibility: hidden !important;
		pointer-events: none !important;
	}
	.akui-masonry > :global(*.akui-masonry-origin-slot) {
		display: none;
		position: absolute;
		border: 2px dashed var(--akui-border-subtle, rgba(128, 128, 128, 0.4));
		background: var(--akui-bg-secondary, rgba(128, 128, 128, 0.08));
		border-radius: var(--akui-radius-m, 8px);
		box-sizing: border-box;
		pointer-events: none;
		z-index: 1;
		transition: none !important;
	}
	.akui-masonry-is-dragging > :global(*.akui-masonry-origin-slot) {
		display: block;
	}
</style>
