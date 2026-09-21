<script lang="ts">
	import { type Snippet, setContext } from 'svelte';
	import '../theme/theme.css';
	import { reducedMotion } from '../hooks/reducedMotion.svelte.js';

	interface Props {
		/** The user-configured theme preference ('light', 'dark', or undefined/null for system preference). */
		mode?: 'light' | 'dark' | undefined;
		/** The currently active theme mode ('light' or 'dark') resolved based on preference and system settings. */
		resolvedMode?: 'light' | 'dark';
		/** The content to render inside the UI root. */
		children: Snippet;
	}

	let {
		mode = $bindable(),
		resolvedMode = $bindable('light'),
		children
	}: Props = $props();

	let systemMode = $state<'light' | 'dark'>('light');

	// Only track system preference if mode is not explicitly provided
	$effect(() => {
		if (mode || typeof window === 'undefined') return;

		const mql = window.matchMedia('(prefers-color-scheme: dark)');
		systemMode = mql.matches ? 'dark' : 'light';

		const handler = (e: MediaQueryListEvent) => {
			systemMode = e.matches ? 'dark' : 'light';
		};

		mql.addEventListener('change', handler);
		return () => mql.removeEventListener('change', handler);
	});

	const currentTheme = $derived.by(() => mode ?? systemMode);

	$effect(() => {
		resolvedMode = currentTheme;
	});

	// CSS can't see the user override, only the OS setting, so the effective reduced-motion value is
	// published on <html> as `data-reduced-motion`. Component styles key off that attribute instead
	// of `@media (prefers-reduced-motion)`, so the settings toggle works in both directions.
	$effect(() => {
		document.documentElement.dataset.reducedMotion = String(reducedMotion.value);
	});

	setContext('akui-theme', {
		get current() {
			return currentTheme;
		}
	});
</script>

<div class="akui-root" data-theme={currentTheme}>
	{@render children()}
</div>

<style>
	.akui-root {
		isolation: isolate;
		background-color: var(--akui-bg);
		color: var(--akui-fg);
		transition: var(--akui-transition-theme);
		margin: 0;
		font-family: sans-serif;
	}

	:global {
		/* 1. Use a more-intuitive box-sizing model */
		*,
		*::before,
		*::after {
			box-sizing: border-box;
		}

		/* Disable double-tap-to-zoom to eliminate click delay on mobile */
		html,
		body,
		button,
		a,
		[role="button"],
		input,
		select,
		textarea {
			touch-action: manipulation;
		}

		/* 2. Remove default margin */
		*:not(dialog) {
			margin: 0;
		}

		/* 3. Enable keyword animations */
		html:not([data-reduced-motion='true']) {
			interpolate-size: allow-keywords;
		}

		/*
		 * Reduced motion, from the `reducedMotion` store (the settings toggle, defaulting to the OS
		 * setting). Stops every CSS transition and keyframe animation, including inline `style`
		 * transitions such as Draggable's settle and Masonry's reflow, which `!important` overrides.
		 * Durations are near zero rather than `none` so `transitionend`/`animationend` still fire.
		 * Svelte `transition:` directives aren't CSS — they use `motion()` from the same store.
		 */
		html[data-reduced-motion='true'] *,
		html[data-reduced-motion='true'] *::before,
		html[data-reduced-motion='true'] *::after {
			animation-duration: 0.01ms !important;
			animation-iteration-count: 1 !important;
			transition-duration: 0.01ms !important;
			transition-delay: 0s !important;
			scroll-behavior: auto !important;
		}

		body {
			/* 4. Increase line-height */
			line-height: 1.5;
			/* 5. Improve text rendering */
			-webkit-font-smoothing: antialiased;
		}

		/* 6. Improve media defaults */
		img,
		picture,
		video,
		canvas,
		svg {
			display: block;
			max-width: 100%;
		}

		/* 7. Inherit fonts for form controls */
		input,
		button,
		textarea,
		select {
			font: inherit;
		}

		/* 8. Avoid text overflows */
		p,
		h1,
		h2,
		h3,
		h4,
		h5,
		h6 {
			overflow-wrap: break-word;
		}

		/* 9. Improve line wrapping */
		p {
			text-wrap: pretty;
		}
		h1,
		h2,
		h3,
		h4,
		h5,
		h6 {
			text-wrap: balance;
		}
	}
</style>
