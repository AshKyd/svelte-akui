<script lang="ts">
	import Icon from '../../Icon/Icon.svelte';

	interface Props {
		/** Text shown for the item. */
		label: string;
		/** Optional icon name (Bootstrap Icon). */
		icon?: string;
		/** Whether this is the active tab. */
		selected?: boolean;
		/** Row size, matching `Tree`. Defaults to 'small'. */
		size?: 'small' | 'large';
		/** Called when the item is pressed. */
		onclick?: (event: MouseEvent) => void;
		/** Additional CSS classes. */
		class?: string;
		/** Spread remaining attributes. */
		[key: string]: unknown;
	}

	let {
		label,
		icon,
		selected = false,
		size = 'small',
		onclick,
		class: className = '',
		...rest
	}: Props = $props();
</script>

<!-- Slim, outline-free tab for a vertical column of settings sections (desktop). Row metrics match `Tree`. -->
<button
	type="button"
	role="tab"
	aria-selected={selected}
	tabindex={selected ? 0 : -1}
	class={['akui-settings-nav-item', size === 'large' && 'large', selected && 'selected', className]}
	{onclick}
	{...rest}
>
	{#if icon}
		<span class="akui-settings-nav-icon">
			<Icon name={icon} size={size === 'large' ? 20 : 14} />
		</span>
	{/if}
	<span class="akui-settings-nav-label">{label}</span>
</button>

<style>
	.akui-settings-nav-item {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		appearance: none;
		background: transparent;
		border: none;
		border-radius: var(--akui-radius-s);
		padding: 4px 8px;
		margin: 0;
		color: var(--akui-fg);
		font: inherit;
		text-align: left;
		cursor: pointer;
		user-select: none;
		outline: none;
		transition: background-color 0.15s ease;
	}

	.akui-settings-nav-item.large {
		padding: 10px 16px;
		gap: var(--akui-space-m);
	}

	.akui-settings-nav-item:hover {
		background-color: var(--akui-bg-hover);
	}

	.akui-settings-nav-item:focus-visible {
		box-shadow: 0 0 0 2px var(--akui-bg-accent);
		background-color: var(--akui-bg-hover);
	}

	.akui-settings-nav-item.selected {
		background-color: color-mix(in oklch, var(--akui-bg-accent) 10%, transparent);
		color: var(--akui-bg-accent);
	}

	.akui-settings-nav-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 16px;
		height: 16px;
		color: var(--akui-fg-secondary);
	}

	.akui-settings-nav-item.large .akui-settings-nav-icon {
		width: 24px;
		height: 24px;
	}

	.akui-settings-nav-item.selected .akui-settings-nav-icon {
		color: var(--akui-bg-accent);
	}

	.akui-settings-nav-label {
		flex: 1;
		min-width: 0;
		font-size: 0.875rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.akui-settings-nav-item.large .akui-settings-nav-label {
		font-size: 0.95rem;
		font-weight: 500;
	}
</style>
