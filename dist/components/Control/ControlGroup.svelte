<script lang="ts">
	import { type Snippet } from 'svelte';

	interface Props {
		/** The control items (buttons, dividers, content). */
		children: Snippet;
		/** ARIA role. Defaults to 'menu' if used in a menu. */
		role?: string;
		/** Additional CSS classes. */
		class?: string;
		/** Spread remaining attributes. */
		[key: string]: unknown;
	}

	let { children, role = 'menu', class: className = '', ...rest }: Props = $props();
</script>

<ul {role} class="akui-control-group {className}" {...rest}>
	{@render children()}
</ul>

<style>
	.akui-control-group {
		display: flex;
		flex-direction: column;
		width: 100%;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	/* Automatic dividers between interactive items or content */
	.akui-control-group :global(.akui-control-item-wrapper:not(:last-child)),
	.akui-control-group :global(.akui-control-content:not(:last-child)) {
		border-bottom: 1px solid var(--akui-border-input, #d1d5db);
	}
</style>
