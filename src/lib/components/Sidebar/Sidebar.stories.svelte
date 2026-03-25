<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Sidebar from './Sidebar.svelte';
	import Padding from '../Padding/Padding.svelte';
	import Button from '../Button/Button.svelte';

	const { Story } = defineMeta({
		title: 'Components/Sidebar',
		tags: ['autodocs']
	});
</script>

<script lang="ts">
	let isOpen = $state(false);
</script>

{#snippet sidebarProp()}
	<Padding>
		<p><strong>Sidebar Area</strong></p>
		<p>Dashboard</p>
		<p>Settings</p>
		<div style="height: 120vh; margin-top: 1rem; border-top: 1px solid #eee;">
			<p>Scrollable...</p>
			{#each Array.from({ length: 10 }, (_, k) => k) as i (i)}
				<p>Item {i + 1}</p>
			{/each}
		</div>
	</Padding>
{/snippet}

<Story name="Interactive">
	<Sidebar sidebar={sidebarProp} bind:isOpen>
		<Padding size="l">
			<Button onclick={() => (isOpen = !isOpen)} class="mobile-only">Toggle Sidebar</Button>
			<h1>Main Content Area</h1>
			<p>This is the main area content.</p>
			{#each Array.from({ length: 5 }, (_, k) => k) as i (i)}
				<p>Section {i + 1}</p>
			{/each}
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
