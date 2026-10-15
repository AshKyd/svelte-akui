<script lang="ts">
	import MenuDesktop from '../Menu/MenuDesktop.svelte';
	import ControlItemText from '../ControlGroup/ControlItemText/ControlItemText.svelte';
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

<!-- Keep the editor selection while clicking items. -->
<div
	class="akui-wysiwyg-slash-menu"
	id={menuId}
	role="presentation"
	onmousedown={(e) => e.preventDefault()}
>
	<MenuDesktop label="Insert block">
		{#each state.items as item, index (item.id)}
			<ControlItemText
				id={slashOptionId(menuId, item.id)}
				{size}
				class={index === state.selectedIndex ? 'akui-wysiwyg-slash-active' : ''}
				tabindex={-1}
				onclick={() => state.onselect(item)}
			>
				{item.label}
				{#if item.hint}<span class="akui-wysiwyg-slash-hint">{item.hint}</span>{/if}
			</ControlItemText>
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

	/* The keyboard-highlighted item looks the same as a hovered one. */
	.akui-wysiwyg-slash-menu :global(.akui-wysiwyg-slash-active) {
		background-color: var(--akui-bg-hover);
	}

	.akui-wysiwyg-slash-empty {
		padding: var(--akui-space-s, 0.5rem) var(--akui-space-m, 1rem);
		color: var(--akui-fg-secondary);
		list-style: none;
	}

	.akui-wysiwyg-slash-hint {
		float: right;
		font-family: monospace;
		font-size: 0.8em;
		color: var(--akui-fg-secondary);
	}
</style>
