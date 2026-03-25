<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Menu from './Menu.svelte';
	import MenuButton from './MenuButton.svelte';
	import Padding from '../Padding/Padding.svelte';
	import ButtonGroup from '../ButtonGroup/ButtonGroup.svelte';
	import MenuDemo from './MenuDemo.svelte';

	const { Story } = defineMeta({
		title: 'Components/Menu',
		component: Menu,
		tags: ['autodocs']
	});
</script>

<script lang="ts">
	import Button from '../Button/Button.svelte';
	let showMobile = $state(false);
	let showLarge = $state(false);
</script>

<Story name="Desktop Positioning">
	<MenuDemo />
</Story>

<Story name="Mobile View">
	<div
		style="height: 500px; border: 1px solid var(--akui-border-input); position: relative; overflow: hidden; background: var(--akui-bg-secondary); display: flex; flex-direction: column; align-items: center; justify-content: center;"
	>
		<Button onclick={() => (showMobile = !showMobile)}>
			{showMobile ? 'Hide' : 'Show'} Mobile Menu
		</Button>

		{#if showMobile}
			<Menu forceMobile={true} showBackdrop={false} onClose={() => (showMobile = false)}>
				<MenuButton icon="share" label="Share" />
				<MenuButton icon="link-45deg" label="Copy Link" />
				<Padding size="m">
					<ButtonGroup>
						<Button style="flex: 1;">Option A</Button>
						<Button style="flex: 1;">Option B</Button>
					</ButtonGroup>
				</Padding>
				<MenuButton icon="trash-fill" label="Delete" style="color: #ef4444;" />
				<MenuButton label="Cancel" onclick={() => (showMobile = false)} />
			</Menu>
		{/if}
	</div>
</Story>

<Story name="Overflow & Scrolling">
	<div style="padding: 2rem; display: flex; justify-content: center;">
		<Button onclick={() => (showLarge = !showLarge)}>
			{showLarge ? 'Hide' : 'Show'} Large Menu
		</Button>
	</div>

	{#if showLarge}
		<Menu
			x={typeof window !== 'undefined' ? window.innerWidth / 2 : 100}
			y={150}
			showBackdrop={true}
			onClose={() => (showLarge = false)}
		>
			{#each Array.from({ length: 20 }, (_, i) => i) as i (i)}
				<MenuButton label="Item {i + 1}" />
			{/each}
		</Menu>
	{/if}
</Story>
