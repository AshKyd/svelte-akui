<script lang="ts">
	import { type Snippet } from 'svelte';
	import { slide } from 'svelte/transition';
	import Icon from '../Icon/Icon.svelte';

	export interface TreeItemData {
		id: string;
		label: string;
		icon?: string;
		status?: string;
		children?: TreeItemData[];
		isFolder?: boolean;
		[key: string]: any;
	}

	interface Props {
		item: TreeItemData;
		depth?: number;
		expanded?: Set<string>;
		onToggle?: (id: string) => void;
		onSelect?: (item: TreeItemData) => void;
		/** Optional snippet to override icon rendering */
		iconSnippet?: Snippet<[{ item: TreeItemData }]>;
	}

	let {
		item,
		depth = 0,
		expanded = new Set(),
		onToggle,
		onSelect,
		iconSnippet
	}: Props = $props();

	const isExpanded = $derived(expanded.has(item.id));
	const hasChildren = $derived(item.children && item.children.length > 0);
	const isFolder = $derived(item.isFolder || hasChildren);

	function handleToggle(e: MouseEvent | KeyboardEvent) {
		e.stopPropagation();
		if (isFolder) {
			onToggle?.(item.id);
		}
	}

	function handleSelect(e: MouseEvent | KeyboardEvent) {
		e.stopPropagation();
		onSelect?.(item);
	}
</script>

<li
	role="treeitem"
	aria-expanded={isFolder ? isExpanded : undefined}
	aria-selected={undefined}
	class="akui-tree-item-container"
	data-id={item.id}
>
	<div
		class="akui-tree-item-row"
		style="--depth: {depth}"
		onclick={handleSelect}
		tabindex="0"
	>
		<!-- Icon Column / Chevron -->
		<div class="akui-tree-item-icon">
			{#if isFolder}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div 
					class="akui-tree-chevron" 
					class:expanded={isExpanded}
					onclick={handleToggle}
				>
					<Icon name="chevron-right" size={14} />
				</div>
			{:else if iconSnippet}
				{@render iconSnippet({ item })}
			{:else if item.icon}
				<Icon name={item.icon} size={14} />
			{/if}
		</div>

		<!-- Label -->
		<span class="akui-tree-item-label">
			{item.label}
		</span>

		<!-- Status -->
		{#if item.status !== undefined}
			<span class="akui-tree-item-status">
				{item.status}
			</span>
		{/if}
	</div>

	{#if isFolder && isExpanded && hasChildren}
		<ul role="group" class="akui-tree-group" transition:slide={{ duration: 200 }}>
			{#each item.children || [] as child}
				<svelte:self
					item={child}
					depth={depth + 1}
					{expanded}
					{onToggle}
					{onSelect}
					{iconSnippet}
				/>
			{/each}
		</ul>
	{/if}
</li>

<style>
	.akui-tree-item-container {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.akui-tree-item-row {
		display: flex;
		align-items: center;
		padding: 4px 8px;
		margin-left: calc(var(--depth) * 24px); /* Use margin instead of padding */
		cursor: default;
		user-select: none;
		border-radius: var(--akui-radius-s);
		transition: background-color 0.15s ease;
		outline: none;
		gap: 8px;
	}

	.akui-tree-item-row:hover {
		background-color: var(--akui-bg-hover);
	}

	.akui-tree-item-row:focus-visible {
		box-shadow: 0 0 0 2px var(--akui-bg-accent);
		background-color: var(--akui-bg-hover);
	}

	.akui-tree-item-icon {
		width: 16px;
		height: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.akui-tree-chevron {
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--akui-fg-secondary);
		cursor: pointer;
		width: 20px;
		height: 20px;
		margin: -2px;
		border-radius: var(--akui-radius-s);
	}

	.akui-tree-chevron:hover {
		background-color: rgba(255, 255, 255, 0.1);
		color: var(--akui-fg);
	}

	.akui-tree-chevron.expanded {
		transform: rotate(90deg);
	}

	.akui-tree-item-label {
		flex: 1;
		font-size: 0.875rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		color: var(--akui-fg);
	}

	.akui-tree-item-status {
		font-size: 0.75rem;
		color: var(--akui-fg-secondary);
		margin-left: 8px;
	}

	.akui-tree-group {
		margin: 0;
		padding: 0;
		list-style: none;
	}
</style>
