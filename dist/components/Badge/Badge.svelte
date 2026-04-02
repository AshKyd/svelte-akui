<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from '../Icon/Icon.svelte';

	interface Props {
		/** Optional URL to turn this badge into a link. */
		href?: string;
		/** The variant of the badge. */
		variant?: 'regular' | 'accent';
		/** The size of the badge. */
		size?: 'x-small' | 'small' | 'medium' | 'large';
		/** Whether to show the glassmorphism background. Defaults to false. */
		hasBackground?: boolean;
		/** Optional icon to display. */
		icon?: string;
		/** The label text or snippet. */
		children?: Snippet;
		/** Additional CSS classes. */
		class?: string;
		/** Spread remaining attributes. */
		[key: string]: unknown;
	}

	let {
		href,
		variant = 'regular',
		size = 'medium',
		hasBackground = false,
		icon,
		children,
		class: className = '',
		...rest
	}: Props = $props();
</script>

{#snippet content()}
	<div class="akui-badge-content">
		{#if icon}
			<Icon
				name={icon}
				size={size === 'x-small' ? 10 : size === 'small' ? 12 : 16}
			/>
		{/if}
		{#if children}
			<span class="akui-badge-text">
				{@render children()}
			</span>
		{/if}
	</div>
{/snippet}

{#if href}
	<a
		{href}
		class="akui-badge {variant} {size} {hasBackground ? 'has-bg' : ''} {className}"
		{...rest}
	>
		{@render content()}
	</a>
{:else}
	<div class="akui-badge {variant} {size} {hasBackground ? 'has-bg' : ''} {className}" {...rest}>
		{@render content()}
	</div>
{/if}

<style>
	.akui-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--akui-radius-m);
		padding: 0 1rem;
		font-weight: 600;
		font-size: 0.9375rem;
		min-height: 2.25rem;
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		transition: var(--akui-transition-theme);
		white-space: nowrap;
		background: transparent;
		box-sizing: border-box;
		text-decoration: none;
	}

	.akui-badge-content {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	/* Text Gradient Logic */
	.akui-badge-text {
		background: linear-gradient(
			to bottom,
			rgba(var(--akui-fg-rgb), 1),
			rgba(var(--akui-fg-rgb), 0.8)
		);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.akui-badge.accent .akui-badge-text {
		background: linear-gradient(
			to bottom,
			rgba(var(--akui-bg-accent-rgb), 0.9),
			rgba(var(--akui-bg-accent-rgb), 0.7)
		);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	/* Regular variant */
	.akui-badge.regular {
		color: var(--akui-fg);
		border-color: rgba(var(--akui-fg-rgb), 0.1);
		box-shadow: 0 0 10px rgba(var(--akui-fg-rgb), 0.05);
	}

	.akui-badge.regular.has-bg {
		background: rgba(var(--akui-fg-rgb), 0.05);
		text-shadow: 0 0 8px rgba(var(--akui-fg-rgb), 0.1);
	}

	:global([data-theme='dark']) .akui-badge.regular {
		border-color: rgba(255, 255, 255, 0.05);
	}

	/* Accent variant */
	.akui-badge.accent {
		color: var(--akui-bg-accent);
		border-color: rgba(var(--akui-bg-accent-rgb), 0.3);
		box-shadow: 0 0 12px rgba(var(--akui-bg-accent-rgb), 0.15);
	}

	.akui-badge.accent.has-bg {
		background: rgba(var(--akui-bg-accent-rgb), 0.15);
		text-shadow: 0 0 10px rgba(var(--akui-bg-accent-rgb), 0.3);
	}

	/* Sizing */
	.akui-badge.x-small {
		padding: 0 0.5rem;
		font-size: 0.65rem;
		min-height: 1.25rem;
		border-radius: var(--akui-radius-s);
	}

	.akui-badge.small {
		padding: 0 0.75rem;
		font-size: 0.75rem;
		min-height: 1.5rem;
		border-radius: var(--akui-radius-s);
	}

	.akui-badge.x-small .akui-badge-content {
		gap: 0.2rem;
	}

	.akui-badge.small .akui-badge-content {
		gap: 0.25rem;
	}

	.akui-badge.large {
		padding: 0 1.5rem;
		font-size: 1rem;
		min-height: 2.75rem;
		border-radius: var(--akui-radius-l);
	}

	.akui-badge.large .akui-badge-content {
		gap: 0.75rem;
	}

	/* Interactive states (if link) */
	a.akui-badge:hover {
		border-color: var(--akui-bg-accent);
		transform: translateY(-1px);
	}
</style>
