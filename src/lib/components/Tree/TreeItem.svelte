<script lang="ts">
	import { type Snippet, getContext } from 'svelte';
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
		parentId?: string;
		expanded?: Set<string>;
		size?: 'small' | 'large';
		onToggle?: (id: string) => void;
		onSelect?: (item: TreeItemData) => void;
		/** Optional snippet to override icon rendering */
		iconSnippet?: Snippet<[TreeItemData]>;
	}

	let {
		item,
		depth = 0,
		parentId,
		expanded = new Set(),
		size = 'small',
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
	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleSelect();
		}
	}

	function handleChevronKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.stopPropagation();
			e.preventDefault();
			handleToggle(e as unknown as MouseEvent);
		}
	}

	// Drag and Drop implementation
	const dragCtx = getContext<any>('akui-tree-drag');
	const isDragDropSupported = typeof window !== 'undefined' && 'draggable' in document.createElement('span');

	const targetId = $derived(isFolder ? item.id : (parentId || item.id));
	const isDragOver = $derived(!!(dragCtx && (dragCtx.activeTargetId === item.id || dragCtx.hoveredItemId === item.id)));

	function handleDragStart(e: DragEvent) {
		if (!dragCtx || !dragCtx.draggable) return;
		dragCtx.activeDragId = item.id;
		dragCtx.activeTargetId = null;
		dragCtx.hoveredItemId = null;
		e.dataTransfer?.setData('text/plain', item.id);
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
		}
	}

	function handleDragEnd() {
		if (!dragCtx) return;
		dragCtx.activeDragId = null;
		dragCtx.activeTargetId = null;
		dragCtx.hoveredItemId = null;
	}

	function handleDragOver(e: DragEvent) {
		if (!dragCtx || !dragCtx.draggable) return;
		const draggedId = dragCtx.activeDragId;
		if (!draggedId || draggedId === targetId) return;

		let allowed = true;
		if (dragCtx.onDragOver) {
			allowed = dragCtx.onDragOver(draggedId, targetId);
		}

		if (allowed) {
			e.preventDefault();
			if (e.dataTransfer) {
				e.dataTransfer.dropEffect = 'move';
			}
			
			// Keep active target and hovered item updated on dragover to prevent DOM bubbling flicker
			if (dragCtx.activeTargetId !== targetId) {
				dragCtx.activeTargetId = targetId;
			}
			if (dragCtx.hoveredItemId !== item.id) {
				dragCtx.hoveredItemId = item.id;
			}
		}
	}

	function handleDragEnter(e: DragEvent) {
		if (!dragCtx || !dragCtx.draggable) return;
		const draggedId = dragCtx.activeDragId;
		if (!draggedId || draggedId === targetId) return;

		let allowed = true;
		if (dragCtx.onDragOver) {
			allowed = dragCtx.onDragOver(draggedId, targetId);
		}

		if (allowed) {
			dragCtx.activeTargetId = targetId;
			dragCtx.hoveredItemId = item.id;
		}
	}

	function handleDragLeave() {
		if (dragCtx) {
			if (dragCtx.activeTargetId === targetId) {
				dragCtx.activeTargetId = null;
			}
			if (dragCtx.hoveredItemId === item.id) {
				dragCtx.hoveredItemId = null;
			}
		}
	}

	function handleDrop(e: DragEvent) {
		if (!dragCtx || !dragCtx.draggable) return;
		e.preventDefault();
		if (dragCtx.activeTargetId === targetId) {
			dragCtx.activeTargetId = null;
		}
		if (dragCtx.hoveredItemId === item.id) {
			dragCtx.hoveredItemId = null;
		}

		const draggedId = dragCtx.activeDragId || e.dataTransfer?.getData('text/plain');
		if (draggedId && draggedId !== targetId) {
			dragCtx.onDrop?.(draggedId, targetId);
		}
		dragCtx.activeDragId = null;
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
		class:large={size === 'large'}
		class:drag-over={isDragOver}
		style="--depth: {depth}"
		onclick={handleSelect}
		onkeydown={handleKeyDown}
		role="button"
		tabindex="0"
		draggable={dragCtx?.draggable && isDragDropSupported}
		ondragstart={handleDragStart}
		ondragend={handleDragEnd}
		ondragover={handleDragOver}
		ondragenter={handleDragEnter}
		ondragleave={handleDragLeave}
		ondrop={handleDrop}
	>
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
		<ul role="group" class="akui-tree-group" transition:slide={{ duration: 200 }}>
			{#each item.children || [] as child}
				<svelte:self
					item={child}
					depth={depth + 1}
					parentId={item.id}
					{expanded}
					{size}
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

	.akui-tree-item-row.drag-over {
		background-color: var(--akui-bg-hover);
		outline: 2px dashed var(--akui-bg-accent, #2563eb);
		outline-offset: -2px;
	}

	:global(.akui-tree.dragging) .akui-tree-item-row * {
		pointer-events: none;
	}

	.akui-tree-item-icon {
		width: 16px;
		height: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.akui-tree-item-favicon {
		width: 14px;
		height: 14px;
		border-radius: 2px;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.akui-tree-item-favicon img {
		width: 100%;
		height: 100%;
		object-fit: contain;
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
