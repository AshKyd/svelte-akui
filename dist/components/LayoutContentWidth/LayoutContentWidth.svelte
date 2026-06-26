<script lang="ts">
	import { type Snippet } from 'svelte';

	interface Props {
		/** The max-width size option. Defaults to 'medium' (680px). */
		size?: 'small' | 'medium' | 'large';
		/** Content to render inside the layout. */
		children?: Snippet;
		/** Additional CSS classes. */
		class?: string;
		/** Spread remaining attributes. */
		[key: string]: unknown;
	}

	let {
		size = 'medium',
		children,
		class: className = '',
		...rest
	}: Props = $props();
</script>

<div class="akui-layout-content-width {size} {className}" {...rest}>
	{#if children}
		{@render children()}
	{/if}
</div>

<style>
	.akui-layout-content-width {
		width: 100%;
		margin: 0 auto;
		box-sizing: border-box;
	}

	.akui-layout-content-width.small {
		max-width: 480px;
	}

	.akui-layout-content-width.medium {
		max-width: 680px;
	}

	.akui-layout-content-width.large {
		max-width: 960px;
	}
</style>
