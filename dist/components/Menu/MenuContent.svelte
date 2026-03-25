<script lang="ts">
	import { type Snippet } from 'svelte';
	import { ControlContent } from '../Control/index.js';

	interface Props {
		/** The custom content to render. */
		children: Snippet;
		/** Padding size. Defaults to 'm'. */
		size?: 'none' | 's' | 'm' | 'l';
		/** Additional CSS classes. */
		class?: string;
		/** Spread remaining attributes. */
		[key: string]: unknown;
	}

	let { children, size = 'm', class: className = '', ...rest }: Props = $props();
</script>

<ControlContent {size} class={className} {...rest} {children} />
