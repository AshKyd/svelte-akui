<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MenuButton from './MenuButton.svelte';
	import { MenuItem } from '../Menu/index.js';

	const { Story } = defineMeta({
		title: 'Components/MenuButton',
		tags: ['autodocs']
	});
</script>

<script lang="ts">
</script>

{#snippet demoMenu()}
	<MenuItem icon="person" label="Profile" />
	<MenuItem icon="gear" label="Settings" />
	<MenuItem icon="box-arrow-right" label="Sign out" />
{/snippet}

<Story name="Text Button">
	<MenuButton label="Open Options" menu={demoMenu} />
</Story>

<Story name="Hamburger Icon">
	<MenuButton
		icon="list"
		iconPosition="only"
		variant="regular"
		menu={demoMenu}
		origin="bottom-right"
	/>
</Story>

<Story name="Positioning Origins">
	<MenuButton label="Bottom Left" menu={demoMenu} origin="bottom-left" />
	<MenuButton label="Bottom Right" menu={demoMenu} origin="bottom-right" />
	<MenuButton label="Top Left" menu={demoMenu} origin="top-left" />
	<MenuButton label="Top Right" menu={demoMenu} origin="top-right" />
</Story>
