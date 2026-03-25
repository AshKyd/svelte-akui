<script lang="ts">
	import { type Snippet } from 'svelte';
	import '../theme/theme.css';

	interface Props {
		/** Optional theme mode override ('light' or 'dark'). If not provided, follows system preference. */
		mode?: 'light' | 'dark';
		/** The content to render inside the UI root. */
		children: Snippet;
	}

	let { mode, children }: Props = $props();

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

	const currentTheme = $derived(mode ?? systemMode);
</script>

<div class="akui-root" data-theme={currentTheme}>
	{@render children()}
</div>

<style>
	.akui-root {
		display: contents;
		isolation: isolate;
	}

	:global(body) {
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

		/* 2. Remove default margin */
		*:not(dialog) {
			margin: 0;
		}

		/* 3. Enable keyword animations */
		@media (prefers-reduced-motion: no-preference) {
			html {
				interpolate-size: allow-keywords;
			}
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
