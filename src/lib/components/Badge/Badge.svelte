<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from '../Icon/Icon.svelte';
	import MSRand from 'msrand';

	const COLOURS = ['green', 'blue', 'orange', 'pink', 'purple', 'amber'] as const;

	interface Props {
		/** Optional URL to turn this badge into a link. */
		href?: string;
		/** The label text. Used for seeding auto-color and as fallback content. */
		label?: string;
		/** 
		 * Optional color. 'auto' picks a stable color based on the label.
		 * Defaults to 'blue'.
		 */
		colour?: 'blue' | 'green' | 'orange' | 'pink' | 'purple' | 'amber' | 'auto';
		/** The size of the badge. */
		size?: 'x-small' | 'small' | 'medium' | 'large';
		/** Optional icon to display. */
		icon?: string;
		/** The snippet to render (overrides label for display). */
		children?: Snippet;
		/** Additional CSS classes. */
		class?: string;
		/** Optional callback for when the badge is closed. */
		onClose?: () => void;
		/** Spread remaining attributes. */
		[key: string]: unknown;
	}

	let {
		href,
		label = '',
		colour = 'blue',
		size = 'medium',
		icon,
		children,
		class: className = '',
		onClose,
		...rest
	}: Props = $props();

	// Stable auto-color logic
	const effectiveColour = $derived.by(() => {
		if (colour !== 'auto') return colour;
		if (!label) return 'blue'; // Fallback to default blue
		
		const rng = new MSRand(label);
		return COLOURS[rng.rand() % COLOURS.length];
	});
</script>

{#snippet badge_inner()}
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
	{:else if label}
		<span class="akui-badge-text">
			{label}
		</span>
	{/if}
	{#if onClose}
		<button
			type="button"
			class="akui-badge-close"
			onclick={(e) => {
				e.stopPropagation();
				e.preventDefault();
				onClose();
			}}
			aria-label="Remove"
		>
			<Icon
				name="x"
				size={size === 'x-small' ? 10 : size === 'small' ? 12 : 14}
			/>
		</button>
	{/if}
{/snippet}

{#if href}
	<a
		{href}
		class="akui-badge bespoke {size} {className}"
		class:no-close={!onClose}
		class:has-colour={!!effectiveColour}
		style={effectiveColour ? `--badge-bg: var(--akui-color-${effectiveColour}-bg); --badge-fg: var(--akui-color-${effectiveColour}-fg); --badge-border: var(--akui-color-${effectiveColour}-border);` : ''}
		{...rest}
	>
		{@render badge_inner()}
	</a>
{:else}
	<div
		class="akui-badge bespoke {size} {className}"
		class:no-close={!onClose}
		class:has-colour={!!effectiveColour}
		style={effectiveColour ? `--badge-bg: var(--akui-color-${effectiveColour}-bg); --badge-fg: var(--akui-color-${effectiveColour}-fg); --badge-border: var(--akui-color-${effectiveColour}-border);` : ''}
		{...rest}
	>
		{@render badge_inner()}
	</div>
{/if}

<style>
	.akui-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--akui-radius-m);
		padding: 0 0 0 0.75rem;
		font-weight: 600;
		font-size: 0.8125rem;
		--badge-h: 1.75rem; /* Define height variable */
		min-height: var(--badge-h);
		transition: var(--akui-transition-theme);
		white-space: nowrap;
		box-sizing: border-box;
		text-decoration: none;
		border: 1px solid rgba(0, 0, 0, 0.1);
		overflow: hidden;

		/* Default Tactile Bezel */
		background: var(--badge-bg);
		color: var(--badge-fg);
		border-color: var(--badge-border);
		box-shadow: 
			inset 0 1px 0 rgba(255, 255, 255, 0.15), 
			inset 0 -1px 0 rgba(0, 0, 0, 0.05);
	}

	:global([data-theme='dark']) .akui-badge {
		border-color: rgba(255, 255, 255, 0.05);
		box-shadow: 
			inset 0 1px 0 rgba(255, 255, 255, 0.05), 
			inset 0 -1px 0 rgba(0, 0, 0, 0.2);
	}

	.akui-badge.no-close {
		padding-right: 0.75rem;
	}

	.akui-badge-text {
		color: inherit;
		margin-right: 0.4rem;
	}

	.akui-badge.no-close .akui-badge-text {
		margin-right: 0;
	}

	/* Only apply margin to icons in the main content area, not the close button */
	:global(.akui-badge > .akui-icon) {
		margin-right: 0.3rem;
	}

	.akui-badge-close {
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		border-left: 1px solid rgba(0, 0, 0, 0.1);
		padding: 0;
		margin: 0;
		color: inherit;
		cursor: pointer;
		opacity: 0.7;
		transition: all 0.2s ease;
		align-self: stretch;
		flex-shrink: 0;
		width: var(--badge-h); /* Force square using height variable */
	}

	.akui-badge-close:hover {
		opacity: 1;
		background: rgba(255, 255, 255, 0.5); /* Whiter on hover */
	}

	.akui-badge-close:active {
		background: rgba(0, 0, 0, 0.1); /* Softer dark on active */
		box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
	}

	/* Sizing */
	.akui-badge.x-small {
		padding-left: 0.5rem;
		font-size: 0.65rem;
		--badge-h: 1.25rem;
		border-radius: var(--akui-radius-s);
	}

	.akui-badge.x-small.no-close {
		padding-right: 0.5rem;
	}

	.akui-badge.small {
		padding-left: 0.75rem;
		font-size: 0.75rem;
		--badge-h: 1.5rem;
		border-radius: var(--akui-radius-s);
	}

	.akui-badge.small.no-close {
		padding-right: 0.75rem;
	}

	.akui-badge.large {
		padding-left: 1.5rem;
		font-size: 1rem;
		--badge-h: 2.75rem;
		border-radius: var(--akui-radius-l);
	}

	.akui-badge.large.no-close {
		padding-right: 1.5rem;
	}

	/* Interactive states (if link) */
	a.akui-badge:hover {
		border-color: var(--akui-bg-accent);
		transform: translateY(-1px);
		text-decoration: none;
	}
</style>
