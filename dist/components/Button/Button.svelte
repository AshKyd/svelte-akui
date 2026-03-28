<script lang="ts">
	import { getContext, type Snippet } from 'svelte';
	import Icon from '../Icon/Icon.svelte';
	import { INPUT_GROUP_CONTEXT, type InputGroupContext } from '../Input/context.js';

	interface Props {
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
		/** The content to render inside the button (overrides label) */
		children?: Snippet;
		/** The onclick event handler */
		onclick?: (event: MouseEvent) => void;
		/** Additional CSS classes for the button. */
		class?: string;
		/** Bindable reference to the underlying button element. */
		element?: HTMLButtonElement;
		/** Spread remaining attributes to the button element. */
		[key: string]: unknown;
	}

	let {
		variant = 'regular',
		size = 'medium',
		label,
		icon,
		iconPosition = 'left',
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
</script>

<button
	type="button"
	class="akui-btn {variant} {effectiveSize === 'medium' ? '' : effectiveSize} {isIconOnly
		? 'icon-only'
		: ''} {className}"
	aria-label={isIconOnly ? label : undefined}
	bind:this={element}
	{onclick}
	{...rest}
>
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
</button>
