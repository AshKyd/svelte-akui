<script lang="ts">
	import { type Snippet } from 'svelte';
	import UIRoot from './UIRoot.svelte';

	interface Props {
		/** The child component (the story). */
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<UIRoot>
	{@render children()}
</UIRoot>
