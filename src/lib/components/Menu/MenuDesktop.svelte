<script lang="ts">
	import { type Snippet } from 'svelte';
	import { fade } from 'svelte/transition';

	interface Props {
		children: Snippet;
		class?: string;
		x?: number;
		y?: number;
		origin?: string;
	}

	let { children, class: className = '', x, y, origin = 'top-left' }: Props = $props();
</script>

<div
	class="akui-desktop-menu-layer {className}"
	onclick={(e) => e.stopPropagation()}
	style:left="{x}px"
	style:top="{y}px"
	style:transform-origin={origin.split('-').join(' ')}
	transition:fade={{ duration: 250 }}
>
	<div class="akui-menu-card">
		<div class="akui-menu-scroll-area">
			{@render children()}
		</div>
	</div>
</div>

<style>
	.akui-menu-desktop-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: transparent;
		z-index: 1000;
		pointer-events: auto;
	}

	.akui-desktop-menu-layer {
		position: fixed;
		z-index: 1001;
		pointer-events: auto;
	}

	.akui-menu-card {
		background: var(--akui-bg);
		color: var(--akui-fg);
		border-radius: var(--akui-radius-l);
		border: 1px solid var(--akui-border-input);
		box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
		min-width: 200px;
		max-width: 320px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.akui-menu-scroll-area {
		flex: 1;
		overflow-y: auto;
		max-height: calc(100vh - 32px);
	}

	/* Ensure snippet content fills area */
	.akui-menu-scroll-area :global(> *) {
		min-width: 100%;
	}
</style>
