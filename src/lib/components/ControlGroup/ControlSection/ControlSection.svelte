<script lang="ts">
	import { type Snippet } from 'svelte';
	import Icon from '../../Icon/Icon.svelte';

	interface Props {
		/** The title/label of the section. */
		title: string;
		/** Optional icon name (Bootstrap Icon). */
		icon?: string;
		/** Optional icon snippet for custom icon rendering. */
		iconSnippet?: Snippet;
		/** The content of the section (e.g. ControlGroup, fields). */
		children: Snippet;
		/** Additional CSS classes. */
		class?: string;
		/** Spread remaining attributes. */
		[key: string]: unknown;
	}

	let { title, icon, iconSnippet, children, class: className = '', ...rest }: Props = $props();
</script>

<section class="akui-control-section {className}" {...rest}>
	<header class="akui-control-section-header">
		{#if iconSnippet}
			{@render iconSnippet()}
		{:else if icon}
			<Icon name={icon} size="1.2em" class="akui-control-section-icon" />
		{/if}
		<h3 class="akui-control-section-title">{title}</h3>
	</header>
	<div class="akui-control-section-content">
		{@render children()}
	</div>
</section>

<style>
	.akui-control-section {
		display: flex;
		flex-direction: column;
		width: 100%;
		margin-bottom: 2.5rem;
	}

	.akui-control-section-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1.25rem;
		color: var(--akui-fg-secondary);
	}

	.akui-control-section-title {
		font-size: 0.875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin: 0;
	}

	:global(.akui-control-section-icon) {
		flex-shrink: 0;
	}
</style>
