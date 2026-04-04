<script lang="ts">
	import { type Snippet, onMount, tick } from 'svelte';
	import { fade } from 'svelte/transition';
	import { ANIMATION_DURATION, ANIMATION_EASING } from '../../constants.js';
	import { ControlGroup } from '../Control/index.js';

	interface Props {
		/** The main content of the application. */
		children: Snippet;
		/** The content to be displayed in the sidebar. */
		sidebar: Snippet;
		/** Optional header to be integrated (above on desktop, shifting on mobile). */
		header?: Snippet;
		/** Optional footer to be displayed at the bottom of the sidebar. */
		footer?: Snippet;
		/** Optional title/logo to be shown in the sidebar on mobile. */
		title?: Snippet;
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
		header,
		footer,
		title,
		isOpen = $bindable(false),
		width = '280px',
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

	let sidebarEl = $state<HTMLElement | null>(null);
	let lastFocusedEl: Element | null = null;

	$effect(() => {
		if (isMobile && isOpen) {
			// Save the currently focused element to return focus later
			lastFocusedEl = document.activeElement;
			// Move focus to the first interactive element in the sidebar
			tick().then(() => {
				const focusable = sidebarEl?.querySelector('a, button, [tabindex="1"],[tabindex="0"]') as HTMLElement;
				focusable?.focus();
			});
		} else if (isMobile && !isOpen && lastFocusedEl instanceof HTMLElement) {
			// Restore focus when the menu closes
			lastFocusedEl.focus();
		}
	});

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && isMobile && isOpen) {
			isOpen = false;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="akui-sidebar-wrapper">
	{#if !isMobile && header}
		{@render header()}
	{/if}

	<div
		class="akui-sidebar-layout {className}"
		class:is-mobile={isMobile}
		class:is-open={isOpen}
		style:--sidebar-width={width}
	>
		<aside bind:this={sidebarEl} class="akui-sidebar">
			{#if isMobile && title}
				<div class="akui-sidebar-mobile-title">
					{@render title()}
				</div>
			{/if}
			<div class="akui-sidebar-inner">
				<ControlGroup role="navigation" id="akui-sidebar-navigation">
					{@render sidebar?.()}
				</ControlGroup>
			</div>
			{#if footer}
				<div class="akui-sidebar-footer">
					{@render footer()}
				</div>
			{/if}
		</aside>

		<main class="akui-main">
			{#if isMobile && isOpen}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="akui-sidebar-backdrop"
					onclick={() => (isOpen = false)}
					transition:fade={{ duration: ANIMATION_DURATION, easing: ANIMATION_EASING }}
				></div>
			{/if}

			{#if isMobile && header}
				{@render header()}
			{/if}

			<div class="akui-main-content" inert={isMobile && isOpen}>
				{@render children?.()}
			</div>
		</main>
	</div>
</div>

<style>
	.akui-sidebar-wrapper {
		display: flex;
		flex-direction: column;
		height: 100dvh;
		overflow: hidden;
	}

	.akui-sidebar-layout {
		display: flex;
		width: 100%;
		flex: 1;
		min-height: 0;
		position: relative;
		transition: transform 0.3s ease;
		background-color: var(--akui-bg);
		color: var(--akui-fg);
	}

	.akui-sidebar {
		width: var(--sidebar-width);
		height: 100%;
		flex-shrink: 0;
		background: var(--akui-bg);
		border-right: 1px solid var(--akui-border-input);
		z-index: 20;
		display: flex;
		flex-direction: column;
	}

	.akui-sidebar-mobile-title {
		padding: var(--akui-space-m);
		border-bottom: 1px solid var(--akui-border-input);
		font-weight: 600;
	}

	.akui-sidebar-inner {
		flex: 1;
		overflow-y: auto;
	}

	.akui-sidebar-footer {
		padding: var(--akui-space-m);
	}

	.akui-main {
		flex: 1;
		min-width: 0;
		position: relative;
		display: flex;
		flex-direction: column;
		z-index: 10;
		overflow-y: auto;
	}

	.akui-main-content {
		flex: 1;
		background-color: var(--akui-bg);
	}

	/* Mobile Styles */
	@media (max-width: 768px) {
		.akui-sidebar-wrapper {
			min-height: 100vh;
			overflow-x: hidden;
		}

		.akui-sidebar-layout {
			/* Ensure we don't clip the sidebar when it's at the left edge */
			overflow: visible;
		}

		.akui-sidebar {
			position: absolute; /* Back to relative but shifted out */
			left: calc(-1 * var(--sidebar-width));
			height: 100dvh;
			z-index: 20;
		}

		.akui-sidebar-layout.is-open {
			transform: translateX(var(--sidebar-width));
		}

		.akui-sidebar-backdrop {
			position: absolute;
			top: 0;
			bottom: 0;
			left: 0;
			right: 0;
			background: rgba(0, 0, 0, 0.4);
			z-index: 15;
		}

		/* Prevent the entire page from having a horizontal scrollbar */
		:global(body) {
			overflow-x: hidden;
		}
	}

	:global([data-theme='dark']) .akui-sidebar {
		background: var(--akui-bg-secondary);
		border-right-color: rgba(255, 255, 255, 0.05);
	}
</style>
