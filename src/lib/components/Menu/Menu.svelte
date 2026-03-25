<script lang="ts">
	import { type Snippet, onMount } from 'svelte';
	import { fly, scale } from 'svelte/transition';
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

	onMount(() => {
		const handleResize = () => {
			windowWidth = window.innerWidth;
			updatePosition();
		};
		window.addEventListener('resize', handleResize);

		// Show dialog as modal on mount
		if (dialog && !dialog.open) {
			dialog.showModal();
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

<!-- svelte-ignore a11y_click_events_have_key_events -->
<dialog
	bind:this={dialog}
	oncancel={handleCancel}
	onclick={handleClose}
	class="akui-menu-dialog"
	class:no-backdrop={!showBackdrop}
	style:background="transparent"
>
	<!-- Front-layer: The menu content stops propagation! -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div onclick={(e) => e.stopPropagation()}>
		{#if isMobile}
			<div class="akui-menu-mobile-wrapper" transition:fly={{ y: 40, duration: 400, opacity: 0 }}>
				<MenuMobile class={className}>
					{@render children()}
				</MenuMobile>
			</div>
		{:else}
			<div
				class="akui-menu-desktop-wrapper"
				bind:this={container}
				style:left="{adjustedX}px"
				style:top="{adjustedY}px"
				style:transform-origin={origin.split('-').join(' ')}
				in:scale={{ duration: 300, start: 0.9, opacity: 0 }}
				out:scale={{ duration: 400, start: 0.95, opacity: 0 }}
			>
				<MenuDesktop class={className}>
					{@render children()}
				</MenuDesktop>
			</div>
		{/if}
	</div>
</dialog>

<style>
	.akui-menu-dialog {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: transparent;
		border: none;
		margin: 0;
		padding: 0;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.akui-menu-dialog::backdrop {
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(4px);
	}

	.akui-menu-dialog.no-backdrop::backdrop {
		background: transparent;
		backdrop-filter: none;
	}

	/* Force desktop wrapper to respect its coordinates */
	.akui-menu-desktop-wrapper {
		position: fixed;
		z-index: 1001;
	}

	.akui-menu-mobile-wrapper {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 1001;
	}
</style>
