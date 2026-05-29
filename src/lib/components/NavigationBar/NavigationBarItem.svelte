<script lang="ts">
	import Icon from '../Icon/Icon.svelte';

	interface Props {
		/** Text label for the item. */
		label: string;
		/** Icon name to display. */
		icon: string;
		/** Active state. */
		active?: boolean;
		/** Optional href to render the item as an anchor link. */
		href?: string;
		/** Click handler. */
		onclick?: (event: MouseEvent) => void;
		/** Additional CSS classes. */
		class?: string;
	}

	let {
		label,
		icon,
		active = false,
		href,
		onclick,
		class: className = ''
	}: Props = $props();
</script>

{#snippet content()}
	<div class="akui-nav-bar-item-indicator">
		<Icon name={icon} />
	</div>
	<span class="akui-nav-bar-item-label">{label}</span>
{/snippet}

{#if href}
	<a
		{href}
		class="akui-nav-bar-item {className}"
		class:active
		aria-current={active ? 'page' : undefined}
		{onclick}
	>
		{@render content()}
	</a>
{:else}
	<button
		type="button"
		class="akui-nav-bar-item {className}"
		class:active
		aria-pressed={active}
		{onclick}
	>
		{@render content()}
	</button>
{/if}

<style>
	.akui-nav-bar-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 4px;
		background: transparent;
		border: none;
		color: var(--akui-fg-secondary, #666);
		cursor: pointer;
		font-family: inherit;
		box-sizing: border-box;
		text-decoration: none;
		transition: color 0.25s ease, background-color 0.25s ease;
		padding: var(--akui-space-xs);
		outline: none;
	}

	.akui-nav-bar-item:focus-visible {
		background-color: rgba(0, 0, 0, 0.05);
	}

	:global([data-theme='dark']) .akui-nav-bar-item:focus-visible {
		background-color: rgba(255, 255, 255, 0.05);
	}

	/* Active Indicator Pill styling */
	.akui-nav-bar-item-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 4rem; /* pill width */
		height: 2rem; /* pill height */
		border-radius: 100vw;
		background-color: transparent;
		transition: background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), color 0.25s ease;
		color: var(--akui-fg-secondary);
	}

	:global(.akui-nav-bar-item-indicator .akui-icon) {
		transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	/* Scale up active indicator on hover slightly */
	.akui-nav-bar-item:hover .akui-nav-bar-item-indicator {
		background-color: var(--akui-bg-hover);
		color: var(--akui-fg);
	}

	/* Active State classes */
	.akui-nav-bar-item.active {
		color: var(--akui-bg-accent);
	}

	.akui-nav-bar-item.active .akui-nav-bar-item-indicator {
		background-color: rgba(var(--akui-bg-accent-rgb), 0.12);
		color: var(--akui-bg-accent);
		transform: scale(1.05);
	}

	.akui-nav-bar-item.active :global(.akui-icon) {
		transform: scale(1.15);
	}

	.akui-nav-bar-item-label {
		font-size: 0.75rem;
		font-weight: 500;
		line-height: 1.25;
		text-align: center;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		width: 100%;
		transition: font-weight 0.2s ease;
	}

	.akui-nav-bar-item.active .akui-nav-bar-item-label {
		font-weight: 600;
	}
</style>
