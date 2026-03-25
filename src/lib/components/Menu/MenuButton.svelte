<script lang="ts">
	import { type Snippet } from 'svelte';
	import Icon from '../Icon/Icon.svelte';
	import Padding from '../Padding/Padding.svelte';

	interface Props {
		/** Optional icon name (Bootstrap Icon). */
		icon?: string;
		/** The text or content to display. */
		label?: string;
		/** Optional onclick handler. */
		onclick?: (event: MouseEvent) => void;
		/** Snippet for custom content (overrides label). */
		children?: Snippet;
		/** Additional CSS classes. */
		class?: string;
		/** Spread remaining attributes. */
		[key: string]: unknown;
	}

	let { icon, label, onclick, children, class: className = '', ...rest }: Props = $props();
</script>

<button type="button" class="akui-menu-button {className}" {onclick} {...rest}>
	<Padding size="m" class="akui-menu-button-inner">
		<div class="akui-menu-button-content">
			{#if icon}
				<Icon name={icon} size="1.25em" class="akui-menu-button-icon" />
			{/if}
			<span class="akui-menu-button-label">
				{#if children}
					{@render children()}
				{:else}
					{label}
				{/if}
			</span>
		</div>
	</Padding>
</button>

<style>
	.akui-menu-button {
		display: block;
		width: 100%;
		appearance: none;
		background: transparent;
		border: none;
		padding: 0;
		margin: 0;
		color: var(--akui-fg);
		text-align: left;
		cursor: pointer;
		transition:
			background-color 0.2s ease,
			color 0.2s ease;
		outline: none;
	}

	.akui-menu-button:hover {
		background-color: var(--akui-bg-secondary);
	}

	.akui-menu-button:active {
		background-color: var(--akui-bg-button-hover);
	}

	.akui-menu-button:focus-visible {
		background-color: var(--akui-bg-secondary);
		box-shadow: inset 0 0 0 2px var(--akui-bg-accent);
	}

	.akui-menu-button-content {
		display: flex;
		align-items: center;
		gap: var(--akui-space-m);
	}

	.akui-menu-button-label {
		flex: 1;
		font-size: 0.95rem;
		font-weight: 500;
	}

	:global(.akui-menu-button-icon) {
		color: var(--akui-fg-secondary);
		transition: color 0.2s ease;
	}

	.akui-menu-button:hover :global(.akui-menu-button-icon) {
		color: var(--akui-fg);
	}
</style>
