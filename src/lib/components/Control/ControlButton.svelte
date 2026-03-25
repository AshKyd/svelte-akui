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
		/** ARIA role. Defaults to 'menuitem' if inside a menu. */
		role?: string;
		/** Additional CSS classes. */
		class?: string;
		/** Spread remaining attributes. */
		[key: string]: unknown;
	}

	let {
		icon,
		label,
		onclick,
		children,
		role = 'menuitem',
		class: className = '',
		...rest
	}: Props = $props();
</script>

<li role="none" class="akui-control-item-wrapper">
	<button type="button" {role} class="akui-control-button {className}" {onclick} {...rest}>
		<Padding size="m" class="akui-control-button-inner">
			<div class="akui-control-button-content">
				{#if icon}
					<Icon name={icon} size="1.25em" class="akui-control-button-icon" />
				{/if}
				<span class="akui-control-button-label">
					{#if children}
						{@render children()}
					{:else}
						{label}
					{/if}
				</span>
			</div>
		</Padding>
	</button>
</li>

<style>
	.akui-control-item-wrapper {
		display: block;
		list-style: none;
	}

	.akui-control-button {
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

	.akui-control-button:hover {
		background-color: var(--akui-bg-secondary);
	}

	.akui-control-button:active {
		background-color: var(--akui-bg-button-hover);
	}

	.akui-control-button:focus-visible {
		background-color: var(--akui-bg-secondary);
		box-shadow: inset 0 0 0 2px var(--akui-bg-accent);
	}

	.akui-control-button-content {
		display: flex;
		align-items: center;
		gap: var(--akui-space-m);
	}

	.akui-control-button-label {
		flex: 1;
		font-size: 0.95rem;
		font-weight: 500;
	}

	:global(.akui-control-button-icon) {
		color: var(--akui-fg-secondary);
		transition: color 0.2s ease;
	}

	.akui-control-button:hover :global(.akui-control-button-icon) {
		color: var(--akui-fg);
	}
</style>
