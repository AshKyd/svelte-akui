<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Tree from './Tree.svelte';

	const { Story } = defineMeta({
		title: 'Components/Tree',
		tags: ['autodocs']
	});

	const items = [
		{
			id: 'group-1',
			label: 'Technology',
			isFolder: true,
			status: '3',
			children: [
				{ id: 'feed-1', label: 'The Verge', icon: 'rss', status: '12' },
				{ id: 'feed-2', label: 'Ars Technica', icon: 'rss', status: '5' },
				{ id: 'feed-3', label: 'TechCrunch', icon: 'rss' }
			]
		},
		{
			id: 'group-2',
			label: 'Design',
			isFolder: true,
			status: '2',
			children: [
				{ id: 'feed-4', label: 'Smashing Magazine', icon: 'rss', status: '8' },
				{ id: 'feed-5', label: 'A List Apart', icon: 'rss' }
			]
		},
		{
			id: 'feed-6',
			label: 'Uncategorized Feed',
			icon: 'rss',
			status: '1'
		}
	];
</script>

<Story name="Default Minimal">
	<div style="width: 260px;">
		<Tree {items} />
	</div>
</Story>

<Story name="Large Spacious">
	<div style="width: 260px;">
		<Tree {items} size="large" expanded={new Set(['group-1'])} />
	</div>
</Story>

<Story name="Custom Favicons">
	{#snippet customIcon({ item })}
		<div
			style="width: 14px; height: 14px; background: #ccc; border-radius: 2px; filter: grayscale(1);"
		></div>
	{/snippet}

	<div style="width: 260px;">
		<Tree {items} icon={customIcon} expanded={new Set(['group-1'])} />
	</div>
</Story>

<Story name="Deeply Nested">
	<div style="width: 260px;">
		<Tree
			items={[
				{
					id: '1',
					label: 'Level 1',
					children: [
						{
							id: '1.1',
							label: 'Level 2',
							children: [
								{
									id: '1.1.1',
									label: 'Level 3',
									children: [{ id: '1.1.1.1', label: 'Level 4' }]
								}
							]
						}
					]
				}
			]}
			expanded={new Set(['1', '1.1', '1.1.1'])}
		/>
	</div>
</Story>

<script lang="ts">
	// Stateful tree nodes to simulate move operations
	let treeItems = $state([
		{
			id: 'group-1',
			label: 'Technology',
			isFolder: true,
			status: '3',
			children: [
				{ id: 'feed-1', label: 'The Verge', icon: 'rss', status: '12' },
				{ id: 'feed-2', label: 'Ars Technica', icon: 'rss', status: '5' },
				{ id: 'feed-3', label: 'TechCrunch', icon: 'rss' }
			]
		},
		{
			id: 'group-2',
			label: 'Design',
			isFolder: true,
			status: '2',
			children: [
				{ id: 'feed-4', label: 'Smashing Magazine', icon: 'rss', status: '8' },
				{ id: 'feed-5', label: 'A List Apart', icon: 'rss' }
			]
		},
		{
			id: 'feed-6',
			label: 'Uncategorized Feed',
			icon: 'rss',
			status: '1'
		}
	]);

	let log = $state('Drag feeds into folders to test moving.');

	// Drop handler function
	function handleDrop(draggedId: string, targetId: string) {
		log = `Dropped ${draggedId} on ${targetId}`;

		// Find the dragged item and remove it from its current parent
		let draggedItem: any = null;

		function removeItem(nodes: any[]): boolean {
			const index = nodes.findIndex(n => n.id === draggedId);
			if (index !== -1) {
				draggedItem = nodes.splice(index, 1)[0];
				return true;
			}
			return nodes.some(node => node.children && removeItem(node.children));
		}

		removeItem(treeItems);

		if (!draggedItem) return;

		// Add it to target parent
		function addItemToTarget(nodes: any[]): boolean {
			const target = nodes.find(n => n.id === targetId);
			if (target && target.isFolder) {
				if (!target.children) target.children = [];
				target.children.push(draggedItem);
				return true;
			}
			return nodes.some(node => node.children && addItemToTarget(node.children));
		}

		if (targetId === 'root') {
			treeItems.push(draggedItem);
		} else {
			addItemToTarget(treeItems);
		}

		// Trigger Svelte state refresh
		treeItems = [...treeItems];
	}

	// Validation: e.g. can only drop feeds (non-folders) into folders, or can't drop folder into itself/feeds
	function handleDragOver(draggedId: string, targetId: string): boolean {
		function isFolderNode(nodes: any[], id: string): boolean {
			const node = nodes.find(n => n.id === id);
			if (node) return !!node.isFolder;
			return nodes.some(n => n.children && isFolderNode(n.children, id));
		}

		// Validation rules:
		// 1. Cannot drop onto itself
		if (draggedId === targetId) return false;

		// 2. Can only drop onto folders
		const isTargetFolder = isFolderNode(treeItems, targetId);
		if (!isTargetFolder) return false;

		// 3. Cannot drag folders (for simplicity in demo, dragged items starting with 'group-' are folders)
		if (draggedId.startsWith('group-')) return false;

		return true;
	}
</script>

<Story name="Drag and Drop">
	<div style="width: 320px; display: flex; flex-direction: column; gap: var(--akui-space-s, 0.5rem);">
		<div style="background-color: var(--akui-bg-secondary, #f8f9fa); padding: var(--akui-space-m, 1rem); border-radius: var(--akui-radius-m, 8px); font-size: var(--akui-font-size-s, 0.875rem); color: var(--akui-fg-secondary, #6c757d); border: 1px solid var(--akui-border, #dee2e6);">
			<div><strong>Drag & Drop Rules:</strong></div>
			<div>• Feeds (non-folders) can be dragged into folders.</div>
			<div>• Folders (e.g. Technology/Design) cannot be dragged.</div>
			<div>• Items cannot be dropped onto other feeds.</div>
		</div>

		<div style="font-size: 0.875rem; font-weight: 600; color: var(--akui-fg-accent, #2563eb); min-height: 1.5rem;">
			{log}
		</div>

		<Tree
			items={treeItems}
			draggable={true}
			onDragOver={handleDragOver}
			onDrop={handleDrop}
			expanded={new Set(['group-1', 'group-2'])}
		/>
	</div>
</Story>
