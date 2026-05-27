<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FeedItemGroup from './FeedItemGroup.svelte';

	const { Story } = defineMeta({
		title: 'Components/FeedItemGroup',
		tags: ['autodocs']
	});

	const mockItems = [
		{
			id: 1,
			title: 'Witch and feline familiar rescue stranded gnome from overgrown bramble-patch',
			excerpt:
				'After a three-hour negotiation involving premium catnip and a very small ladder, the local rescue duo safely returned the gnome to the mossy glade.',
			tag: 'Forest News',
			time: '12m ago',
			href: '#'
		},
		{
			id: 2,
			title: 'New protective wards increase local toadstool density by 40%',
			excerpt:
				'Wizards report that the latest batch of silver-ink wards has had an unexpected side-effect on the local fungal population.',
			tag: 'Ecology',
			time: '2h ago',
			icon: 'stars',
			href: '#'
		},
		{
			id: 3,
			title: 'The art of brewing perfectly shimmering moon-dew tea',
			excerpt:
				'Learn the secrets of timing your kettle with the lunar cycle to achieve that elusive pearlescent glow.',
			tag: 'Home & Hearth',
			time: 'Yesterday',
			image: '/philip-oroni-KbusKKAZ968-unsplash.jpg',
			href: '#'
		}
	];

	const mockHeroItems = [
		{
			id: 1,
			title: 'Ancient Forest Sanctuary discovered behind local bakery',
			excerpt:
				"Staff at 'The Yeasty Wizard' were surprised to find that their flour storage closet actually opened into a 5,000-year-old enchanted woodland.",
			tag: 'Discovery',
			time: '10m ago',
			image: '/philip-oroni-KbusKKAZ968-unsplash.jpg',
			href: '#'
		},
		{
			id: 2,
			title: 'Local divination group finds new meeting hall following unexpected fire',
			excerpt:
				'Despite not seeing the disaster coming, the group has secured a lease on the old bell-tower.',
			tag: 'Community News',
			time: '3h ago',
			image: '/faded_gallery-SiAJGyR15Aw-unsplash.jpg',
			href: '#'
		},
		{
			id: 3,
			title: 'Nap schedules of sleepy dragons altered by daylight savings',
			excerpt:
				'Local dragon caretakers report minor grumpiness and slightly warmer sparks after the clock change.',
			tag: 'Fauna',
			time: '4h ago',
			image: '/philip-oroni-KbusKKAZ968-unsplash.jpg',
			href: '#'
		}
	];
</script>

<script lang="ts">
</script>

<Story name="Compact Column">
	<div style="max-width: 400px;">
		<FeedItemGroup items={mockItems} fit="cover" />
	</div>
</Story>

<Story name="Hero Column">
	<div style="max-width: 500px;">
		<FeedItemGroup items={mockHeroItems} layout="hero" fit="cover" />
	</div>
</Story>

<Story name="Mixed Layouts">
	<div style="max-width: 500px;">
		<FeedItemGroup
			items={[
				{ ...mockHeroItems[0], layout: 'hero' },
				{ ...mockItems[1], layout: 'compact' },
				{ ...mockItems[2], layout: 'compact' }
			]}
			fit="cover"
		/>
	</div>
</Story>

<Story name="Grid Layout">
	<div style="width: 100%; max-width: 1000px;">
		<FeedItemGroup items={mockHeroItems} display="grid" layout="hero" fit="cover" />
	</div>
</Story>

<Story name="Grayscale Override">
	{#snippet grayscaleIcon(item)}
		<div style="filter: grayscale(100%); opacity: 0.8; display: flex;">
			{#if item.icon}
				{#if typeof item.icon === 'string'}
					{#if item.icon.includes('/') || item.icon.includes('.')}
						<img src={item.icon} alt="" style="width: 16px; height: 16px; object-fit: cover;" />
					{:else}
						<Icon name={item.icon} size={16} />
					{/if}
				{:else}
					{@render item.icon()}
				{/if}
			{:else}
				<Icon name="rss" size={16} />
			{/if}
		</div>
	{/snippet}

	<div style="max-width: 400px;">
		<FeedItemGroup 
			items={mockItems} 
			icon={grayscaleIcon}
			fit="cover" 
		/>
	</div>
</Story>
