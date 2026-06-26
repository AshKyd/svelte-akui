<script lang="ts">
	import { type Snippet } from 'svelte';

	interface Props {
		/** The control items (buttons, dividers, content). */
		children: Snippet;
		/** ARIA role. Defaults to 'menu' if used in a menu. */
		role?: string;
		/** Additional CSS classes. */
		class?: string;
		/** Whether to render a panel-like border around the group. Defaults to true. */
		border?: boolean;
		/** Spread remaining attributes. */
		[key: string]: unknown;
	}

	let { children, role = 'menu', class: className = '', border = true, ...rest }: Props = $props();
</script>

<ul {role} class="akui-control-group {className}" class:has-border={border} {...rest}>
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

	.akui-control-group.has-border {
		border: 1px solid var(--akui-border-input, #d1d5db);
		border-radius: var(--akui-radius-m);
		overflow: hidden;
	}

	/* Automatic dividers between interactive items or content */
	.akui-control-group :global(.akui-control-item-text-wrapper:not(:last-child)),
	.akui-control-group :global(.akui-control-item-expanded-wrapper:not(:last-child)) {
		border-bottom: 1px solid var(--akui-border-input, #d1d5db);
	}
</style>
