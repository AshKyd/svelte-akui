<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Menu, MenuItem, MenuContent } from './index.js';
	import ButtonGroup from '../ButtonGroup/ButtonGroup.svelte';
	import MenuDemo from './MenuDemo.svelte';
	import Button from '../Button/Button.svelte';

	const { Story } = defineMeta({
		title: 'Components/Menu',
		tags: ['autodocs']
	});
</script>

<script lang="ts">
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
			<Menu forceMobile={true} onClose={() => (showMobile = false)}>
				<MenuItem icon="share" label="Share" />
				<MenuItem icon="link-45deg" label="Copy Link" />
				<MenuContent>
					<ButtonGroup>
						<Button style="flex: 1;">Option A</Button>
						<Button style="flex: 1;">Option B</Button>
					</ButtonGroup>
				</MenuContent>
				<MenuItem icon="trash-fill" label="Delete" style="color: #ef4444;" />
				<MenuItem label="Cancel" onclick={() => (showMobile = false)} />
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
			onClose={() => (showLarge = false)}
		>
			{#each Array.from({ length: 20 }, (_, i) => i) as i (i)}
				<MenuItem label="Item {i + 1}" />
			{/each}
		</Menu>
	{/if}
</Story>
