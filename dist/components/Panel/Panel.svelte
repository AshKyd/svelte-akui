<script lang="ts">
	import { type Snippet } from 'svelte';
	import { Glow } from '../Glow/index.js';

	interface Props {
		/** The background colour of the panel. */
		colour?: 'regular' | 'secondary' | 'accent';
		/** The content to render inside the panel. */
		children: Snippet;
		/** Additional CSS classes for the panel. */
		class?: string;
		/** Style overrides. */
		style?: string;
		/** The corner radius of the panel. Defaults to 'regular'. 'full' is infinite (circular). */
		radius?: 'regular' | 'full';
	}

	let { colour = 'regular', children, class: className = '', style = '', radius = 'regular' }: Props = $props();
</script>

<div class="akui-panel {colour} radius-{radius} {className}" {style}>
	<Glow />
	{@render children()}
</div>

<style>
	.akui-panel {
		position: relative;
		overflow: hidden;
		padding: 1rem;
		transition: var(--akui-transition-theme);
		border: 1px solid rgba(0, 0, 0, 0.1);
	}

	.akui-panel.radius-regular {
		border-radius: var(--akui-radius-m);
	}

	.akui-panel.radius-full {
		border-radius: 9999px;
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
