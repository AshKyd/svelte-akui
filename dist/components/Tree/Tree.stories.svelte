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
