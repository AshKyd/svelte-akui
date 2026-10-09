<script lang="ts">
	import { type Snippet } from 'svelte';
	import UIRoot from './UIRoot.svelte';
	import type { AkuiTheme } from '../hooks/themeStore.svelte.js';

	interface Props {
		/** The child component (the story). */
		children: Snippet;
		/** Optional theme mode override ('light' or 'dark'). */
		mode?: 'light' | 'dark';
		/** Custom themes for the story's `UIRoot`, set via the story parameter `akuiThemes`. */
		themes?: AkuiTheme[];
	}

	let { children, mode, themes }: Props = $props();
</script>

<UIRoot {mode} {themes}>
	{@render children()}
</UIRoot>
