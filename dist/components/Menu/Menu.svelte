<script lang="ts">
	import { type Snippet, onMount, setContext } from 'svelte';
	import { fade } from 'svelte/transition';
	import { ANIMATION_DURATION, ANIMATION_EASING } from '../../constants.js';
	import MenuDesktop from './MenuDesktop.svelte';
	import MenuMobile from './MenuMobile.svelte';
	import { MENU_CONTEXT_KEY } from './index.js';

	interface Props {
		x?: number;
		y?: number;
		onClose?: () => void;
		children: Snippet;
		class?: string;
		forceMobile?: boolean;
		origin?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
	}

	let {
		x,
		y,
		onClose,
		children,
		class: className = '',
		forceMobile = false,
		origin = 'top-left'
	}: Props = $props();

	function handleClose() {
		if (onClose) onClose();
	}

	setContext(MENU_CONTEXT_KEY, { close: handleClose });

	let dialog = $state<HTMLDialogElement>();
	let container = $state<HTMLDivElement>();
	let windowWidth = $state(typeof window !== 'undefined' ? window.innerWidth : 1024);
	const isMobile = $derived.by(() => forceMobile || windowWidth <= 720);

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
	transition:fade={{ duration: ANIMATION_DURATION, easing: ANIMATION_EASING }}
	class="akui-menu-dialog"
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
</style>
