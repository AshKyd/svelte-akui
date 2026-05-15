<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Sidebar from './Sidebar.svelte';
	import Padding from '../Padding/Padding.svelte';
	import Button from '../Button/Button.svelte';
	import Small from '../Small/Small.svelte';
	import { ControlItem } from '../Control/index.ts';
	import Tree from '../Tree/Tree.svelte';
	import type { TreeItemData } from '../Tree/TreeItem.svelte';

	const mockTreeItems: TreeItemData[] = [
		{ 
			id: 'news', 
			label: 'News', 
			icon: 'folder',
			children: [
				{ id: 'guardian', label: 'The Guardian', icon: 'rss' },
				{ id: 'bbc', label: 'BBC News', icon: 'rss' }
			]
		},
		{ 
			id: 'tech', 
			label: 'Tech', 
			icon: 'folder',
			children: [
				{ id: 'hn', label: 'Hacker News', icon: 'rss' },
				{ id: 'verge', label: 'The Verge', icon: 'rss' }
			]
		}
	];

	const { Story } = defineMeta({
		title: 'Components/Sidebar',
		tags: ['autodocs']
	});
</script>

<script lang="ts">
	let isOpen = $state(false);
</script>

{#snippet sidebarFooter()}
	<Small tag="p">© 2024 Akui</Small>
	<Small tag="p">v1.0.4-beta</Small>
{/snippet}

{#snippet sidebarProp()}
	<ControlItem icon="house" label="Dashboard" />
	<ControlItem icon="person" label="Profile" />
	<ControlItem icon="gear" label="Settings" />
	<ControlItem icon="box-arrow-right" label="Sign Out" />
{/snippet}

{#snippet treeView()}
	<Padding size="s" y>
		<Small tag="h3" style="margin-left: var(--akui-space-m); margin-bottom: var(--akui-space-s); display: block; opacity: 0.6;">
			Feeds
		</Small>
		<Tree items={mockTreeItems} expanded={new Set(['news'])} />
	</Padding>
{/snippet}

<Story name="Interactive">
	<Sidebar sidebar={sidebarProp} footer={sidebarFooter} bind:isOpen>
		<Padding size="l">
			<Button onclick={() => (isOpen = !isOpen)} class="mobile-only">Toggle Sidebar</Button>
			<h1>Main Content Area</h1>
			<p>This is a simplified sidebar implementation using basic text and the Padding component.</p>
			{#each Array.from({ length: 10 }, (_, k) => k) as i (i)}
				<p>Section block {i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
			{/each}
		</Padding>
	</Sidebar>
</Story>

<Story name="With Tree">
	<Sidebar sidebar={sidebarProp} sidebarBody={treeView} footer={sidebarFooter} bind:isOpen>
		<Padding size="l">
			<Button onclick={() => (isOpen = !isOpen)} class="mobile-only">Toggle Sidebar</Button>
			<h1>Application with Tree</h1>
			<p>The tree view on the left is rendered using the <code>sidebarBody</code> snippet.</p>
		</Padding>
	</Sidebar>
</Story>

<style>
	@media (min-width: 769px) {
		:global(.mobile-only) {
			display: none;
		}
	}
</style>
