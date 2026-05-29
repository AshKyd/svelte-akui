<script lang="ts">
	import { type Snippet } from 'svelte';
	import InfoBox from './InfoBox.svelte';

	export interface InfoBoxItem {
		id: string;
		variant?: 'info' | 'success' | 'warning' | 'error';
		title?: string;
		message: string | Snippet;
		icon?: string;
		onClose?: () => void;
		[key: string]: any;
	}

	interface Props {
		/** Array of info box items to display */
		items: InfoBoxItem[];
		/** Optional icon snippet for custom icon rendering (overrides item.icon) */
		icon?: Snippet<[{ item: InfoBoxItem }]>;
		/** Additional CSS classes */
		class?: string;
	}

	let { items, icon, class: className = '' }: Props = $props();
</script>

<div class="akui-infoboxes {className}">
	{#each items as item (item.id)}
		{#snippet renderIcon()}
			{#if icon}
				{@render icon({ item })}
			{/if}
		{/snippet}

		<div class="akui-infobox-wrapper">
			<InfoBox
				variant={item.variant}
				title={item.title}
				icon={item.icon}
				onClose={item.onClose}
				class="akui-infobox-item"
				naked={true}
				iconSnippet={icon ? renderIcon : undefined}
			>
				{#if typeof item.message === 'string'}
					{item.message}
				{:else}
					{@render item.message()}
				{/if}
			</InfoBox>
		</div>
	{/each}
</div>

<style>
	.akui-infoboxes {
		display: flex;
		flex-direction: column;
		width: 100%;
	}

	.akui-infobox-wrapper {
		border-bottom: 1px solid rgba(0, 0, 0, 0.08);
		transition: var(--akui-transition-theme);
	}

	.akui-infobox-wrapper:last-child {
		border-bottom: none;
	}
</style>
