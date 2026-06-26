<script lang="ts">
	import { type Snippet } from 'svelte';
	import Icon from '../../Icon/Icon.svelte';
	import Padding from '../../Padding/Padding.svelte';

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
		/** Whether the checkbox or radio is checked. */
		checked?: boolean;
		/** Optional control type on the right hand side. */
		controlType?: 'checkbox' | 'radio';
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
		checked = $bindable(false),
		controlType,
		...rest
	}: Props = $props();

	function handleContainerClick(event: MouseEvent) {
		if (controlType) {
			checked = !checked;
		}
		if (onclick) {
			onclick(event);
		}
	}
</script>

<li role="none" class="akui-control-item-text-wrapper">
	<button
		type="button"
		{role}
		class="akui-control-item-text {className}"
		class:selected
		onclick={handleContainerClick}
		{...rest}
	>
		<Padding size="m" class="akui-control-item-text-inner">
			<div class="akui-control-item-text-content">
				{#if icon}
					<Icon name={icon} size="1.25em" class="akui-control-item-text-icon" />
				{/if}
				<span class="akui-control-item-text-label">
					{#if children}
						{@render children()}
					{:else}
						{label}
					{/if}
				</span>
				{#if controlType === 'checkbox'}
					<input
						type="checkbox"
						class="akui-control-item-text-input"
						bind:checked
						onclick={(e) => e.stopPropagation()}
					/>
				{:else if controlType === 'radio'}
					<input
						type="radio"
						class="akui-control-item-text-input"
						checked={checked}
						onclick={(e) => e.stopPropagation()}
					/>
				{/if}
			</div>
		</Padding>
	</button>
</li>

<style>
	.akui-control-item-text-wrapper {
		display: block;
		list-style: none;
	}

	.akui-control-item-text {
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

	.akui-control-item-text:hover {
		background-color: var(--akui-bg-hover);
	}

	.akui-control-item-text:active {
		background-color: var(--akui-bg-button-hover);
	}

	.akui-control-item-text:focus-visible {
		background-color: var(--akui-bg-hover);
		box-shadow: inset 0 0 0 2px var(--akui-bg-accent);
	}
	
	.akui-control-item-text.selected {
		background-color: rgba(var(--akui-bg-accent-rgb), 0.1);
		color: var(--akui-bg-accent);
		border-left: 3px solid var(--akui-bg-accent);
	}

	.akui-control-item-text-content {
		display: flex;
		align-items: center;
		gap: var(--akui-space-m);
	}

	.akui-control-item-text-label {
		flex: 1;
		font-size: 0.95rem;
		font-weight: 500;
	}

	:global(.akui-control-item-text-icon) {
		color: var(--akui-fg-secondary);
		transition: color 0.2s ease;
	}

	.akui-control-item-text:hover :global(.akui-control-item-text-icon) {
		color: var(--akui-fg);
	}

	.akui-control-item-text.selected :global(.akui-control-item-text-icon) {
		color: var(--akui-bg-accent);
	}

	.akui-control-item-text-input {
		width: 1.25rem;
		height: 1.25rem;
		accent-color: var(--akui-bg-accent);
		cursor: pointer;
		margin: 0;
	}
</style>
