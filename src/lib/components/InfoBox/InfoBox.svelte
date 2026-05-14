<script lang="ts">
	import { type Snippet } from 'svelte';
	import Icon from '../Icon/Icon.svelte';

	interface Props {
		/** The HTML element to use. Defaults to 'aside'. */
		tag?: keyof HTMLElementTagNameMap;
		/** The ARIA role. */
		role?: string;
		/** The variant of the info box. */
		variant?: 'info' | 'success' | 'warning' | 'error' | 'message';
		/** Whether to show the icon. If false, retains spacing. */
		showIcon?: boolean;
		/** Whether to strip outer borders and shadows for list usage. */
		naked?: boolean;
		/** Optional icon name override. */
		icon?: string;
		/** Optional custom icon snippet. */
		iconSnippet?: Snippet;
		/** Optional title text or snippet. */
		title?: string | Snippet;
		/** Optional trailing action snippet. */
		action?: Snippet;
		/** Main content for the info box. */
		children?: Snippet;
		/** Additional CSS classes. */
		class?: string;
		/** Optional callback for dismissing the info box. */
		onClose?: () => void;
		/** Spread remaining attributes. */
		[key: string]: unknown;
	}

	let {
		tag = 'aside',
		role,
		variant = 'info',
		showIcon = true,
		naked = false,
		icon,
		iconSnippet,
		title,
		action,
		children,
		class: className = '',
		onClose,
		...rest
	}: Props = $props();

	const DEFAULT_ICONS = {
		success: 'check-circle',
		warning: 'alert-triangle',
		error: 'alert-circle',
		message: '',
		info: 'info-circle-fill'
	} as const;

	const effectiveIcon = $derived(icon || DEFAULT_ICONS[variant] || DEFAULT_ICONS.info);
</script>

<svelte:element
	this={tag}
	{role}
	class="akui-infobox bespoke {variant} {className}"
	class:has-title={!!title}
	class:naked
	{...rest}
>
	<div class="akui-infobox-icon">
		{#if showIcon}
			{#if iconSnippet}
				{@render iconSnippet()}
			{:else if effectiveIcon}
				<Icon name={effectiveIcon} size={20} />
			{/if}
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

	{#if action || onClose}
		<div class="akui-infobox-trailing">
			{#if action}
				<div class="akui-infobox-action">
					{@render action()}
				</div>
			{/if}
			{#if onClose}
				<button
					type="button"
					class="akui-infobox-close"
					onclick={onClose}
					aria-label="Dismiss"
				>
					<Icon name="x" size={18} />
				</button>
			{/if}
		</div>
	{/if}
</svelte:element>

<style>
	.akui-infobox {
		display: flex;
		gap: 1rem;
		padding: 1rem 1.25rem;
		border-radius: var(--akui-radius-m);
		background: var(--box-bg);
		color: var(--box-fg);
		border: 1px solid var(--box-border);
		box-shadow: 
			inset 0 1px 0 rgba(255, 255, 255, 0.15), 
			inset 0 -1px 0 rgba(0, 0, 0, 0.05);
		transition: var(--akui-transition-theme);
		align-items: center; /* Centre by default (no title) */
	}

	/* Variant Colours */
	.akui-infobox.info {
		--box-bg: var(--akui-color-blue-bg);
		--box-fg: var(--akui-color-blue-fg);
		--box-border: var(--akui-color-blue-border);
	}
	.akui-infobox.success {
		--box-bg: var(--akui-color-green-bg);
		--box-fg: var(--akui-color-green-fg);
		--box-border: var(--akui-color-green-border);
	}
	.akui-infobox.warning {
		--box-bg: var(--akui-color-orange-bg);
		--box-fg: var(--akui-color-orange-fg);
		--box-border: var(--akui-color-orange-border);
	}
	.akui-infobox.error {
		--box-bg: var(--akui-color-pink-bg);
		--box-fg: var(--akui-color-pink-fg);
		--box-border: var(--akui-color-pink-border);
	}
	.akui-infobox.message {
		--box-bg: var(--akui-bg-input);
		--box-fg: var(--akui-fg-secondary);
		--box-border: var(--akui-border-input);
	}

	.akui-infobox.has-title {
		align-items: flex-start; /* Align to top if title is present */
	}

	.akui-infobox.naked {
		border: none;
		border-radius: 0;
	}

	:global([data-theme='dark']) .akui-infobox {
		border-color: rgba(255, 255, 255, 0.05);
		box-shadow: 
			inset 0 1px 0 rgba(255, 255, 255, 0.05), 
			inset 0 -1px 0 rgba(0, 0, 0, 0.2);
	}

	.akui-infobox-icon {
		width: 20px;
		height: 24px; /* Increased to match trailing actions */
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		color: inherit;
		opacity: 0.9;
	}

	.akui-infobox.has-title .akui-infobox-icon,
	.akui-infobox.has-title .akui-infobox-trailing {
		padding-top: 1px; /* Reduced since container is now larger */
	}

	.akui-infobox-body {
		flex-grow: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		justify-content: center; /* Centre content vertically in the body container */
	}

	.akui-infobox-title {
		font-weight: 700;
		font-size: 0.9375rem;
		color: inherit;
	}

	.akui-infobox-content {
		font-size: 0.875rem;
		line-height: 1.5;
		color: inherit;
		opacity: 0.9;
	}

	.akui-infobox-trailing {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-shrink: 0;
		height: 24px; /* Unified with icon container height */
	}

	.akui-infobox-action {
		flex-shrink: 0;
		display: flex;
		align-items: center;
	}

	.akui-infobox-close {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		border: 1px solid transparent;
		background: transparent;
		color: inherit;
		cursor: pointer;
		opacity: 0.7;
		border-radius: var(--akui-radius-s);
		transition: all 0.2s ease;
		padding: 0;
		position: relative;
	}

	.akui-infobox-close:hover,
	.akui-infobox-close:focus-visible {
		opacity: 1;
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.2);
		box-shadow: 
			inset 0 1px 0 rgba(255, 255, 255, 0.2),
			inset 0 -1px 0 rgba(0, 0, 0, 0.05),
			0 1px 2px rgba(0, 0, 0, 0.1);
		outline: none;
	}

	.akui-infobox-close:active {
		background: rgba(0, 0, 0, 0.05);
		border-color: rgba(0, 0, 0, 0.1);
		box-shadow: 
			inset 0 1px 2px rgba(0, 0, 0, 0.15),
			0 0 0 transparent;
		transform: translateY(0.5px);
	}
</style>
