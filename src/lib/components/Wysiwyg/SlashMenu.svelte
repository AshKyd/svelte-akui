<script lang="ts">
	import MenuDesktop from '../Menu/MenuDesktop.svelte';
	import MenuItem from '../Menu/MenuItem.svelte';
	import { slashOptionId, type SlashMenuState } from './slashMenuState.svelte';

	interface Props {
		/** Items, highlighted index and select handler. */
		state: SlashMenuState;
		/** Unique id for this menu, used to build item ids. */
		menuId: string;
		/** Item density. Defaults to 'small'. */
		size?: 'small' | 'large';
	}

	let { state, menuId, size = 'small' }: Props = $props();

	// The editor keeps keyboard focus, so the highlighted item is announced through the editor's
	// `aria-activedescendant` rather than by moving focus. Keep it scrolled into view.
	$effect(() => {
		const item = state.items[state.selectedIndex];
		if (!item) return;
		document.getElementById(slashOptionId(menuId, item.id))?.scrollIntoView({ block: 'nearest' });
	});
</script>

<!--
	Same surface and `MenuItem`s as the other akui menus (e.g. the label picker). It is not the modal
	`Menu` dialog because the editor must keep focus. mousedown is cancelled to keep the editor selection.
-->
<div
	class="akui-wysiwyg-slash-menu"
	id={menuId}
	role="presentation"
	onmousedown={(e) => e.preventDefault()}
>
	<MenuDesktop label="Insert block">
		{#each state.items as item, index (item.id)}
			<MenuItem
				id={slashOptionId(menuId, item.id)}
				icon={item.icon}
				label={item.label}
				{size}
				highlighted={index === state.selectedIndex}
				tabindex={-1}
				onclick={() => state.onselect(item)}
			/>
		{:else}
			<li role="none" class="akui-wysiwyg-slash-empty">No matching commands</li>
		{/each}
	</MenuDesktop>
</div>

<style>
	/* Limit the height and scroll inside the menu card; `--akui-slash-max-height` is set from floating-ui. */
	.akui-wysiwyg-slash-menu :global(.akui-control-group) {
		max-height: var(--akui-slash-max-height, 320px);
		overflow-y: auto;
	}

	.akui-wysiwyg-slash-menu :global(.akui-menu-card) {
		min-width: 12rem;
	}

	.akui-wysiwyg-slash-empty {
		padding: var(--akui-space-s, 0.5rem) var(--akui-space-m, 1rem);
		color: var(--akui-fg-secondary);
		list-style: none;
	}
</style>
