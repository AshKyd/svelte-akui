<script lang="ts">
	import { type Snippet, onMount } from 'svelte';
	import Button from '../Button/Button.svelte';

	interface Props {
		/** Svelte snippet for the app brand/title/logo. */
		title?: Snippet;
		/** Svelte snippet for header actions (right-aligned). */
		children?: Snippet;
		/** Whether the linked sidebar is open (primarily for mobile). */
		sidebarOpen?: boolean;
		/** Whether to show the hamburger menu (if a sidebar is available). */
		hasSidebar?: boolean;
		/** Additional CSS classes for the header. */
		class?: string;
	}

	let {
		title,
		children,
		sidebarOpen = $bindable(false),
		hasSidebar = false,
		class: className = ''
	}: Props = $props();

	let windowWidth = $state(typeof window !== 'undefined' ? window.innerWidth : 1024);
	const isMobile = $derived.by(() => windowWidth <= 768);

	onMount(() => {
		const handleResize = () => {
			windowWidth = window.innerWidth;
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});

	// Logic for title visibility on mobile
	const showTitle = $derived.by(() => !isMobile || !hasSidebar);
</script>

<header class="akui-header {className}">
	<div class="akui-header-left">
		{#if isMobile && hasSidebar}
			<Button
				variant="regular"
				icon="list"
				iconPosition="only"
				onclick={() => (sidebarOpen = !sidebarOpen)}
				class="akui-hamburger"
				aria-label="Toggle Menu"
			/>
		{/if}

		{#if showTitle && title}
			<div class="akui-header-title">
				{@render title()}
			</div>
		{/if}
	</div>

	<div class="akui-header-right">
		{#if children}
			{@render children()}
		{/if}
	</div>
</header>

<style>
	.akui-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 4rem;
		padding: 0 var(--akui-space-m);
		background-color: var(--akui-bg);
		color: var(--akui-fg);
		border-bottom: 1px solid var(--akui-border-input);
		box-sizing: border-box;
		position: sticky;
		top: 0;
		z-index: 50;
		width: 100%;
	}

	.akui-header-left {
		display: flex;
		align-items: center;
		gap: var(--akui-space-m);
	}

	.akui-header-title {
		font-weight: 600;
		font-size: 1.125rem;
		display: flex;
		align-items: center;
	}

	.akui-header-right {
		display: flex;
		align-items: center;
		gap: var(--akui-space-s);
	}

	/* Ensure the hamburger button doesn't have extra margin/padding that breaks alignment */
	:global(.akui-hamburger) {
		margin: 0;
	}

	@media (max-width: 768px) {
		.akui-header {
			height: 3.5rem;
			padding: 0 var(--akui-space-s);
		}
	}
</style>
