<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { keyboardNavigation } from './keyboardNavigation.js';

	const { Story } = defineMeta({
		title: 'Utilities/keyboardNavigation',
		tags: ['autodocs']
	});
</script>

<script lang="ts">
	import Icon from '../components/Icon/Icon.svelte';
	
	let activeId = $state<string | null>(null);
	let bookmarkedIds = $state<Record<string, boolean>>({
		'1': false,
		'2': true,
		'3': false
	});

	let message = $state('Click an item or use J/K + Enter to interact.');

	function handleSelect(id: string) {
		activeId = id;
		message = `Selected item ${id}!`;
	}

	function handleToggleBookmark(id: string) {
		bookmarkedIds[id] = !bookmarkedIds[id];
		message = `Bookmarked item ${id}: ${bookmarkedIds[id]}`;
	}
</script>

<Story name="Default">
	<div class="demo-container">
		<div class="demo-instructions">
			<Icon name="info-circle" size={16} />
			<span>
				<strong>Keyboard Navigation:</strong> Focus the list container below, then use <strong>J</strong> (down) / <strong>K</strong> (up) to navigate. Press <strong>Enter</strong> to trigger selection, or <strong>B</strong> to toggle the bookmark star.
			</span>
		</div>

		<div class="status-msg">{message}</div>

		<!-- Container that gets the action -->
		<div 
			use:keyboardNavigation={{
				keyMap: {
					b: (id) => handleToggleBookmark(id)
				},
				onSelect: (id) => {
					message = `Navigated to item ${id} (onSelect callback fired)`;
				}
			}}
			class="selectable-list"
			tabindex="0"
			aria-label="Selectable keyboard list"
		>
			<div 
				data-selectable 
				data-id="1" 
				class="selectable-item" 
				class:active={activeId === '1'}
				onclick={() => handleSelect('1')}
				role="button"
				tabindex="-1"
			>
				<span class="item-title">Item 1: Moss-gathering techniques for forest gnomes</span>
				{#if bookmarkedIds['1']}
					<Icon name="star-fill" size={16} colour="#ffc107" />
				{/if}
			</div>

			<div 
				data-selectable 
				data-id="2" 
				class="selectable-item" 
				class:active={activeId === '2'}
				onclick={() => handleSelect('2')}
				role="button"
				tabindex="-1"
			>
				<span class="item-title">Item 2: Cozy fireplace hearth renovations</span>
				{#if bookmarkedIds['2']}
					<Icon name="star-fill" size={16} colour="#ffc107" />
				{/if}
			</div>

			<div 
				data-selectable 
				data-id="3" 
				class="selectable-item" 
				class:active={activeId === '3'}
				onclick={() => handleSelect('3')}
				role="button"
				tabindex="-1"
			>
				<span class="item-title">Item 3: Witch's guide to brewing moon-dew tea</span>
				{#if bookmarkedIds['3']}
					<Icon name="star-fill" size={16} colour="#ffc107" />
				{/if}
			</div>
		</div>
	</div>
</Story>

<style>
	.demo-container {
		max-width: 500px;
		display: flex;
		flex-direction: column;
		gap: var(--akui-space-m, 1rem);
		padding: var(--akui-space-m, 1rem);
		font-family: sans-serif;
	}

	.demo-instructions {
		display: flex;
		gap: 0.5rem;
		align-items: flex-start;
		background-color: var(--akui-bg-secondary, #f8f9fa);
		padding: var(--akui-space-m, 1rem);
		border-radius: var(--akui-radius-m, 8px);
		border: 1px solid var(--akui-border, #dee2e6);
		font-size: var(--akui-font-size-s, 0.875rem);
		color: var(--akui-fg-secondary, #6c757d);
	}

	.status-msg {
		font-size: var(--akui-font-size-s, 0.875rem);
		color: var(--akui-fg-accent, #2563eb);
		font-weight: 600;
		min-height: 1.5rem;
	}

	.selectable-list {
		border: 1px solid var(--akui-border, #dee2e6);
		border-radius: var(--akui-radius-m, 8px);
		overflow: hidden;
		outline: none;
	}

	.selectable-list:focus-visible {
		box-shadow: 0 0 0 2px var(--akui-bg-accent, #2563eb);
	}

	.selectable-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--akui-space-m, 1rem);
		background-color: var(--akui-bg, #ffffff);
		border-bottom: 1px solid var(--akui-border, #dee2e6);
		cursor: pointer;
		outline: none;
	}

	.selectable-item:last-child {
		border-bottom: none;
	}

	.selectable-item:focus-visible {
		background-color: var(--akui-bg-hover, rgba(0, 0, 0, 0.05));
		box-shadow: inset 3px 0 0 var(--akui-bg-accent, #2563eb);
	}

	.selectable-item.active {
		background-color: var(--akui-bg-secondary, #f3f4f6);
	}

	.item-title {
		font-size: var(--akui-font-size-m, 1rem);
		color: var(--akui-fg, #111827);
	}
</style>
