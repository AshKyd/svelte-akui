<script lang="ts">
	import { type Snippet } from 'svelte';
	import { fade } from 'svelte/transition';

	interface Props {
		children: Snippet;
		class?: string;
	}

	let { children, class: className = '' }: Props = $props();

	// handleBackdropClick function removed as the backdrop div is removed.
	// function handleBackdropClick(e: MouseEvent) {
	// 	// Parent handles this now
	// 	if (onClose) onClose();
	// }
</script>

<!-- The akui-menu-mobile-backdrop div and its conditional rendering block have been removed -->

<div
	class="akui-mobile-menu-layer {className}"
	role="presentation"
	onclick={(e) => e.stopPropagation()}
>
	<div class="akui-mobile-menu-content" transition:fade={{ duration: 250 }}>
		<div class="akui-menu-mobile-handle"></div>
		<ul role="menu" class="akui-menu-scroll-area">
			{@render children()}
		</ul>
	</div>
</div>

<style>
	.akui-menu-mobile-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(4px);
		z-index: 1000;
		pointer-events: auto;
	}

	.akui-mobile-menu-layer {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 1001;
		pointer-events: none;
	}

	.akui-mobile-menu-content {
		position: relative;
		background: var(--akui-bg, #ffffff);
		color: var(--akui-fg, #000000);
		border-top: 1px solid var(--akui-border, rgba(0, 0, 0, 0.1));
		border-radius: 1rem 1rem 0 0;
		padding-bottom: env(safe-area-inset-bottom);
		box-shadow: 0 -10px 25px -5px rgba(0, 0, 0, 0.1);
		display: flex;
		flex-direction: column;
		max-height: 90vh;
		pointer-events: auto;
		overflow: hidden;
		width: 100%;
	}

	.akui-menu-mobile-handle {
		width: 36px;
		height: 4px;
		background: var(--akui-bg-button-hover);
		border-radius: 2px;
		margin: 12px auto 4px auto;
		flex-shrink: 0;
		opacity: 0.5;
	}

	.akui-menu-scroll-area {
		flex: 1;
		overflow-y: auto;
		max-height: 70vh;
		padding: 0;
		margin: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
	}

	/* Enhance mobile items: subtle separators between everything except the last child or dividers themselves */
	.akui-menu-scroll-area :global(.akui-menu-item-wrapper:not(:last-child)),
	.akui-menu-scroll-area :global(.akui-menu-content:not(:last-child)) {
		border-bottom: 1px solid var(--akui-border-input);
	}
</style>
