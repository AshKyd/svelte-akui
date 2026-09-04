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

<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import {
		dragSource,
		dropTarget,
		getDropManager,
		type DragPayload,
		type TreeItemData
	} from '../../hooks/dropManager.svelte.js';

	// Stateful tree nodes so the "Compose drag and drop" story can move things around.
	let treeItems = $state<TreeItemData[]>([
		{
			id: 'group-1',
			label: 'Herbarium Shelf',
			isFolder: true,
			children: [
				{ id: 'jar-1', label: 'Dried nettle tops', icon: 'flower1' },
				{ id: 'jar-2', label: 'Rosehip husks', icon: 'flower1' }
			]
		},
		{
			id: 'group-2',
			label: 'Mineral Drawer',
			isFolder: true,
			children: [{ id: 'jar-3', label: 'River-smoothed quartz', icon: 'gem' }]
		},
		{ id: 'jar-4', label: 'Unsorted: bees wax curls', icon: 'box' },
		{ id: 'jar-5', label: 'Unsorted: pressed clover', icon: 'box' }
	]);

	let log = $state('Drag a jar onto a shelf or drawer to file it away.');

	/**
	 * Tree knows nothing about dragging. Each row simply gets a drag source and a drop
	 * target attachment through `itemAttributes`, built here in the consumer.
	 */
	const manager = getDropManager();
	const rows = new Map<string, ReturnType<typeof buildRow>>();

	function buildRow(item: TreeItemData) {
		const source = dragSource(
			{
				getPayload: () => ({ type: 'apothecary-jar', data: item }),
				get disabled() {
					return !!item.isFolder;
				}
			},
			manager
		);
		const target = dropTarget(
			{
				canDrop: (payload: DragPayload) =>
					payload.type === 'apothecary-jar' &&
					!!item.isFolder &&
					(payload.data as TreeItemData).id !== item.id,
				ondrop: (payload: DragPayload) => fileJar(payload.data as TreeItemData, item)
			},
			manager
		);
		return {
			source,
			target,
			attrs: {
				[createAttachmentKey()]: source.attach,
				[createAttachmentKey()]: target.attach,
				get class() {
					return target.isOver && target.canDrop ? 'akui-tree-item-row-highlight' : undefined;
				}
			}
		};
	}

	function itemAttributes(item: TreeItemData) {
		let row = rows.get(item.id);
		if (!row) {
			row = buildRow(item);
			rows.set(item.id, row);
		}
		return row.attrs;
	}

	/** Removes the jar from wherever it currently lives, then drops it into the folder. */
	function fileJar(jar: TreeItemData, folder: TreeItemData) {
		const remove = (nodes: TreeItemData[]): TreeItemData[] =>
			nodes
				.filter((n) => n.id !== jar.id)
				.map((n) => (n.children ? { ...n, children: remove(n.children) } : n));

		const insert = (nodes: TreeItemData[]): TreeItemData[] =>
			nodes.map((n) => {
				if (n.id === folder.id) return { ...n, children: [...(n.children ?? []), jar] };
				return n.children ? { ...n, children: insert(n.children) } : n;
			});

		treeItems = insert(remove(treeItems));
		log = `Filed ${jar.label} into ${folder.label}.`;
	}
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

<Story name="Compose drag and drop">
	<div
		style="width: 320px; display: flex; flex-direction: column; gap: var(--akui-space-s, 0.5rem);"
	>
		<div
			style="background-color: var(--akui-bg-secondary, #f8f9fa); padding: var(--akui-space-m, 1rem); border-radius: var(--akui-radius-m, 8px); font-size: 0.875rem; color: var(--akui-fg-secondary, #6c757d); border: 1px solid var(--akui-border, #dee2e6);"
		>
			<div><strong>Tree has no drag and drop of its own.</strong></div>
			<div>
				The story builds a <code>dragSource()</code> and a <code>dropTarget()</code> per row and
				hands them to <code>itemAttributes</code>.
			</div>
			<div>Jars can be dragged; shelves and drawers accept them.</div>
		</div>

		<div
			style="font-size: 0.875rem; font-weight: 600; color: var(--akui-fg-accent, #2563eb); min-height: 1.5rem;"
		>
			{log}
		</div>

		<Tree items={treeItems} {itemAttributes} expanded={new Set(['group-1', 'group-2'])} />
	</div>
</Story>
