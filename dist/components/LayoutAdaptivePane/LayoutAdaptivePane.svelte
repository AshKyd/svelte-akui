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
		/** Bindable width (in pixels) for the main pane on desktop. Defaults to 400. */
		mainPaneWidth?: number;
		/** Minimum allowed width for the main pane. Defaults to 400. */
		minMainPaneWidth?: number;
		/** Maximum allowed width for the main pane. Defaults to Infinity. */
		maxMainPaneWidth?: number;
		/** Minimum allowed width for the nested detail pane on desktop. Defaults to 400. */
		minNestedPaneWidth?: number;
	}

	let {
		minWidth = 768,
		baseRouteId,
		currentRouteId,
		hideNestedWhenEmpty = false,
		mainPane,
		nestedPane,
		mainPaneWidth = $bindable(400),
		minMainPaneWidth = 400,
		maxMainPaneWidth = Infinity,
		minNestedPaneWidth = 400
	}: Props = $props();

	let containerWidth = $state(typeof window !== 'undefined' ? window.innerWidth : 0);
	let prefersReducedMotion = $state(false);
	let isDragging = $state(false);
	let isLayoutReady = $state(false);

	let isStacked = $derived(
		containerWidth > 0
			? containerWidth < minWidth
			: (typeof window !== 'undefined' ? window.innerWidth < minWidth : false)
	);
	let isBaseRoute = $derived(currentRouteId === baseRouteId);

	let shouldHideNested = $derived(!isStacked && hideNestedWhenEmpty && isBaseRoute);

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
		const maxAllowedWidth = Math.min(maxMainPaneWidth, containerWidth - minNestedPaneWidth);
		mainPaneWidth = Math.max(minMainPaneWidth, Math.min(maxAllowedWidth, dragStartWidth + detail.offsetX));
	}
</script>

<div
	class="akui-layout-adaptive-pane"
	bind:clientWidth={containerWidth}
	class:is-stacked={isStacked}
	class:hide-nested={shouldHideNested}
	class:is-ready={isLayoutReady}
>
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
	.akui-layout-adaptive-pane {
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
		min-width: 400px;
		height: 100%;
		overflow-y: auto;
		border-right: 1px solid var(--akui-border-input, #e5e7eb);
		background-color: var(--akui-bg);
		box-sizing: border-box;
		transition: border-right-color 0.3s ease;
	}

	.akui-layout-adaptive-pane.is-ready .akui-pane-main {
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

	.akui-layout-adaptive-pane.is-ready .akui-pane-nested {
		transition: flex 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.akui-layout-adaptive-pane:not(.is-stacked) .akui-pane-nested {
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

	.akui-layout-adaptive-pane.hide-nested .akui-pane-main {
		max-width: 100%;
		border-right-color: transparent;
	}

	.akui-layout-adaptive-pane.hide-nested .akui-pane-nested {
		flex: 0 0 0%;
		opacity: 0;
		pointer-events: none;
		overflow: hidden;
	}

	.akui-layout-adaptive-pane.is-stacked {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
	}

	.akui-layout-adaptive-pane.is-stacked .akui-pane-main,
	.akui-layout-adaptive-pane.is-stacked .akui-pane-nested {
		grid-column: 1;
		grid-row: 1;
		width: 100%;
		height: 100%;
		max-width: none;
		min-width: 0;
		border-right: none;
		will-change: transform, opacity;
	}

	.akui-layout-adaptive-pane.is-ready.is-stacked .akui-pane-main,
	.akui-layout-adaptive-pane.is-ready.is-stacked .akui-pane-nested {
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
	}

	.akui-layout-adaptive-pane.is-stacked .akui-pane-main {
		transform: translate3d(-100%, 0, 0);
		opacity: 0;
	}
	.akui-layout-adaptive-pane.is-stacked .akui-pane-main.active {
		transform: translate3d(0, 0, 0);
		opacity: 1;
	}

	.akui-layout-adaptive-pane.is-stacked .akui-pane-nested {
		transform: translate3d(100%, 0, 0);
		opacity: 0;
	}
	.akui-layout-adaptive-pane.is-stacked .akui-pane-nested.active {
		transform: translate3d(0, 0, 0);
		opacity: 1;
	}

	@media (prefers-reduced-motion: reduce) {
		.akui-layout-adaptive-pane.is-stacked .akui-pane-main,
		.akui-layout-adaptive-pane.is-stacked .akui-pane-nested {
			transform: none !important;
			transition: opacity 0.2s ease;
		}
		.akui-pane-main,
		.akui-pane-nested {
			transition: opacity 0.2s ease, max-width 0.2s ease, flex 0.2s ease !important;
		}
	}
</style>
