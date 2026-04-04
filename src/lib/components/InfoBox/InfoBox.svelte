<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import Icon from '../Icon/Icon.svelte';

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
		/** The variant of the info box. */
		variant?: 'info' | 'warning' | 'error';
		/** Optional icon name. */
		icon?: string;
		/** Optional custom icon snippet. */
		iconSnippet?: Snippet;
		/** Optional title text. */
		title?: string | Snippet;
		/** Optional trailing action snippet. */
		action?: Snippet;
		/** Main content for the info box. */
		children?: Snippet;
		/** Additional CSS classes. */
		class?: string;
		/** The HTML element to use. Defaults to 'div'. */
		tag?: keyof HTMLElementTagNameMap;
		/** Spread remaining attributes. */
		[key: string]: unknown;
	}

	let {
		variant = 'info',
		icon,
		iconSnippet,
		title,
		action,
		children,
		class: className = '',
		tag = 'div',
		...rest
	}: Props = $props();

	// Default icons for variants if none provided
	let defaultIcon = $derived.by(() => {
		if (icon) return icon;
		if (variant === 'warning') return 'exclamation-triangle';
		if (variant === 'error') return 'exclamation-octagon';
		return 'info-circle';
	});
</script>

<svelte:element this={tag} class="akui-infobox bespoke {variant} {className}" {...rest}>
	<div class="akui-infobox-header">
		<div class="akui-infobox-leading">
			{#if iconSnippet}
				{@render iconSnippet()}
			{:else}
				<Icon name={defaultIcon} size={20} />
			{/if}
		</div>

		<div class="akui-infobox-body">
			{#if title}
				<div class="akui-infobox-title">
					{#if typeof title === 'string'}
						{title}
					{:else}
						{@render title()}
					{/if}
				</div>
			{/if}
			{#if children}
				<div class="akui-infobox-content">
					{@render children()}
				</div>
			{/if}
		</div>

		{#if action}
			<div class="akui-infobox-action">
				{@render action()}
			</div>
		{/if}
	</div>
</svelte:element>

<style>
	.akui-infobox {
		position: relative;
		overflow: hidden;
		border-radius: var(--akui-radius-m);
		padding: 1rem 1.25rem;
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border: 1px solid rgba(var(--akui-fg-rgb), 0.08);
		background: rgba(var(--akui-fg-rgb), 0.03);
		transition: var(--akui-transition-theme);
	}

	:global([data-theme='dark']) .akui-infobox {
		border-color: rgba(255, 255, 255, 0.05);
		background: rgba(255, 255, 255, 0.02);
	}

	.akui-infobox-header {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.akui-infobox-leading {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		color: var(--akui-fg-secondary);
		transition: color 0.3s ease;
	}

	.akui-infobox-body {
		flex-grow: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.akui-infobox-title {
		font-weight: 700;
		font-size: 0.9375rem;
		margin-bottom: 0.125rem;
		color: var(--akui-fg);
	}

	.akui-infobox-content {
		font-size: 0.875rem;
		color: var(--akui-fg-secondary);
		line-height: 1.5;
	}

	.akui-infobox-action {
		flex-shrink: 0;
		display: flex;
		align-items: center;
	}

	/* Variants */
	.akui-infobox.info {
		border-left: 4px solid var(--akui-bg-accent);
	}
	.akui-infobox.info .akui-infobox-leading {
		color: var(--akui-bg-accent);
	}

	.akui-infobox.warning {
		border-left: 4px solid #f59e0b;
		background: rgba(245, 158, 11, 0.05);
	}
	.akui-infobox.warning .akui-infobox-leading {
		color: #f59e0b;
	}

	.akui-infobox.error {
		border-left: 4px solid #ef4444;
		background: rgba(239, 68, 68, 0.05);
	}
	.akui-infobox.error .akui-infobox-leading {
		color: #ef4444;
	}

	:global([data-theme='dark']) .akui-infobox.warning {
		background: rgba(245, 158, 11, 0.1);
	}
	:global([data-theme='dark']) .akui-infobox.error {
		background: rgba(239, 68, 68, 0.1);
	}
</style>
