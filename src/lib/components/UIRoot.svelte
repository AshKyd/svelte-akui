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
	}

	:global(body) {
		background-color: var(--akui-bg);
		color: var(--akui-fg);
		transition: var(--akui-transition-theme);
		margin: 0;
		font-family: sans-serif;
	}
</style>
