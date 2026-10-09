<script lang="ts">
	import { type Snippet, onMount, setContext } from 'svelte';
	import { fade } from 'svelte/transition';
	import { ANIMATION_DURATION, ANIMATION_EASING } from '../../constants.js';
	import { motion } from '../../hooks/reducedMotion.svelte.js';
	import MenuDesktop from './MenuDesktop.svelte';
	import MenuMobile from './MenuMobile.svelte';
	import { MENU_CONTEXT_KEY } from './index.js';

	interface Props {
		x?: number;
		y?: number;
		onClose?: () => void;
		children: Snippet;
		class?: string;
		/** How the menu is shown. 'auto' picks a popover on wide screens and a bottom sheet on narrow ones. */
		presentation?: 'auto' | 'popover' | 'sheet';
		origin?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
		/** Edge the opening animation starts from. Defaults to the vertical part of `origin`; mobile sheets always open from the bottom. */
		openFrom?: 'top' | 'bottom';
	}

	let {
		x,
		y,
		onClose,
		children,
		class: className = '',
		presentation = 'auto',
		origin = 'top-left',
		openFrom
	}: Props = $props();

	function handleClose() {
		if (onClose) onClose();
	}

	setContext(MENU_CONTEXT_KEY, { close: handleClose });

	let dialog = $state<HTMLDialogElement>();
	let container = $state<HTMLDivElement>();
	let windowWidth = $state(typeof window !== 'undefined' ? window.innerWidth : 1024);
	const isMobile = $derived.by(() => {
		if (presentation !== 'auto') return presentation === 'sheet';
		return windowWidth <= 720;
	});

	/**
	 * Items animate in from the edge nearest the trigger. A bottom-anchored menu sits above its
	 * trigger, so it grows upwards; the mobile sheet slides up from the screen edge.
	 */
	const resolvedOpenFrom = $derived.by(() => {
		if (isMobile) return 'bottom';
		return openFrom ?? (origin.startsWith('bottom') ? 'bottom' : 'top');
	});

	let adjustedX = $state(100);
	let adjustedY = $state(100);

	function updatePosition() {
		if (typeof window === 'undefined' || isMobile || !container) return;

		const rect = container.getBoundingClientRect();
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;

		let nextX = x ?? 100;
		let nextY = y ?? 100;

		// Adjustment based on origin
		if (origin.includes('right')) nextX -= rect.width;
		if (origin.includes('bottom')) nextY -= rect.height;

		// Collision detection
		if (nextX + rect.width > viewportWidth - 16) nextX = viewportWidth - rect.width - 16;
		if (nextX < 16) nextX = 16;
		if (nextY + rect.height > viewportHeight - 16) nextY = viewportHeight - rect.height - 16;
		if (nextY < 16) nextY = 16;

		adjustedX = nextX;
		adjustedY = nextY;
	}

	let rendered = $state(false);

	onMount(() => {
		const handleResize = () => {
			windowWidth = window.innerWidth;
			updatePosition();
		};
		window.addEventListener('resize', handleResize);

		// Show dialog as modal on mount
		if (dialog && !dialog.open) {
			dialog.showModal();
			rendered = true;
		}

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	});

	$effect(() => {
		if (rendered && container) {
			const observer = new ResizeObserver(updatePosition);
			observer.observe(container);
			return () => observer.disconnect();
		}
	});

	$effect(() => {
		if (rendered && (x !== undefined || y !== undefined || origin || isMobile)) {
			updatePosition();
		}
	});

	function handleCancel(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		handleClose();
	}
</script>

<dialog
	bind:this={dialog}
	oncancel={handleCancel}
	onclick={handleClose}
	transition:fade={motion({ duration: ANIMATION_DURATION, easing: ANIMATION_EASING })}
	class="akui-menu-dialog"
	data-open-from={resolvedOpenFrom}
>
	{#if rendered}
		{#if isMobile}
			<MenuMobile class={className}>
				{@render children()}
			</MenuMobile>
		{:else}
			<div
				bind:this={container}
				class="akui-menu-desktop-container"
				role="presentation"
				style:left="{adjustedX}px"
				style:top="{adjustedY}px"
				style:transform-origin={origin.split('-').join(' ')}
				onclick={(e) => e.stopPropagation()}
			>
				<MenuDesktop class={className}>
					{@render children()}
				</MenuDesktop>
			</div>
		{/if}
	{/if}
</dialog>

<style>
	.akui-menu-dialog {
		margin: 0;
		padding: 0;
		border: none;
		background: transparent;
		overflow: visible;
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		display: block;
		max-width: none;
		max-height: none;
		pointer-events: auto;
	}

	.akui-menu-dialog[open] {
		display: block;
	}

	.akui-menu-dialog::backdrop {
		background: transparent;
	}

	.akui-menu-desktop-container {
		position: fixed;
		z-index: 1001;
		pointer-events: auto;
		display: inline-block;
	}

	/* ---- Opening animation ----
	 * Each item fades in and slides from the edge the menu opened from, one after another. The surface
	 * (background, border, shadow) fades in and drifts away from the opening edge over the same span. Item numbers come from `staggerMenuItems`.
	 * Override any of these variables to retune the timing.
	 */
	.akui-menu-dialog {
		--akui-menu-item-duration: 260ms;
		--akui-menu-item-stagger: 40ms;
		--akui-menu-item-distance: 6px;
		/* Items past this many share the last delay, so long lists don't take ages to open. */
		--akui-menu-stagger-limit: 10;
		--akui-menu-surface-distance: 4px;
	}

	/* Offsets are where things start: opening from the top they start higher and move down. */
	.akui-menu-dialog[data-open-from='top'] {
		--akui-menu-item-offset: calc(-1 * var(--akui-menu-item-distance));
		--akui-menu-surface-offset: calc(-1 * var(--akui-menu-surface-distance));
	}

	.akui-menu-dialog[data-open-from='bottom'] {
		--akui-menu-item-offset: var(--akui-menu-item-distance);
		--akui-menu-surface-offset: var(--akui-menu-surface-distance);
	}

	.akui-menu-dialog :global(.akui-menu-surface [role='menu'] > *) {
		--akui-menu-item-order: var(--akui-menu-item-index, 0);
		animation: akui-menu-item-in var(--akui-menu-item-duration) ease-out backwards;
		animation-delay: calc(
			min(var(--akui-menu-item-order), var(--akui-menu-stagger-limit)) *
				var(--akui-menu-item-stagger)
		);
	}

	/* Opening upwards, the bottom item is nearest the trigger, so the order runs in reverse. */
	.akui-menu-dialog[data-open-from='bottom'] :global(.akui-menu-surface [role='menu'] > *) {
		--akui-menu-item-order: var(--akui-menu-item-index-reverse, 0);
	}

	/* The surface fades in alongside the items, finishing as the last item lands. */
	.akui-menu-dialog :global(.akui-menu-surface) {
		animation: akui-menu-surface-in ease-out backwards;
		animation-duration: calc(
			min(var(--akui-menu-item-count, 1) - 1, var(--akui-menu-stagger-limit)) *
				var(--akui-menu-item-stagger) + var(--akui-menu-item-duration)
		);
	}

	@keyframes -global-akui-menu-item-in {
		from {
			opacity: 0;
			translate: 0 var(--akui-menu-item-offset);
		}
	}

	@keyframes -global-akui-menu-surface-in {
		from {
			background-color: transparent;
			border-color: transparent;
			box-shadow: none;
			translate: 0 var(--akui-menu-surface-offset);
		}
	}
</style>
