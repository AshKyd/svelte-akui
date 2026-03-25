<script lang="ts">
	import { type Snippet } from 'svelte';

	interface Props {
		/** The HTML tag to use for the component. Defaults to 'small'. */
		tag?: 'small' | 'span' | 'p' | 'div';
		/** The content to style as small text. */
		children: Snippet;
		/** Additional CSS classes. */
		class?: string;
		/** Optional colour: 'regular' or 'secondary' (default). */
		colour?: 'regular' | 'secondary';
	}

	let { tag = 'small', children, class: className = '', colour = 'secondary' }: Props = $props();
</script>

<svelte:element this={tag} class="akui-small {colour} {className}">
	{@render children()}
</svelte:element>

<style>
	.akui-small {
		font-size: 0.75rem;
		line-height: 1.4;
		display: inline-block;
		margin: 0; /* Reset margins for tags like 'p' */
	}

	.akui-small.secondary {
		color: var(--akui-fg-secondary);
	}

	.akui-small.regular {
		color: var(--akui-fg);
	}

	/* If it's a block-level tag, ensure it behaves properly */
	p.akui-small,
	div.akui-small {
		display: block;
	}
</style>
