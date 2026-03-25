<script lang="ts">
	import { type Snippet } from 'svelte';
	import { fade } from 'svelte/transition';

	interface Props {
		children: Snippet;
		class?: string;
	}

	let { children, class: className = '' }: Props = $props();
</script>

<div class="akui-desktop-menu-layer {className}" transition:fade={{ duration: 250 }}>
	<div class="akui-menu-card">
		<div class="akui-menu-scroll-area">
			{@render children()}
		</div>
	</div>
</div>

<style>
	.akui-desktop-menu-layer {
		z-index: 1001;
		pointer-events: auto;
	}

	.akui-menu-card {
		background: var(--akui-bg, #ffffff);
		color: var(--akui-fg, #000000);
		border: 1px solid var(--akui-border, rgba(255, 255, 255, 0.1));
		border-radius: 0.75rem;
		box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
		overflow: hidden;
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
