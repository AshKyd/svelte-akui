<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import NavigationBar from './NavigationBar.svelte';
	import NavigationBarItem from './NavigationBarItem.svelte';
	import Padding from '../Padding/Padding.svelte';

	const { Story } = defineMeta({
		title: 'Components/NavigationBar',
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen'
		}
	});
</script>

<script lang="ts">
	let activeId = $state('home');
</script>

<Story name="Standard">
	<div class="demo-container">
		<div class="content-area">
			<Padding size="l">
				<h1>Bottom Navigation Bar</h1>
				<p>Active destination: <strong>{activeId}</strong></p>
				<p>Hover and select items to see the subtle active pill scale animation and primary color transformation.</p>
			</Padding>
		</div>
		<NavigationBar>
			<NavigationBarItem
				label="Home"
				icon="house"
				active={activeId === 'home'}
				onclick={() => (activeId = 'home')}
			/>
			<NavigationBarItem
				label="Search"
				icon="search"
				active={activeId === 'search'}
				onclick={() => (activeId = 'search')}
			/>
			<NavigationBarItem
				label="Bookmarks"
				icon="star"
				active={activeId === 'bookmarks'}
				onclick={() => (activeId = 'bookmarks')}
			/>
			<NavigationBarItem
				label="Settings"
				icon="gear"
				active={activeId === 'settings'}
				onclick={() => (activeId = 'settings')}
			/>
		</NavigationBar>
	</div>
</Story>

<style>
	.demo-container {
		display: flex;
		flex-direction: column;
		height: 300px;
		border: 1px solid var(--akui-border-input);
	}
	.content-area {
		flex: 1;
		background: var(--akui-bg-secondary);
	}
</style>
