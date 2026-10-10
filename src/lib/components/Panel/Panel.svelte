<script lang="ts">
	import { type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Glow } from '../Glow/index.js';
	import { surfaceStyle, type SurfaceStyle } from '../../utils/surface.js';

	interface Props extends HTMLAttributes<HTMLElement> {
		/** The background colour of the panel. */
		colour?: 'regular' | 'secondary' | 'accent';
		/** The content to render inside the panel. */
		children: Snippet;
		/** Additional CSS classes for the panel. */
		class?: string;
		/** Style overrides. */
		style?: string;
		/** Overrides the panel's background, text colour, border colour and backdrop filter, e.g. a translucent background to show the page behind. */
		surface?: SurfaceStyle;
		/** The corner radius of the panel. Defaults to 'regular'. 'full' is infinite (circular). */
		radius?: 'regular' | 'full';
		/** The HTML element to use. Defaults to 'div'. */
		tag?: keyof HTMLElementTagNameMap;
	}

	let {
		colour = 'regular',
		children,
		class: className = '',
		style = '',
		surface,
		radius = 'regular',
		tag = 'div',
		...rest
	}: Props = $props();

	// Surface variables go first so an explicit `style` can still override them.
	const combinedStyle = $derived([surfaceStyle('panel', surface), style].filter(Boolean).join('; '));
</script>

<svelte:element
	this={tag}
	class="akui-panel {colour} radius-{radius} {className}"
	style={combinedStyle}
	{...rest}
>
	<Glow />
	{@render children()}
</svelte:element>

<style>
	.akui-panel {
		position: relative;
		overflow: hidden;
		padding: 1rem;
		transition: var(--akui-transition-theme);
		border: 1px solid var(--akui-panel-border, rgba(0, 0, 0, 0.1));
		backdrop-filter: var(--akui-panel-backdrop, none);
	}

	.akui-panel.radius-regular {
		border-radius: var(--akui-radius-m);
	}

	.akui-panel.radius-full {
		border-radius: 9999px;
	}

	:global([data-theme='dark']) .akui-panel {
		border-color: var(--akui-panel-border, rgba(255, 255, 255, 0.05));
	}

	.akui-panel.regular {
		background-color: var(--akui-panel-bg, var(--akui-bg));
		color: var(--akui-panel-fg, var(--akui-fg));
	}

	.akui-panel.secondary {
		background-color: var(--akui-panel-bg, var(--akui-bg-secondary));
		color: var(--akui-panel-fg, var(--akui-fg-secondary));
	}

	.akui-panel.accent {
		background-color: var(--akui-panel-bg, var(--akui-bg-accent));
		color: var(--akui-panel-fg, var(--akui-fg-accent));
	}
</style>
