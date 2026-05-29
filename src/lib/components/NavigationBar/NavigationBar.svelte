<script lang="ts">
	import { type Snippet } from 'svelte';

	interface Props {
		/** The individual NavigationBarItem elements. */
		children: Snippet;
		/** Additional CSS classes for the navigation bar container. */
		class?: string;
	}

	let {
		children,
		class: className = ''
	}: Props = $props();
</script>

<nav class="akui-navigation-bar {className}" aria-label="Bottom Navigation">
	{@render children()}
</nav>

<style>
	.akui-navigation-bar {
		display: flex;
		justify-content: space-around;
		align-items: center;
		height: 5rem; /* MD3 standard 80px */
		background-color: var(--akui-bg);
		color: var(--akui-fg);
		border-top: 1px solid var(--akui-border-input);
		box-sizing: border-box;
		width: 100%;
		z-index: 40;
	}

	/* Force child items to distribute evenly */
	.akui-navigation-bar > :global(*) {
		flex: 1;
		min-width: 0;
		height: 100%;
	}

	:global([data-theme='dark']) .akui-navigation-bar {
		background: var(--akui-bg-secondary);
		border-top-color: rgba(255, 255, 255, 0.05);
	}
</style>
