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
		/** Whether the item is currently selected/active. */
		selected?: boolean;
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
		selected = false,
		...rest
	}: Props = $props();
</script>

<li role="none" class="akui-control-item-wrapper">
	<button
		type="button"
		{role}
		class="akui-control-item {className}"
		class:selected
		{onclick}
		{...rest}
	>
		<Padding size="m" class="akui-control-item-inner">
			<div class="akui-control-item-content">
				{#if icon}
					<Icon name={icon} size="1.25em" class="akui-control-item-icon" />
				{/if}
				<span class="akui-control-item-label">
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

	.akui-control-item {
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

	.akui-control-item:hover {
		background-color: var(--akui-bg-hover);
	}

	.akui-control-item:active {
		background-color: var(--akui-bg-button-hover);
	}

	.akui-control-item:focus-visible {
		background-color: var(--akui-bg-hover);
		box-shadow: inset 0 0 0 2px var(--akui-bg-accent);
	}
	
	.akui-control-item.selected {
		background-color: rgba(var(--akui-bg-accent-rgb), 0.1);
		color: var(--akui-bg-accent);
		border-left: 3px solid var(--akui-bg-accent);
	}

	.akui-control-item-content {
		display: flex;
		align-items: center;
		gap: var(--akui-space-m);
	}

	.akui-control-item-label {
		flex: 1;
		font-size: 0.95rem;
		font-weight: 500;
	}

	:global(.akui-control-item-icon) {
		color: var(--akui-fg-secondary);
		transition: color 0.2s ease;
	}

	.akui-control-item:hover :global(.akui-control-item-icon) {
		color: var(--akui-fg);
	}

	.akui-control-item.selected :global(.akui-control-item-icon) {
		color: var(--akui-bg-accent);
	}
</style>
