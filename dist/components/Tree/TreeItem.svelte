<script lang="ts">
	import { type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { slide } from 'svelte/transition';
	import { motion } from '../../hooks/reducedMotion.svelte.js';
	import Icon from '../Icon/Icon.svelte';
	import TreeItem from './TreeItem.svelte';
	import { getTreeReorder } from './treeReorder.svelte';

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
		/** The array `item` belongs to (its parent's children, or the tree's items). Needed to reorder. */
		siblings?: TreeItemData[];
		depth?: number;
		parentId?: string;
		expanded?: Set<string>;
		size?: 'small' | 'large';
		onToggle?: (id: string) => void;
		onSelect?: (item: TreeItemData) => void;
		/** Optional snippet to override icon rendering */
		iconSnippet?: Snippet<[TreeItemData]>;
		/** Extra attributes spread onto the row element. See `Tree`. */
		itemAttributes?: (item: TreeItemData) => HTMLAttributes<HTMLDivElement> | undefined;
	}

	let {
		item,
		siblings = [],
		depth = 0,
		parentId,
		expanded = new Set(),
		size = 'small',
		onToggle,
		onSelect,
		iconSnippet,
		itemAttributes
	}: Props = $props();

	const isExpanded = $derived(expanded.has(item.id));
	const hasChildren = $derived(item.children && item.children.length > 0);
	const isFolder = $derived(item.isFolder || hasChildren);
	const extra = $derived(itemAttributes?.(item));

	const reorder = getTreeReorder();
	const canReorder = $derived(Boolean(reorder?.canReorder(item)));
	/** Set while another item in this list is being dragged, or this one is. */
	const drag = $derived(reorder?.transformFor(item, siblings));

	function startReorder(event: PointerEvent) {
		const row = (event.currentTarget as HTMLElement).closest<HTMLElement>('.akui-tree-item-row');
		// Primary button or touch only.
		if (!row || event.button > 0) return;
		reorder?.start({ item, siblings, row, event });
	}

	/**
	 * Keyboard reorder: with the handle focused, Up and Down move the item one place. Every key
	 * stops here, or Enter and Space would also reach the row and select it.
	 */
	function handleHandleKeyDown(e: KeyboardEvent) {
		e.stopPropagation();
		if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
		e.preventDefault();
		const row = (e.currentTarget as HTMLElement).closest<HTMLElement>('.akui-tree-item-row');
		if (!row) return;
		reorder?.moveBy({ item, siblings, row, delta: e.key === 'ArrowUp' ? -1 : 1 });
	}

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

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleSelect(e);
		}
	}

	function handleChevronKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.stopPropagation();
			e.preventDefault();
			handleToggle(e as unknown as MouseEvent);
		}
	}
</script>

<li
	role="treeitem"
	aria-expanded={isFolder ? isExpanded : undefined}
	aria-selected={undefined}
	class={[
		'akui-tree-item-container',
		drag?.role === 'dragged' && 'akui-tree-item-dragging',
		drag?.role === 'shifting' && 'akui-tree-item-shifting'
	]}
	style:transform={drag ? `translateY(${drag.y}px)` : undefined}
	data-id={item.id}
>
	<div
		{...extra}
		class={['akui-tree-item-row', size === 'large' && 'large', extra?.class]}
		style="--depth: {depth}"
		onclick={handleSelect}
		onkeydown={handleKeyDown}
		role="button"
		tabindex="0"
	>
		<!-- Drag handle: sits in the row's left padding so the icon doesn't shift. -->
		{#if canReorder}
			<span
				class="akui-tree-handle"
				role="button"
				tabindex="0"
				aria-label="Reorder {item.label}. Up and down arrows move it."
				onpointerdown={startReorder}
				onkeydown={handleHandleKeyDown}
				onclick={(e) => e.stopPropagation()}
			>
				<svg viewBox="0 0 10 16" width="8" height="13" aria-hidden="true" fill="currentColor">
					<circle cx="3" cy="3" r="1.3" /><circle cx="7" cy="3" r="1.3" />
					<circle cx="3" cy="8" r="1.3" /><circle cx="7" cy="8" r="1.3" />
					<circle cx="3" cy="13" r="1.3" /><circle cx="7" cy="13" r="1.3" />
				</svg>
			</span>
		{/if}

		<!-- Icon Column / Chevron -->
		<div class="akui-tree-item-icon">
			{#if isFolder}
				<button
					type="button"
					class="akui-tree-chevron"
					class:expanded={isExpanded}
					onclick={handleToggle}
					onkeydown={handleChevronKeyDown}
					aria-label={isExpanded ? 'Collapse' : 'Expand'}
				>
					<Icon name="chevron-right" size={size === 'large' ? 18 : 14} />
				</button>
			{:else if iconSnippet}
				{@render iconSnippet(item)}
			{:else if item.icon}
				<Icon name={item.icon} size={size === 'large' ? 20 : 14} />
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
		<ul role="group" class="akui-tree-group" transition:slide={motion({ duration: 200 })}>
			{#each item.children || [] as child (child.id)}
				<TreeItem
					item={child}
					siblings={item.children}
					depth={depth + 1}
					parentId={item.id}
					{expanded}
					{size}
					{onToggle}
					{onSelect}
					{iconSnippet}
					{itemAttributes}
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

	/* Drag to reorder (see treeReorder.svelte.ts): the dragged item follows the pointer, passed siblings slide aside. */
	.akui-tree-item-dragging {
		position: relative;
		z-index: 1;
		cursor: grabbing;
		background: var(--akui-bg);
		border-radius: var(--akui-radius-s);
		box-shadow: 0 2px 8px rgb(0 0 0 / 0.2);
	}

	.akui-tree-item-shifting {
		transition: transform 150ms ease;
	}

	.akui-tree-handle {
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		display: flex;
		align-items: center;
		width: 10px;
		justify-content: center;
		color: var(--akui-fg-placeholder, var(--akui-fg-secondary));
		cursor: grab;
		touch-action: none;
		user-select: none;
		opacity: 0;
		transition: opacity 120ms ease;
	}

	.akui-tree-item-row:hover > .akui-tree-handle,
	.akui-tree-item-row:focus-within > .akui-tree-handle,
	.akui-tree-item-dragging .akui-tree-handle {
		opacity: 1;
	}

	.akui-tree-handle:focus-visible {
		opacity: 1;
		outline: 2px solid var(--akui-bg-accent, #2563eb);
		outline-offset: -2px;
		border-radius: var(--akui-radius-s);
	}

	@media (hover: none) {
		.akui-tree-handle {
			opacity: 0.5;
		}
	}

	.akui-tree-handle:hover {
		color: var(--akui-fg);
	}

	.akui-tree-item-row {
		position: relative;
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

	.akui-tree-item-row.large {
		padding: 10px 16px;
		gap: var(--akui-space-m);
		margin-left: calc(var(--depth) * 28px);
	}

	.akui-tree-item-row.large .akui-tree-item-label {
		font-size: 0.95rem;
		font-weight: 500;
	}

	.akui-tree-item-row.large .akui-tree-item-status {
		font-size: 0.8rem;
	}

	.akui-tree-item-row.large .akui-tree-item-icon {
		width: 24px;
		height: 24px;
	}

	.akui-tree-item-row.large .akui-tree-chevron {
		width: 24px;
		height: 24px;
		margin: 0;
	}

	.akui-tree-item-row:hover {
		background-color: var(--akui-bg-hover);
	}

	.akui-tree-item-row:focus-visible {
		box-shadow: 0 0 0 2px var(--akui-bg-accent);
		background-color: var(--akui-bg-hover);
	}

	/*
	 * Public opt-in class: consumers add it through `itemAttributes` to mark a row as the
	 * current target of whatever they are doing (a drop, a move, a search hit). `:global`
	 * because the class never appears in this template, only in consumer-supplied props.
	 */
	.akui-tree-item-row:global(.akui-tree-item-row-highlight) {
		background-color: var(--akui-bg-hover);
		outline: 2px dashed var(--akui-bg-accent, #2563eb);
		outline-offset: -2px;
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
		background: none;
		border: none;
		padding: 0;
		font: inherit;
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
		outline: none;
	}

	.akui-tree-chevron:hover {
		background-color: rgba(255, 255, 255, 0.1);
		color: var(--akui-fg);
	}

	.akui-tree-chevron:focus-visible {
		outline: 2px solid var(--akui-bg-accent, #2563eb);
		outline-offset: 2px;
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
