<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

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
	}

	let { 
		minWidth = 768, 
		baseRouteId, 
		currentRouteId, 
		hideNestedWhenEmpty = false, 
		mainPane, 
		nestedPane 
	}: Props = $props();

	let containerWidth = $state(0);
	let prefersReducedMotion = $state(false);

	// Determine layout mode based on available space
	let isStacked = $derived(containerWidth > 0 && containerWidth < minWidth);
	let isBaseRoute = $derived(currentRouteId === baseRouteId);
	
	// Desktop specific behavior to collapse/expand nested pane
	let shouldHideNested = $derived(!isStacked && hideNestedWhenEmpty && isBaseRoute);

	onMount(() => {
		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		prefersReducedMotion = mediaQuery.matches;
		const listener = (e: MediaQueryListEvent) => {
			prefersReducedMotion = e.matches;
		};
		mediaQuery.addEventListener('change', listener);
		return () => mediaQuery.removeEventListener('change', listener);
	});
</script>

<div 
	class="akui-adaptive-pane" 
	bind:clientWidth={containerWidth} 
	class:is-stacked={isStacked}
	class:hide-nested={shouldHideNested}
>
	<div 
		class="akui-pane-main" 
		class:active={isBaseRoute}
		inert={isStacked && !isBaseRoute ? true : undefined}
	>
		{@render mainPane?.({ isStacked })}
	</div>

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
		min-width: 250px;
		height: 100%;
		overflow-y: auto;
		border-right: 1px solid var(--akui-border-input, #e5e7eb);
		background-color: var(--akui-bg);
		box-sizing: border-box;
		transition: max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-right-color 0.3s ease;
	}

	.akui-pane-nested {
		flex: 2 1 0%;
		height: 100%;
		overflow-y: auto;
		background-color: var(--akui-bg);
		box-sizing: border-box;
		position: relative;
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
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
		will-change: transform, opacity;
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
