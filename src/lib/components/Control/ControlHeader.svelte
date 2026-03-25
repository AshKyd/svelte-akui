<script lang="ts">
	import { type Snippet } from 'svelte';

	interface Props {
		/** The main label text. */
		label: string;
		/** Optional supplementary text or snippet. */
		extra?: string | Snippet;
		/** Additional CSS classes. */
		class?: string;
	}

	let { label, extra, class: className = '' }: Props = $props();
</script>

<div class="akui-control-header {className}">
	<span class="akui-control-header-label">{label}</span>
	{#if extra}
		<span class="akui-control-header-extra">
			{#if typeof extra === 'string'}
				{extra}
			{:else}
				{@render extra()}
			{/if}
		</span>
	{/if}
</div>

<style>
	.akui-control-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
	}

	.akui-control-header-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--akui-fg-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.akui-control-header-extra {
		font-size: 0.75rem;
		color: var(--akui-fg-secondary);
	}
</style>
