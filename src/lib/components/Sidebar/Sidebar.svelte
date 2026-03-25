<script lang="ts">
	import { type Snippet, onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	interface Props {
		/** The main content of the application. */
		children: Snippet;
		/** The content to be displayed in the sidebar. */
		sidebar: Snippet;
		/** Whether the sidebar is open (primarily for mobile). */
		isOpen?: boolean;
		/** The width of the sidebar. Defaults to '280px'. */
		width?: string;
		/** Additional CSS classes for the container. */
		class?: string;
	}

	let {
		children,
		sidebar,
		isOpen = $bindable(false),
		width = '280px',
		class: className = ''
	}: Props = $props();

	let windowWidth = $state(typeof window !== 'undefined' ? window.innerWidth : 1024);
	const isMobile = $derived(windowWidth <= 768);

	onMount(() => {
		const handleResize = () => {
			windowWidth = window.innerWidth;
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});
</script>

<div
	class="akui-sidebar-layout {className}"
	class:is-mobile={isMobile}
	class:is-open={isOpen}
	style:--sidebar-width={width}
>
	<aside class="akui-sidebar">
		<div class="akui-sidebar-inner">
			{@render sidebar?.()}
		</div>
	</aside>

	<main class="akui-main">
		{#if isMobile && isOpen}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="akui-sidebar-backdrop"
				onclick={() => (isOpen = false)}
				transition:fade={{ duration: 200 }}
			></div>
		{/if}
		<div class="akui-main-content">
			{@render children?.()}
		</div>
	</main>
</div>

<style>
	.akui-sidebar-layout {
		display: flex;
		width: 100%;
		min-height: 100vh;
		position: relative;
		transition: transform 0.3s ease;
		background-color: var(--akui-bg);
		color: var(--akui-fg);
	}

	.akui-sidebar {
		width: var(--sidebar-width);
		height: 100vh;
		position: sticky;
		top: 0;
		flex-shrink: 0;
		background: var(--akui-bg);
		border-right: 1px solid var(--akui-border-input);
		z-index: 20;
		display: flex;
		flex-direction: column;
	}

	.akui-sidebar-inner {
		flex: 1;
		overflow-y: auto;
	}

	.akui-main {
		flex: 1;
		min-width: 0;
		position: relative;
		display: flex;
		flex-direction: column;
		z-index: 10;
	}

	.akui-main-content {
		flex: 1;
		background-color: var(--akui-bg);
	}

	/* Mobile Styles */
	@media (max-width: 768px) {
		.akui-sidebar-layout {
			/* Ensure we don't clip the sidebar when it's at the left edge */
			overflow: visible;
		}

		.akui-sidebar {
			position: relative; /* Back to relative but shifted out */
			margin-left: calc(-1 * var(--sidebar-width));
			height: 100vh;
			z-index: 20;
		}

		.akui-sidebar-layout.is-open {
			transform: translateX(var(--sidebar-width));
		}

		.akui-sidebar-backdrop {
			position: fixed;
			top: 0;
			bottom: 0;
			left: 0;
			right: 0;
			background: rgba(0, 0, 0, 0.4);
			z-index: 15;
			/* Since the parent is transformed, we need to counter-transform the backdrop 
			   to keep it covering the entire screen. */
			width: 100vw;
			height: 100vh;
			transform: translateX(calc(-1 * var(--sidebar-width)));
		}

		/* Prevent the entire page from having a horizontal scrollbar */
		:global(body) {
			overflow-x: hidden;
		}
	}
</style>
