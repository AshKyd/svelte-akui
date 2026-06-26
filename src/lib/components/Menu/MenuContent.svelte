<script lang="ts">
	import { type Snippet } from 'svelte';
	import Padding from '../Padding/Padding.svelte';

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

<li role="none" class="akui-menu-content {className}">
	<Padding {size} {...rest}>
		{@render children()}
	</Padding>
</li>

<style>
	.akui-menu-content {
		display: block;
		list-style: none;
	}
</style>
