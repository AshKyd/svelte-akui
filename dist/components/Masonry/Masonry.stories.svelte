<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Masonry from './Masonry.svelte';
	import Draggable from '../Draggable/Draggable.svelte';
	import DropTarget from '../DropTarget/DropTarget.svelte';
	import FeedItemRow from '../FeedItemRow/FeedItemRow.svelte';
	import LayoutContentWidth from '../LayoutContentWidth/LayoutContentWidth.svelte';

	const { Story } = defineMeta({
		title: 'Components/Masonry',
		tags: ['autodocs']
	});

	const mockItems = [
		{
			id: 1,
			title: '[1] Witch and feline familiar rescue stranded gnome from overgrown bramble-patch',
			excerpt:
				'After a three-hour negotiation involving premium catnip and a very small ladder, the local rescue duo safely returned the gnome to the mossy glade.',
			tag: 'Forest News',
			time: '12m ago',
			href: '#',
			image: '/philip-oroni-KbusKKAZ968-unsplash.jpg'
		},
		{
			id: 2,
			title: '[2] New protective wards increase local toadstool density by 40%',
			excerpt:
				'Wizards report that the latest batch of silver-ink wards has had an unexpected side-effect on the local fungal population.',
			tag: 'Ecology',
			time: '2h ago',
			icon: 'stars',
			href: '#'
		},
		{
			id: 3,
			title: '[3] The art of brewing perfectly shimmering moon-dew tea',
			excerpt:
				'Learn the secrets of timing your kettle with the lunar cycle to achieve that elusive pearlescent glow.',
			tag: 'Home & Hearth',
			time: 'Yesterday',
			image: '/philip-oroni-KbusKKAZ968-unsplash.jpg',
			href: '#'
		},
		{
			id: 4,
			title: '[4] Local divination group finds new meeting hall following unexpected fire',
			excerpt:
				'Despite not seeing the disaster coming, the group has secured a lease on the old bell-tower.',
			tag: 'Community News',
			time: '3h ago',
			href: '#'
		},
		{
			id: 5,
			title: '[5] Nap schedules of sleepy dragons altered by daylight savings',
			excerpt:
				'Local dragon caretakers report minor grumpiness and slightly warmer sparks after the clock change.',
			tag: 'Fauna',
			time: '4h ago',
			image: '/faded_gallery-SiAJGyR15Aw-unsplash.jpg',
			href: '#'
		},
		{
			id: 6,
			title: '[6] Bake sale raises funds for gnome-sized library restoration',
			excerpt:
				'The community gathered to sell acorn-flour tarts and dandelion scones, successfully raising 50 silver pieces for the damp-damaged tiny archives.',
			tag: 'Community',
			time: '1d ago',
			href: '#'
		},
		{
			id: 7,
			title: '[7] Elves launch local seed-sharing library for glowing night-lilacs',
			excerpt:
				'To encourage moonlit gardens, the elven council is distributing seeds that flower only under starlight.',
			tag: 'Horticulture',
			time: '2d ago',
			image: '/faded_gallery-SiAJGyR15Aw-unsplash.jpg',
			href: '#'
		},
		{
			id: 8,
			title: '[8] A guide to cozy reading corners for introverted pixies',
			excerpt:
				'How to select the softest moss, gather glowing beetles, and ensure your toadstool corner remains entirely undisturbed.',
			tag: 'Lifestyle',
			time: '3d ago',
			href: '#'
		},
		{
			id: 9,
			title: '[9] Lost silver thimble returned to rightful fairy after fifty years',
			excerpt:
				'A local squirrel discovered the thimble under an oak tree and returned it to the weaver, who celebrated with a tiny feast.',
			tag: 'Community News',
			time: '4d ago',
			href: '#'
		},
		{
			id: 10,
			title: '[10] Whimsical tea party disrupted by extremely polite talking frog',
			excerpt:
				'The amphibian requested a single drop of chamomile and shared tales of the pond kingdoms before hopping away.',
			tag: 'Fauna',
			time: '5d ago',
			image: '/philip-oroni-KbusKKAZ968-unsplash.jpg',
			href: '#'
		}
	];
</script>

<script lang="ts">
	let refreshLayout: () => Promise<void>;
	let showEvenOnly = $state(false);

	const filteredItems = $derived(
		showEvenOnly ? mockItems.filter((_, i) => i % 2 === 0) : mockItems
	);

	// Reorder is a consumer concern now: the story owns the order and swaps entries when a
	// card is dropped onto another card's DropTarget.
	let reorderItems = $state(mockItems.map((item) => ({ ...item })));

	function moveCard(draggedId: number, targetId: number) {
		const from = reorderItems.findIndex((i) => i.id === draggedId);
		const to = reorderItems.findIndex((i) => i.id === targetId);
		if (from < 0 || to < 0 || from === to) return;
		const next = [...reorderItems];
		const [moved] = next.splice(from, 1);
		next.splice(to, 0, moved);
		reorderItems = next;
	}
</script>

<Story name="Standard Grid">
	<LayoutContentWidth
		size="large"
		style="background: var(--akui-bg-secondary); padding: 16px; border-radius: 8px;"
	>
		<Masonry bind:refreshLayout>
			{#each mockItems as item (item.id)}
				<div
					style="background: var(--akui-bg); border-radius: 6px; overflow: hidden; box-shadow: var(--akui-shadow-s);"
				>
					<FeedItemRow {...item} layout="hero" fit="cover" ratio="16 / 9" />
				</div>
			{/each}
		</Masonry>
	</LayoutContentWidth>
</Story>

<Story name="Animated Grid">
	<LayoutContentWidth
		size="large"
		style="background: var(--akui-bg-secondary); padding: 16px; border-radius: 8px; display: flex; flex-direction: column; gap: 16px;"
	>
		<div>
			<button
				style="padding: 8px 16px; background: var(--akui-accent, #5046e5); color: white; border: none; border-radius: 4px; cursor: pointer; font-family: inherit; font-size: 0.9rem;"
				onclick={() => {
					showEvenOnly = !showEvenOnly;
				}}
			>
				{showEvenOnly ? 'Show All Items' : 'Filter Even Items'}
			</button>
		</div>
		<Masonry animate={true} bind:refreshLayout>
			{#each filteredItems as item (item.id)}
				<div
					style="background: var(--akui-bg); border-radius: 6px; overflow: hidden; box-shadow: var(--akui-shadow-s);"
				>
					<FeedItemRow {...item} layout="hero" fit="cover" ratio="16 / 9" />
				</div>
			{/each}
		</Masonry>
	</LayoutContentWidth>
</Story>

<Story name="Reorder via Draggable">
	<LayoutContentWidth
		size="large"
		style="background: var(--akui-bg-secondary); padding: 16px; border-radius: 8px; display: flex; flex-direction: column; gap: 16px;"
	>
		<p style="margin: 0; color: var(--akui-text-subtle); font-size: 0.9rem;">
			Masonry is layout only. Each card is wrapped in <code>&lt;Draggable&gt;</code> and a per-card
			<code>&lt;DropTarget&gt;</code>; dropping one card onto another swaps their order and Masonry
			animates every card to its new place.
		</p>
		<Masonry animate={true} items={reorderItems} bind:refreshLayout>
			{#snippet itemSnippet(item)}
				<Draggable dragScale={0.5} getPayload={() => ({ type: 'masonry-demo-card', data: item })}>
					<DropTarget
						canDrop={(payload) =>
							payload.type === 'masonry-demo-card' && payload.data.id !== item.id}
						ondrop={(payload) => moveCard(payload.data.id, item.id)}
					>
						{#snippet children({ isOver, canDrop })}
							<div
								style="
									background: var(--akui-bg);
									border-radius: 6px;
									overflow: hidden;
									box-shadow: var(--akui-shadow-s);
									cursor: grab;
									outline: {isOver && canDrop
									? '2px dashed var(--akui-border-strong, #888)'
									: '2px dashed transparent'};
									outline-offset: -2px;
								"
							>
								<FeedItemRow {...item} layout="hero" fit="cover" ratio="16 / 9" />
							</div>
						{/snippet}
					</DropTarget>
				</Draggable>
			{/snippet}
		</Masonry>
	</LayoutContentWidth>
</Story>
