<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import DragHandler from '../DragHandler/DragHandler.svelte';

	interface Props {
		/** Minimum width (in pixels) for the container to show both panes. Defaults to 768. */
		minWidth?: number;
		/** The route ID that represents the root/list view. */
		baseRouteId: string;
		/** The currently active route ID to compare against baseRouteId. */
		currentRouteId: string;
		/** Whether to hide the nested pane on desktop when no item is selected (i.e. at base route). Defaults to false. */
		hideNestedWhenEmpty?: boolean;
		/** Snippet for the main pane (e.g. List). Passes transition state details. */
		mainPane?: Snippet<[{ isStacked: boolean }]>;
		/** Snippet for the nested pane (e.g. Detail/Reader). Passes transition state details. */
		nestedPane?: Snippet<[{ isStacked: boolean }]>;
		/** Bindable width (in pixels) for the main pane on desktop. Defaults to 320. */
		mainPaneWidth?: number;
		/** Minimum allowed width for the main pane. Defaults to 320. */
		minMainPaneWidth?: number;
		/** Maximum allowed width for the main pane. Defaults to Infinity. */
		maxMainPaneWidth?: number;
		/** Minimum allowed width for the nested detail pane on desktop. Defaults to 320. */
		minNestedPaneWidth?: number;
	}

	let {
		minWidth = 768,
		baseRouteId,
		currentRouteId,
		hideNestedWhenEmpty = false,
		mainPane,
		nestedPane,
		mainPaneWidth = $bindable(320),
		minMainPaneWidth = 320,
		maxMainPaneWidth = Infinity,
		minNestedPaneWidth = 320
	}: Props = $props();

	// Initialize container width with window.innerWidth if available to prevent
	// mobile layout flashing (which occurs if we start at 0 and default to desktop split view).
	let containerWidth = $state(typeof window !== 'undefined' ? window.innerWidth : 0);
	let prefersReducedMotion = $state(false);
	let isDragging = $state(false);
	// We track if layout is ready/painted. We only enable CSS transitions AFTER mounting and initial paint
	// to prevent sliding transitions on load when hydrating from SSR/0-width to mobile stacked layouts.
	let isLayoutReady = $state(false);

	// Determine layout mode based on available space. We fallback to window.innerWidth
	// to ensure correct stacked state on initial browser render before clientWidth binds.
	let isStacked = $derived(
		containerWidth > 0
			? containerWidth < minWidth
			: (typeof window !== 'undefined' ? window.innerWidth < minWidth : false)
	);
	let isBaseRoute = $derived(currentRouteId === baseRouteId);

	// Desktop specific behavior to collapse/expand nested pane
	let shouldHideNested = $derived(!isStacked && hideNestedWhenEmpty && isBaseRoute);

	// Reactively clamp the main pane width when the container size changes to prevent
	// the right-hand details column from shrinking below its minimum width.
	$effect(() => {
		if (containerWidth > 0 && !isStacked && !shouldHideNested) {
			const maxAllowedWidth = Math.min(maxMainPaneWidth, containerWidth - minNestedPaneWidth);
			if (mainPaneWidth > maxAllowedWidth) {
				mainPaneWidth = Math.max(minMainPaneWidth, maxAllowedWidth);
			} else if (mainPaneWidth < minMainPaneWidth) {
				mainPaneWidth = minMainPaneWidth;
			}
		}
	});

	onMount(() => {
		// Delay enabling transitions to let the initial layout state paint silently first.
		const timer = setTimeout(() => {
			isLayoutReady = true;
		}, 20);

		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		prefersReducedMotion = mediaQuery.matches;
		const listener = (e: MediaQueryListEvent) => {
			prefersReducedMotion = e.matches;
		};
		mediaQuery.addEventListener('change', listener);
		return () => {
			clearTimeout(timer);
			mediaQuery.removeEventListener('change', listener);
		};
	});

	let dragStartWidth = 0;

	function handleDragStart() {
		isDragging = true;
		dragStartWidth = mainPaneWidth;
	}

	function handleDrag(detail: { offsetX: number }) {
		// Bound the drag sizing dynamically. The main pane cannot exceed maxMainPaneWidth
		// OR shrink the nested details pane below its minimum specified width.
		// We calculate width relative to dragStartWidth and accumulated offsetX to ensure
		// that if a user drags past a boundary, the handler doesn't immediately move back
		// until the pointer crosses the boundary threshold again.
		const maxAllowedWidth = Math.min(maxMainPaneWidth, containerWidth - minNestedPaneWidth);
		mainPaneWidth = Math.max(minMainPaneWidth, Math.min(maxAllowedWidth, dragStartWidth + detail.offsetX));
	}
</script>

<div
	class="akui-adaptive-pane"
	bind:clientWidth={containerWidth}
	class:is-stacked={isStacked}
	class:hide-nested={shouldHideNested}
	class:is-ready={isLayoutReady}
>
	<!-- 
		On desktop, we set the pane's width style. When the nested pane is hidden, we expand the main pane 
		to 100% width. When dragging is active, we disable transitions for fluid resizing.
	-->
	<div
		class="akui-pane-main"
		class:active={isBaseRoute}
		inert={isStacked && !isBaseRoute ? true : undefined}
		style={!isStacked
			? `width: ${shouldHideNested ? '100%' : `${mainPaneWidth}px`}; max-width: none; min-width: ${shouldHideNested ? '0' : `${minMainPaneWidth}px`}; flex: 0 0 auto; ${isDragging ? 'transition: none;' : ''}`
			: ''}
	>
		{@render mainPane?.({ isStacked })}
	</div>

	{#if !isStacked && !shouldHideNested}
		<DragHandler
			orientation="vertical"
			onDrag={handleDrag}
			onDragStart={handleDragStart}
			onDragEnd={() => (isDragging = false)}
		/>
	{/if}

	<div
		class="akui-pane-nested"
		class:active={!isBaseRoute}
		inert={(isStacked && isBaseRoute) || shouldHideNested ? true : undefined}
	>
		{#if !isStacked}
			{#key currentRouteId}
				<div
					class="akui-pane-nested-transition-wrapper"
					in:fly={prefersReducedMotion ? { duration: 0 } : { x: -50, duration: 250, easing: cubicOut }}
					out:fade={prefersReducedMotion ? { duration: 0 } : { duration: 150 }}
				>
					{@render nestedPane?.({ isStacked })}
				</div>
			{/key}
		{:else}
			<div class="akui-pane-nested-transition-wrapper">
				{@render nestedPane?.({ isStacked })}
			</div>
		{/if}
	</div>
</div>

<style>
	.akui-adaptive-pane {
		display: flex;
		width: 100%;
		height: 100%;
		overflow: hidden;
		background-color: var(--akui-bg, #ffffff);
		position: relative;
	}

	.akui-pane-main {
		flex: 1 1 auto;
		max-width: 400px;
		min-width: 320px;
		height: 100%;
		overflow-y: auto;
		border-right: 1px solid var(--akui-border-input, #e5e7eb);
		background-color: var(--akui-bg);
		box-sizing: border-box;
		transition: border-right-color 0.3s ease;
	}

	/* CSS Transitions are scoped to .is-ready so they don't fire during initial mounting paint */
	.akui-adaptive-pane.is-ready .akui-pane-main {
		transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-right-color 0.3s ease;
	}

	.akui-pane-nested {
		flex: 2 1 0%;
		min-width: 0;
		height: 100%;
		overflow-y: auto;
		background-color: var(--akui-bg);
		box-sizing: border-box;
		position: relative;
	}

	.akui-adaptive-pane.is-ready .akui-pane-nested {
		transition: flex 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	/* On desktop, make the nested pane a grid to stack transitioning elements perfectly */
	.akui-adaptive-pane:not(.is-stacked) .akui-pane-nested {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
		overflow: hidden;
	}

	.akui-pane-nested-transition-wrapper {
		grid-column: 1;
		grid-row: 1;
		width: 100%;
		height: 100%;
		overflow-y: auto;
		box-sizing: border-box;
		background-color: var(--akui-bg);
	}

	/* Desktop layout transitions when nested pane is hidden */
	.akui-adaptive-pane.hide-nested .akui-pane-main {
		max-width: 100%;
		border-right-color: transparent;
	}

	.akui-adaptive-pane.hide-nested .akui-pane-nested {
		flex: 0 0 0%;
		opacity: 0;
		pointer-events: none;
		overflow: hidden;
	}

	/* When stacked, both panes overlap in a single grid cell and transition smoothly */
	.akui-adaptive-pane.is-stacked {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
	}

	.akui-adaptive-pane.is-stacked .akui-pane-main,
	.akui-adaptive-pane.is-stacked .akui-pane-nested {
		grid-column: 1;
		grid-row: 1;
		width: 100%;
		height: 100%;
		max-width: none;
		min-width: 0;
		border-right: none;
		will-change: transform, opacity;
	}

	.akui-adaptive-pane.is-ready.is-stacked .akui-pane-main,
	.akui-adaptive-pane.is-ready.is-stacked .akui-pane-nested {
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
	}

	/* Main Pane stacked states */
	.akui-adaptive-pane.is-stacked .akui-pane-main {
		transform: translate3d(-100%, 0, 0);
		opacity: 0;
	}
	.akui-adaptive-pane.is-stacked .akui-pane-main.active {
		transform: translate3d(0, 0, 0);
		opacity: 1;
	}

	/* Nested Pane stacked states */
	.akui-adaptive-pane.is-stacked .akui-pane-nested {
		transform: translate3d(100%, 0, 0);
		opacity: 0;
	}
	.akui-adaptive-pane.is-stacked .akui-pane-nested.active {
		transform: translate3d(0, 0, 0);
		opacity: 1;
	}

	/* Refined for reduced motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.akui-adaptive-pane.is-stacked .akui-pane-main,
		.akui-adaptive-pane.is-stacked .akui-pane-nested {
			transform: none !important;
			transition: opacity 0.2s ease;
		}
		.akui-pane-main,
		.akui-pane-nested {
			transition: opacity 0.2s ease, max-width 0.2s ease, flex 0.2s ease !important;
		}
	}
</style>
