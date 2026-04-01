<script lang="ts">
	import { type Snippet } from 'svelte';
	import UIRoot from './UIRoot.svelte';

	interface Props {
		/** The child component (the story). */
		children: Snippet;
		/** Optional theme mode override ('light' or 'dark'). */
		mode?: 'light' | 'dark';
	}

	let { children, mode }: Props = $props();
</script>

<UIRoot {mode}>
	{@render children()}
</UIRoot>
