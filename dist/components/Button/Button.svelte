<script lang="ts">
	import { getContext, type Snippet } from 'svelte';
	import Icon from '../Icon/Icon.svelte';
	import Loader from '../Loader/Loader.svelte';
	import { INPUT_GROUP_CONTEXT, type InputGroupContext } from '../Input/context.js';

	interface Props {
		/** Optional URL to turn this button into a link. */
		href?: string;
		/** Is this the principal call to action? */
		variant?: 'regular' | 'accent';
		/** How large should the button be? */
		size?: 'small' | 'medium' | 'large';
		/** Button contents (ignored if iconPosition is 'only') */
		label?: string;
		/** The name of the icon to display */
		icon?: string;
		/** Where to place the icon relative to the text */
		iconPosition?: 'left' | 'right' | 'only';
		/** Should a loading spinner be shown? (Disables interaction) */
		loading?: boolean;
		/** The content to render inside the button (overrides label) */
		children?: Snippet;
		/** The onclick event handler */
		onclick?: (event: MouseEvent) => void;
		/** Additional CSS classes for the button. */
		class?: string;
		/** Bindable reference to the underlying element. */
		element?: HTMLElement;
		/** Spread remaining attributes to the element. */
		[key: string]: unknown;
	}

	let {
		href,
		variant = 'regular',
		size = 'medium',
		label,
		icon,
		iconPosition = 'left',
		loading = false,
		children,
		onclick,
		class: className = '',
		element = $bindable(),
		...rest
	}: Props = $props();

	const groupContext = getContext<InputGroupContext>(INPUT_GROUP_CONTEXT);
	const inheritedSize = $derived.by(() => groupContext?.size ?? 'medium');

	let isIconOnly = $derived.by(() => iconPosition === 'only' || (!label && !children && !!icon));

	// Use our size if specified (not default), otherwise fall back to group size
	const effectiveSize = $derived.by(() => (size !== 'medium' ? size : inheritedSize));

	const commonClasses = $derived(
		`akui-btn ${variant} ${effectiveSize === 'medium' ? '' : effectiveSize} ${isIconOnly ? 'icon-only' : ''} ${loading ? 'loading' : ''} ${className}`
	);
</script>

{#snippet content()}
	{#if loading}
		<div class="akui-btn-loader">
			<Loader size="1.2em" />
		</div>
	{/if}

	<div class="akui-btn-inner" class:opacity-0={loading}>
		{#if icon && iconPosition !== 'right'}
			<Icon name={icon} />
		{/if}

		{#if !isIconOnly}
			{#if children}
				{@render children()}
			{:else}
				{label}
			{/if}
		{/if}

		{#if icon && iconPosition === 'right'}
			<Icon name={icon} />
		{/if}
	</div>
{/snippet}

{#if href}
	<a
		{href}
		class={commonClasses}
		aria-label={isIconOnly ? label : undefined}
		aria-busy={loading ? 'true' : undefined}
		bind:this={element as HTMLAnchorElement}
		{onclick}
		{...rest}
	>
		{@render content()}
	</a>
{:else}
	<button
		type="button"
		class={commonClasses}
		aria-label={isIconOnly ? label : undefined}
		aria-busy={loading ? 'true' : undefined}
		disabled={loading || rest.disabled ? true : undefined}
		bind:this={element as HTMLButtonElement}
		{onclick}
		{...rest}
	>
		{@render content()}
	</button>
{/if}

<style>
	/* Ensure anchor buttons behave like buttons */
	:global(.akui-btn) {
		position: relative;
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		appearance: none;
		border: none;
		font-family: inherit;
		box-sizing: border-box;
		transition: var(--akui-transition-theme);
	}

	/* Reset link color inheritance and decoration */
	a.akui-btn {
		color: inherit;
		text-decoration: none !important;
	}

	.akui-btn-loader {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.akui-btn-inner {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		transition: opacity 0.2s;
	}

	.akui-btn-inner.opacity-0 {
		opacity: 0;
		pointer-events: none;
	}
</style>
