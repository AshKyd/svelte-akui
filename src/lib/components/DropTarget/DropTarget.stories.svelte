<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DropTarget from './DropTarget.svelte';
	import Draggable from '../Draggable/Draggable.svelte';
	import Masonry from '../Masonry/Masonry.svelte';
	import FeedItemRow from '../FeedItemRow/FeedItemRow.svelte';
	import Tree from '../Tree/Tree.svelte';
	import type { TreeItemData } from '../Tree/TreeItem.svelte';
	import Icon from '../Icon/Icon.svelte';
	import LayoutContentWidth from '../LayoutContentWidth/LayoutContentWidth.svelte';
	import type { DragPayload } from '../../hooks/dropManager.svelte.js';

	const { Story } = defineMeta({
		title: 'Components/DropTarget',
		tags: ['autodocs']
	});

	interface PotionIngredient {
		id: string;
		name: string;
		category: 'herb' | 'mineral' | 'creature';
		potency: string;
		image: string;
	}

	const initialPouchItems: PotionIngredient[] = [
		{
			id: 'item-1',
			name: 'Moonlit Night-Lilac Petals',
			category: 'herb',
			potency: 'Moderate glow',
			image: '/philip-oroni-KbusKKAZ968-unsplash.jpg'
		},
		{
			id: 'item-2',
			name: 'Star-Polished River Pebble',
			category: 'mineral',
			potency: 'Gentle warmth',
			image: '/faded_gallery-SiAJGyR15Aw-unsplash.jpg'
		},
		{
			id: 'item-3',
			name: 'Sun-Drenched Dandelion Fluff',
			category: 'herb',
			potency: 'Subtle levitation',
			image: '/philip-oroni-KbusKKAZ968-unsplash.jpg'
		},
		{
			id: 'item-4',
			name: 'Whispering Willow Bark',
			category: 'herb',
			potency: 'Soothing aroma',
			image: '/faded_gallery-SiAJGyR15Aw-unsplash.jpg'
		}
	];
</script>

<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { dropTarget, getDropManager } from '../../hooks/dropManager.svelte.js';

	let pouch = $state<PotionIngredient[]>([...initialPouchItems]);
	let cauldron = $state<PotionIngredient[]>([]);
	let compost = $state<PotionIngredient[]>([]);
	let log = $state<string>(
		'Drag ingredients from the apothecary pouch into the cauldron or apothecary ledger.'
	);

	let treeFolders = $state<TreeItemData[]>([
		{
			id: 'folder-herbs',
			label: 'Herbarium Archives',
			icon: 'flower1',
			isFolder: true,
			children: []
		},
		{
			id: 'folder-minerals',
			label: 'Gemstone Vault',
			icon: 'gem',
			isFolder: true,
			children: []
		}
	]);

	function handleCauldronDrop(payload: DragPayload) {
		const ingredient = payload.data as PotionIngredient;
		cauldron = [...cauldron, ingredient];
		pouch = pouch.filter((i) => i.id !== ingredient.id);
		log = `✨ Added ${ingredient.name} to the copper cauldron brew!`;
	}

	function handleTreeDrop(payload: DragPayload, targetItem: TreeItemData) {
		const ingredient = payload.data as PotionIngredient;
		const folder = treeFolders.find((f) => f.id === targetItem.id);
		if (folder) {
			if (!folder.children) folder.children = [];
			folder.children = [
				...folder.children,
				{
					id: ingredient.id,
					label: ingredient.name,
					icon: 'check-circle'
				}
			];
			treeFolders = [...treeFolders];
			pouch = pouch.filter((i) => i.id !== ingredient.id);
			log = `📜 Filed ${ingredient.name} under ${targetItem.label}`;
		}
	}

	// Tree has no drop support of its own: build a target per ledger row and pass it in
	// through `itemAttributes`.
	const manager = getDropManager();
	const ledgerRows = new Map<string, ReturnType<typeof buildLedgerRow>>();

	function buildLedgerRow(item: TreeItemData) {
		const target = dropTarget(
			{
				canDrop: (payload: DragPayload) => {
					const ingredient = payload.data as PotionIngredient;
					if (item.id === 'folder-herbs') return ingredient.category === 'herb';
					if (item.id === 'folder-minerals') return ingredient.category === 'mineral';
					return false;
				},
				ondrop: (payload: DragPayload) => handleTreeDrop(payload, item)
			},
			manager
		);
		return {
			target,
			attrs: {
				[createAttachmentKey()]: target.attach,
				get class() {
					return target.isOver && target.canDrop ? 'akui-tree-item-row-highlight' : undefined;
				}
			}
		};
	}

	function ledgerAttributes(item: TreeItemData) {
		let row = ledgerRows.get(item.id);
		if (!row) {
			row = buildLedgerRow(item);
			ledgerRows.set(item.id, row);
		}
		return row.attrs;
	}

	function handleReset() {
		pouch = [...initialPouchItems];
		cauldron = [];
		compost = [];
		treeFolders[0].children = [];
		treeFolders[1].children = [];
		treeFolders = [...treeFolders];
		log = 'Apothecary shelf replenished!';
	}
</script>

<Story name="Cauldron and Tree Ledger">
	<LayoutContentWidth
		size="large"
		style="display: flex; flex-direction: column; gap: 20px; padding: 20px;"
	>
		<div style="display: flex; justify-content: space-between; align-items: center;">
			<div>
				<h3 style="margin: 0; font-size: 1.15rem;">Cloverfield Cottage Apothecary</h3>
				<p style="margin: 4px 0 0 0; color: var(--akui-fg-secondary); font-size: 0.9rem;">
					Drag ingredients from the herbalist masonry pouch into the cauldron or ledger folders.
				</p>
			</div>
			<button
				style="padding: 6px 14px; border-radius: 6px; border: 1px solid var(--akui-border); background: var(--akui-bg); cursor: pointer;"
				onclick={handleReset}
			>
				Replenish Shelf
			</button>
		</div>

		<div
			style="padding: 10px 14px; background: var(--akui-bg-secondary); border-radius: 8px; font-weight: 500; font-size: 0.9rem; color: var(--akui-fg-accent);"
		>
			{log}
		</div>

		<div
			style="display: grid; grid-template-columns: 260px 1fr 260px; gap: 20px; align-items: start;"
		>
			<!-- Left Column: Tree View Drop Target -->
			<div
				style="border: 1px solid var(--akui-border); border-radius: 8px; padding: 14px; background: var(--akui-bg);"
			>
				<div
					style="font-weight: 600; font-size: 0.85rem; text-transform: uppercase; margin-bottom: 12px; color: var(--akui-fg-secondary);"
				>
					Apothecary Ledger
				</div>
				<Tree
					items={treeFolders}
					expanded={new Set(['folder-herbs', 'folder-minerals'])}
					itemAttributes={ledgerAttributes}
				/>
			</div>

			<!-- Center Column: Draggable Masonry Grid -->
			<div
				style="border: 1px solid var(--akui-border); border-radius: 8px; padding: 14px; background: var(--akui-bg-secondary);"
			>
				<div
					style="font-weight: 600; font-size: 0.85rem; text-transform: uppercase; margin-bottom: 12px; color: var(--akui-fg-secondary);"
				>
					Ingredients Pouch ({pouch.length})
				</div>
				{#if pouch.length === 0}
					<div style="text-align: center; padding: 40px; color: var(--akui-fg-secondary);">
						Pouch is empty! Click "Replenish Shelf" to refill.
					</div>
				{:else}
					<Masonry items={pouch} animate={true} colWidth="minmax(180px, 1fr)">
						{#snippet itemSnippet(item)}
							<Draggable
								dragScale={0.5}
								getPayload={() => ({
									type: 'apothecary-ingredient',
									data: item,
									source: 'pouch'
								})}
							>
								<div
									style="background: var(--akui-bg); border-radius: 8px; overflow: hidden; border: 1px solid var(--akui-border); cursor: grab; user-select: none;"
								>
									<FeedItemRow
										title={item.name}
										excerpt={item.potency}
										tag={item.category}
										image={item.image}
										ratio="16 / 9"
										fit="cover"
									/>
								</div>
							</Draggable>
						{/snippet}
					</Masonry>
				{/if}
			</div>

			<!-- Right Column: Cauldron Drop Target Component -->
			<DropTarget
				canDrop={(payload) => payload.type === 'apothecary-ingredient'}
				ondrop={handleCauldronDrop}
			>
				{#snippet children({ isOver, canDrop, isDragging })}
					<div
						style="
							border: 2px dashed {isOver && canDrop ? 'var(--akui-bg-accent, #2563eb)' : 'var(--akui-border)'};
							background: {isOver && canDrop
							? 'var(--akui-bg-accent-subtle, rgba(37, 99, 235, 0.08))'
							: 'var(--akui-bg)'};
							border-radius: 12px;
							padding: 20px;
							display: flex;
							flex-direction: column;
							align-items: center;
							gap: 12px;
							min-height: 220px;
							justify-content: center;
							text-align: center;
							transition: all 0.2s ease;
						"
					>
						<Icon name="cup-hot" size={36} />
						<div>
							<div style="font-weight: 600; font-size: 0.95rem;">Bubbling Cauldron</div>
							<div style="font-size: 0.8rem; color: var(--akui-fg-secondary); margin-top: 4px;">
								{#if isOver && canDrop}
									Release to brew ingredient!
								{:else if isDragging}
									Accepts any ingredient
								{:else}
									Drop ingredients here to brew
								{/if}
							</div>
						</div>

						{#if cauldron.length > 0}
							<div
								style="width: 100%; border-top: 1px solid var(--akui-border); margin-top: 8px; padding-top: 8px; font-size: 0.8rem; color: var(--akui-fg-secondary);"
							>
								Brew contains {cauldron.length} item{cauldron.length > 1 ? 's' : ''}
							</div>
						{/if}
					</div>
				{/snippet}
			</DropTarget>
		</div>
	</LayoutContentWidth>
</Story>
