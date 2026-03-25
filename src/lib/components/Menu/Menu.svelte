<script lang="ts">
	import { type Snippet, onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import MenuDesktop from './MenuDesktop.svelte';
	import MenuMobile from './MenuMobile.svelte';

	interface Props {
		x?: number;
		y?: number;
		onClose?: () => void;
		children: Snippet;
		class?: string;
		forceMobile?: boolean;
		showBackdrop?: boolean;
		origin?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
	}

	let {
		x,
		y,
		onClose,
		children,
		class: className = '',
		forceMobile = false,
		showBackdrop = true,
		origin = 'top-left'
	}: Props = $props();

	let dialog = $state<HTMLDialogElement>();
	let container = $state<HTMLDivElement>();
	let windowWidth = $state(typeof window !== 'undefined' ? window.innerWidth : 1024);
	const isMobile = $derived(forceMobile || windowWidth <= 720);

	let adjustedX = $state(x ?? 100);
	let adjustedY = $state(y ?? 100);

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
		if (x !== undefined || y !== undefined || origin || isMobile || container) {
			updatePosition();
		}
	});

	function handleClose() {
		if (onClose) onClose();
	}

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
	transition:fade={{ duration: 250 }}
	class="akui-menu-dialog"
>
	{#if rendered}
		{#if showBackdrop}
			<div class="akui-menu-backdrop" transition:fade={{ duration: 250 }}></div>
		{/if}

		{#if isMobile}
			<MenuMobile class={className}>
				{@render children()}
			</MenuMobile>
		{:else}
			<div bind:this={container} class="akui-menu-desktop-proxy">
				<MenuDesktop class={className} x={adjustedX} y={adjustedY} {origin}>
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

	.akui-menu-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(4px);
		z-index: 1000;
	}

	.akui-menu-desktop-proxy {
		display: contents;
	}
</style>
