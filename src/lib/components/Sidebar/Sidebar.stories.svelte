<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Sidebar from './Sidebar.svelte';
	import Padding from '../Padding/Padding.svelte';
	import Button from '../Button/Button.svelte';
	import Small from '../Small/Small.svelte';
	import { ControlItemText } from '../ControlGroup/index.js';
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
	let permanentOpen = $state(true);
	let dismissibleOpen = $state(true);
	let modalOpen = $state(false);
</script>

{#snippet sidebarFooter()}
	<Small tag="p">© 2026 Akui</Small>
	<Small tag="p">v1.0.4-beta</Small>
{/snippet}

{#snippet sidebarContent()}
	<ControlItemText icon="house" label="Dashboard" />
	<ControlItemText icon="person" label="Profile" />
	<ControlItemText icon="gear" label="Settings" />
	<ControlItemText icon="box-arrow-right" label="Sign Out" />
	<Padding size="s" y>
		<Small tag="h3" style="margin-left: var(--akui-space-m); margin-bottom: var(--akui-space-s); display: block; opacity: 0.6;">
			Feeds
		</Small>
		<Tree items={mockTreeItems} expanded={new Set(['news'])} />
	</Padding>
{/snippet}

<Story name="Permanent">
	<div class="layout-demo">
		<Sidebar title="Cosy Reader" icon="book" content={sidebarContent} footer={sidebarFooter} mode="permanent" />
		<div class="main-content-demo">
			<Padding size="l">
				<h1>Permanent Mode</h1>
				<p>The sidebar is always visible and occupies space on the screen.</p>
			</Padding>
		</div>
	</div>
</Story>

<Story name="Dismissible">
	<div class="layout-demo">
		<Sidebar title="Cosy Reader" icon="book" content={sidebarContent} footer={sidebarFooter} mode="dismissible" bind:isOpen={dismissibleOpen} />
		<div class="main-content-demo">
			<Padding size="l">
				<Button onclick={() => (dismissibleOpen = !dismissibleOpen)}>Toggle Sidebar</Button>
				<h1>Dismissible Mode</h1>
				<p>The sidebar adjusts the layout space smoothly without squashing internal elements.</p>
			</Padding>
		</div>
	</div>
</Story>

<Story name="Modal">
	<div class="layout-demo">
		<Sidebar title="Cosy Reader" icon="book" content={sidebarContent} footer={sidebarFooter} mode="modal" bind:isOpen={modalOpen} />
		<div class="main-content-demo">
			<Padding size="l">
				<Button onclick={() => (modalOpen = true)}>Open Modal Sidebar</Button>
				<h1>Modal Mode</h1>
				<p>The sidebar slides in on top of content with a dark scrim backdrop.</p>
			</Padding>
		</div>
	</div>
</Story>

<style>
	.layout-demo {
		display: flex;
		height: 400px;
		border: 1px solid var(--akui-border-input);
		overflow: hidden;
		position: relative;
		background: var(--akui-bg);
	}
	.main-content-demo {
		flex: 1;
		overflow-y: auto;
		background: var(--akui-bg-secondary);
	}
</style>
