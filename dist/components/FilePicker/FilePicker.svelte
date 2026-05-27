<script lang="ts">
	import { type Snippet } from 'svelte';
	import Button from '../Button/Button.svelte';

	interface Props {
		/** Accepted file types (e.g. 'image/*', '.pdf') */
		accept?: string;
		/** Allow selecting multiple files */
		multiple?: boolean;
		/** Visual variant style */
		variant?: 'regular' | 'accent' | 'ghost';
		/** Size of the button */
		size?: 'small' | 'medium' | 'large';
		/** Border radius style */
		radius?: 'regular' | 'full';
		/** Label text */
		label?: string;
		/** The name of the icon to display */
		icon?: string;
		/** Position of the icon relative to text */
		iconPosition?: 'left' | 'right' | 'only';
		/** Show a loading spinner and disable interaction */
		loading?: boolean;
		/** Disable the button */
		disabled?: boolean;
		/** Custom CSS classes */
		class?: string;
		/** Bindable reference to the underlying button element. */
		element?: HTMLButtonElement | HTMLAnchorElement;
		/** Callback triggered when files are selected */
		onchange?: (files: File[]) => void;
		/** Snippet content to override label */
		children?: Snippet;
		/** Spread remaining attributes to the hidden file input. */
		[key: string]: unknown;
	}

	let {
		accept,
		multiple = false,
		variant = 'regular',
		size = 'medium',
		radius = 'regular',
		label,
		icon,
		iconPosition = 'left',
		loading = false,
		disabled = false,
		class: className = '',
		element = $bindable(),
		onchange,
		children,
		...rest
	}: Props = $props();

	let fileInput: HTMLInputElement;

	function handleClick() {
		if (loading || disabled) return;
		fileInput?.click();
	}

	function handleFileChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const files = target.files ? Array.from(target.files) : [];
		onchange?.(files);
	}
</script>

<input
	type="file"
	bind:this={fileInput}
	{accept}
	{multiple}
	onchange={handleFileChange}
	style="display: none;"
	{...rest}
/>

<Button
	{variant}
	{size}
	{radius}
	{label}
	{icon}
	{iconPosition}
	{loading}
	{disabled}
	class={className}
	bind:element
	onclick={handleClick}
	children={children}
/>
