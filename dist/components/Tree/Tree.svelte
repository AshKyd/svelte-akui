<script lang="ts">
	import { type Snippet, setContext } from 'svelte';
	import TreeItem, { type TreeItemData } from './TreeItem.svelte';

	interface Props {
		/** Array of tree items */
		items: TreeItemData[];
		/** Set of expanded item IDs */
		expanded?: Set<string>;
		/** Optional icon snippet for custom icon rendering */
		icon?: Snippet<[TreeItemData]>;
		/** Additional CSS classes */
		class?: string;
		/** Callback when an item is selected (clicked) */
		onSelect?: (item: TreeItemData) => void;
		/** Callback when a folder is toggled */
		onToggle?: (id: string) => void;
		/** Whether item drag & drop is enabled */
		draggable?: boolean;
		/** Callback to validate if dropping draggedId on targetId is allowed */
		onDragOver?: (draggedId: string, targetId: string) => boolean;
		/** Callback when an item is dropped onto a target */
		onDrop?: (draggedId: string, targetId: string) => void;
	}

	let {
		items,
		expanded = $bindable(new Set()),
		icon,
		class: className = '',
		draggable = false,
		onSelect,
		onToggle,
		onDragOver,
		onDrop
	}: Props = $props();

	let dragContext = $state<{
		activeDragId: string | null;
	}>({
		activeDragId: null
	});

	setContext('akui-tree-drag', {
		get activeDragId() { return dragContext.activeDragId; },
		set activeDragId(val) { dragContext.activeDragId = val; },
		get draggable() { return draggable; },
		onDragOver,
		onDrop
	});

	function handleToggle(id: string) {
		if (expanded.has(id)) {
			expanded.delete(id);
		} else {
			expanded.add(id);
		}
		expanded = new Set(expanded); // Trigger reactivity
		onToggle?.(id);
	}

	function handleKeyDown(e: KeyboardEvent) {
		const target = e.target as HTMLElement;
		if (!target.classList.contains('akui-tree-item-row')) return;

		const container = target.closest('.akui-tree-item-container') as HTMLElement;
		const id = container.dataset.id;

		switch (e.key) {
			case 'ArrowDown': {
				e.preventDefault();
				const allRows = Array.from(document.querySelectorAll('.akui-tree-item-row'));
				const index = allRows.indexOf(target);
				(allRows[index + 1] as HTMLElement)?.focus();
				break;
			}
			case 'ArrowUp': {
				e.preventDefault();
				const allRows = Array.from(document.querySelectorAll('.akui-tree-item-row'));
				const index = allRows.indexOf(target);
				(allRows[index - 1] as HTMLElement)?.focus();
				break;
			}
			case 'ArrowRight': {
				e.preventDefault();
				if (id && !expanded.has(id)) {
					handleToggle(id);
				}
				break;
			}
			case 'ArrowLeft': {
				e.preventDefault();
				if (id && expanded.has(id)) {
					handleToggle(id);
				}
				break;
			}
			case 'Home': {
				e.preventDefault();
				const allRows = Array.from(document.querySelectorAll('.akui-tree-item-row'));
				(allRows[0] as HTMLElement)?.focus();
				break;
			}
			case 'End': {
				e.preventDefault();
				const allRows = Array.from(document.querySelectorAll('.akui-tree-item-row'));
				(allRows[allRows.length - 1] as HTMLElement)?.focus();
				break;
			}
			case 'Enter': {
				e.preventDefault();
				target.click(); // Triggers handleSelect
				break;
			}
			case ' ': {
				e.preventDefault();
				if (id) handleToggle(id);
				break;
			}
		}
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<ul
	role="tree"
	class="akui-tree {className}"
	class:dragging={dragContext.activeDragId !== null}
	onkeydown={handleKeyDown}
>
	{#each items as item}
		<TreeItem
			{item}
			{expanded}
			onToggle={handleToggle}
			onSelect={onSelect}
			iconSnippet={icon}
		/>
	{/each}
</ul>

<style>
	.akui-tree {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		width: 100%;
	}
</style>
