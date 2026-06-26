<script lang="ts">
	import { type Snippet } from 'svelte';

	interface Props {
		/** The max-width size option. Defaults to 'medium' (680px). */
		size?: 'small' | 'medium' | 'large';
		/** Content to render inside the column. */
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

<div class="akui-layout-readable-width-column {size} {className}" {...rest}>
	{#if children}
		{@render children()}
	{/if}
</div>

<style>
	.akui-layout-readable-width-column {
		width: 100%;
		margin: 0 auto;
		box-sizing: border-box;
		padding: 0 var(--akui-space-m, 1rem);
	}

	.akui-layout-readable-width-column.small {
		max-width: 480px;
	}

	.akui-layout-readable-width-column.medium {
		max-width: 680px;
	}

	.akui-layout-readable-width-column.large {
		max-width: 960px;
	}
</style>
