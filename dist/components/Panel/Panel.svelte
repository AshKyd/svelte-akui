<script lang="ts">
	import { type Snippet } from 'svelte';

	interface Props {
		/** The background colour of the panel. */
		colour?: 'regular' | 'secondary' | 'accent';
		/** The content to render inside the panel. */
		children: Snippet;
		/** Additional CSS classes for the panel. */
		class?: string;
	}

	let { colour = 'regular', children, class: className = '' }: Props = $props();
</script>

<div class="akui-panel {colour} {className}">
	{@render children()}
</div>

<style>
	.akui-panel {
		border-radius: var(--akui-radius-m);
		padding: 1rem;
		box-shadow: var(--akui-shadow-shiny);
		border: 1px solid rgba(0, 0, 0, 0.1);
	}

	:global([data-theme='dark']) .akui-panel {
		border-color: rgba(255, 255, 255, 0.05);
	}

	.akui-panel.regular {
		background-color: var(--akui-bg);
		color: var(--akui-fg);
	}

	.akui-panel.secondary {
		background-color: var(--akui-bg-secondary);
		color: var(--akui-fg-secondary);
	}

	.akui-panel.accent {
		background-color: var(--akui-bg-accent);
		color: var(--akui-fg-accent);
	}
</style>
