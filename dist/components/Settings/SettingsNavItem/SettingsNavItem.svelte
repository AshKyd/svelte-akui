<script lang="ts">
	import Icon from '../../Icon/Icon.svelte';

	interface Props {
		/** Text shown for the item. */
		label: string;
		/** Optional icon name (Bootstrap Icon). */
		icon?: string;
		/** Whether this is the active tab. */
		selected?: boolean;
		/** Called when the item is pressed. */
		onclick?: (event: MouseEvent) => void;
		/** Additional CSS classes. */
		class?: string;
		/** Spread remaining attributes. */
		[key: string]: unknown;
	}

	let { label, icon, selected = false, onclick, class: className = '', ...rest }: Props = $props();
</script>

<!-- Slim, outline-free tab for a vertical column of settings sections (desktop). -->
<button
	type="button"
	role="tab"
	aria-selected={selected}
	tabindex={selected ? 0 : -1}
	class="akui-settings-nav-item {className}"
	class:selected
	{onclick}
	{...rest}
>
	{#if icon}
		<Icon name={icon} size="1.1em" class="akui-settings-nav-icon" />
	{/if}
	<span class="akui-settings-nav-label">{label}</span>
</button>

<style>
	.akui-settings-nav-item {
		display: flex;
		align-items: center;
		gap: var(--akui-space-s);
		width: 100%;
		appearance: none;
		background: transparent;
		border: none;
		border-left: 3px solid transparent;
		border-radius: 0 var(--akui-radius-m) var(--akui-radius-m) 0;
		padding: var(--akui-space-s) var(--akui-space-m);
		margin: 0;
		color: var(--akui-fg);
		font: inherit;
		font-size: 0.95rem;
		font-weight: 500;
		text-align: left;
		cursor: pointer;
		outline: none;
		transition:
			background-color 0.2s ease,
			color 0.2s ease;
	}

	.akui-settings-nav-item:hover {
		background-color: var(--akui-bg-hover);
	}

	.akui-settings-nav-item:focus-visible {
		box-shadow: inset 0 0 0 2px var(--akui-bg-accent);
	}

	.akui-settings-nav-item.selected {
		background-color: rgba(var(--akui-bg-accent-rgb), 0.1);
		color: var(--akui-bg-accent);
		border-left-color: var(--akui-bg-accent);
	}

	.akui-settings-nav-label {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	:global(.akui-settings-nav-icon) {
		color: var(--akui-fg-secondary);
	}

	.akui-settings-nav-item.selected :global(.akui-settings-nav-icon) {
		color: var(--akui-bg-accent);
	}
</style>
