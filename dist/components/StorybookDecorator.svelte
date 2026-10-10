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
		/** Sets `--akui-alpha-surface` (0 to 1) so components using the `-surface` tokens turn translucent. Opaque when unset. */
		surfaceAlpha?: number;
	}

	let { children, mode, themes, surfaceAlpha }: Props = $props();
</script>

<!-- display: contents lets the alpha custom property inherit into UIRoot without adding a box. -->
<div style="display: contents;{surfaceAlpha === undefined ? '' : ` --akui-alpha-surface: ${surfaceAlpha};`}">
	<UIRoot {mode} {themes}>
		{@render children()}
	</UIRoot>
</div>
