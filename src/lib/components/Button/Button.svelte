<script lang="ts">
	import { type Snippet } from 'svelte';
	import Icon from '../Icon/Icon.svelte';

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
		/** Spread remaining attributes to the button element. */
		[key: string]: any;
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
		...rest
	}: Props = $props();

	let isIconOnly = $derived(iconPosition === 'only' || (!label && !children && !!icon));
</script>

<button
	type="button"
	class="akui-btn {variant} {size === 'medium' ? '' : size} {isIconOnly
		? 'icon-only'
		: ''} {className}"
	aria-label={isIconOnly ? label : undefined}
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
