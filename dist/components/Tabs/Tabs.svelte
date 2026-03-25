<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * Represents a single tab item.
	 */
	export interface TabItem {
		/** Unique identifier for the tab. */
		id: string;
		/** Human-readable label for the tab. */
		label: string;
		/** Optional content to render when the tab is active. */
		content?: Snippet;
	}

	/**
	 * Props for the Tabs component.
	 */
	export interface Props {
		/** Array of tab items. */
		items: TabItem[];
		/** Currently active tab ID. Bindable. */
		activeId?: string;
		/** Additional CSS classes for the container. */
		class?: string;
		/** Inline styles for the container. */
		style?: string;
		/** Spread remaining attributes to the container. */
		[key: string]: unknown;
	}

	let {
		items = [],
		activeId = $bindable(),
		class: className = '',
		style = '',
		...rest
	}: Props = $props();

	// Set default active tab if none provided
	$effect(() => {
		if (!activeId && items.length > 0) {
			activeId = items[0].id;
		}
	});

	const activeItem = $derived(items.find((i) => i.id === activeId));
	const hasContent = $derived(items.some((i) => i.content));
</script>

<div class="akui-tabs {className}" {style} {...rest}>
	<div class="akui-tabs-list" role="tablist">
		{#each items as item (item.id)}
			<button
				type="button"
				role="tab"
				aria-selected={activeId === item.id}
				aria-controls={hasContent ? `${item.id}-panel` : undefined}
				id={`${item.id}-tab`}
				class="akui-tab"
				class:active={activeId === item.id}
				onclick={() => (activeId = item.id)}
			>
				{item.label}
			</button>
		{/each}
		<div class="akui-tabs-filler"></div>
	</div>

	{#if hasContent}
		<div
			class="akui-tabs-content"
			role="tabpanel"
			id={`${activeId}-panel`}
			aria-labelledby={`${activeId}-tab`}
		>
			{#if activeItem?.content}
				{@render activeItem.content()}
			{/if}
		</div>
	{:else}
		<div class="akui-tabs-border-line"></div>
	{/if}
</div>

<style>
	.akui-tabs {
		display: flex;
		flex-direction: column;
		width: 100%;
	}

	.akui-tabs-list {
		display: flex;
		align-items: flex-end;
		padding: 0 0.5rem 0 0;
		gap: 0.125rem;
		position: relative;
		z-index: 2;
		min-height: 2.25rem;
	}

	@media (min-width: 768px) {
		.akui-tabs-list,
		.akui-tab {
			min-height: 2rem;
		}
	}

	.akui-tab {
		appearance: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: var(--akui-bg-secondary);
		border: 1px solid var(--akui-border-input);
		border-bottom: none;
		border-radius: var(--akui-radius-m) var(--akui-radius-m) 0 0;
		padding: 0 1rem;
		min-width: 5rem;
		min-height: 2.25rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--akui-fg-secondary);
		cursor: pointer;
		transition: all 0.2s ease;
		position: relative;
		z-index: 2;
		margin-bottom: 0;
	}

	.akui-tab:hover:not(.active) {
		background: var(--akui-bg-tertiary, var(--akui-bg-hover));
		color: var(--akui-fg);
	}

	.akui-tab.active {
		background: var(--akui-bg);
		color: var(--akui-fg);
		border-color: var(--akui-border-input);
		z-index: 4;
		height: calc(100% + 1px);
		/* The shadow helps it feel "raised" */
		box-shadow: var(--akui-glow-top);
	}

	/* Use a pseudo-element to mask the bottom border correctly */
	.akui-tab.active::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: -1px;
		height: 2px;
		background: var(--akui-bg);
		z-index: 5;
	}

	/* The filler provides the rest of the bottom border for the tab list */
	.akui-tabs-filler {
		flex: 1;
		border-bottom: 1px solid var(--akui-border-input);
		height: 1px;
		align-self: flex-end;
		margin-left: -0.125rem;
	}

	.akui-tabs-content {
		border: 1px solid var(--akui-border-input);
		border-radius: 0 var(--akui-radius-m) var(--akui-radius-m) var(--akui-radius-m);
		padding: 1.5rem;
		background-color: var(--akui-bg);
		position: relative;
		z-index: 1;
		margin-top: -1px; /* Seamless integration with tabs */
		box-shadow: var(--akui-shadow-shiny);
	}

	.akui-tabs-border-line {
		border-bottom: 1px solid var(--akui-border-input);
		width: 100%;
		margin-top: -1px;
	}
</style>
