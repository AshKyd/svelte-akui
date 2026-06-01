<script lang="ts">
	import { type Snippet } from 'svelte';
	import Button from '../Button/Button.svelte';

	interface Props {
		/** Optional URL to turn this button into a link. */
		href?: string;
		/** Is this the principal call to action? */
		variant?: 'regular' | 'accent' | 'ghost';
		/** How large should the button be? */
		size?: 'small' | 'medium' | 'large';
		radius?: 'regular' | 'full';
		/** Button contents (ignored if iconPosition is 'only') */
		label?: string;
		/** The name of the icon to display */
		icon?: string;
		/** Where to place the icon relative to the text */
		iconPosition?: 'left' | 'right' | 'only';
		/** The content to render inside the button (overrides label) */
		children?: Snippet;
		/** Bindable reference to the underlying element. */
		element?: HTMLElement;

		/** The current status of the feedback button. Can be bound to. */
		status?: 'idle' | 'loading' | 'success' | 'error';
		/** Success icon name. Defaults to 'check2'. */
		successIcon?: string;
		/** Error icon name. Defaults to 'exclamation-circle'. */
		errorIcon?: string;
		/** How long to show the success/error state before resetting back to idle (in ms). Defaults to 2000. */
		resetDelay?: number;
		/** Label to read when success is reached. Defaults to 'Success'. */
		successAriaLabel?: string;
		/** Label to read when error is reached. Defaults to 'Error'. */
		errorAriaLabel?: string;
		/** Label to read when loading is reached. Defaults to 'Loading'. */
		loadingAriaLabel?: string;

		/** The onclick event handler. If it returns a Promise, status is managed automatically. */
		onclick?: (event: MouseEvent) => void | Promise<unknown>;
		/** Additional CSS classes for the button. */
		class?: string;
		/** Spread remaining attributes to the element. */
		[key: string]: unknown;
	}

	let {
		href,
		variant = 'regular',
		size = 'medium',
		radius = 'regular',
		label,
		icon,
		iconPosition = 'left',
		children,
		element = $bindable(),

		status = $bindable('idle'),
		successIcon = 'check2',
		errorIcon = 'exclamation-circle',
		resetDelay = 2000,
		successAriaLabel = 'Success',
		errorAriaLabel = 'Error',
		loadingAriaLabel = 'Loading',

		onclick,
		class: className = '',
		...rest
	}: Props = $props();

	let internalStatus = $state<'idle' | 'loading' | 'success' | 'error'>('idle');
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	// Use bound status if provided and not default, otherwise use internalStatus
	// We check if the prop has been modified or bound from outside
	let currentStatus = $derived(status !== 'idle' ? status : internalStatus);

	let liveMessage = $state('');

	$effect(() => {
		if (currentStatus === 'loading') {
			liveMessage = loadingAriaLabel;
		} else if (currentStatus === 'success') {
			liveMessage = successAriaLabel;
		} else if (currentStatus === 'error') {
			liveMessage = errorAriaLabel;
		} else {
			liveMessage = '';
		}
	});

	async function handleClick(event: MouseEvent) {
		if (currentStatus !== 'idle') {
			event.preventDefault();
			return;
		}

		if (onclick) {
			const result = onclick(event);
			if (result instanceof Promise) {
				internalStatus = 'loading';
				status = 'loading';
				try {
					await result;
					internalStatus = 'success';
					status = 'success';
				} catch (err) {
					internalStatus = 'error';
					status = 'error';
				} finally {
					if (timeoutId) clearTimeout(timeoutId);
					timeoutId = setTimeout(() => {
						internalStatus = 'idle';
						status = 'idle';
					}, resetDelay);
				}
			}
		}
	}

	let currentIcon = $derived.by(() => {
		if (currentStatus === 'success') return successIcon;
		if (currentStatus === 'error') return errorIcon;
		return icon;
	});

	let isIconOnly = $derived.by(() => iconPosition === 'only' || (!label && !children && !!currentIcon));

	let computedAriaLabel = $derived.by(() => {
		if (isIconOnly) {
			const baseLabel = label || '';
			if (currentStatus === 'success') return `${baseLabel} - ${successAriaLabel}`;
			if (currentStatus === 'error') return `${baseLabel} - ${errorAriaLabel}`;
			return baseLabel;
		}
		return undefined;
	});
</script>

<Button
	{href}
	{variant}
	{size}
	{radius}
	{label}
	icon={currentIcon}
	{iconPosition}
	loading={currentStatus === 'loading'}
	bind:element
	onclick={handleClick}
	class="akui-feedback-btn status-{currentStatus} {className}"
	aria-label={computedAriaLabel}
	disabled={currentStatus !== 'idle' ? true : undefined}
	{...rest}
>
	{#if children}
		{@render children()}
	{/if}
</Button>

<!-- Accessible Live Region for Screen Readers to announce status updates -->
<div class="sr-only" aria-live="polite">
	{liveMessage}
</div>

<style>
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	:global(.akui-feedback-btn.status-success) {
		color: var(--akui-fg-success, #155724) !important;
		background-color: var(--akui-bg-success, #d4edda) !important;
		border-color: var(--akui-border-success, #c3e6cb) !important;
	}

	:global(.akui-feedback-btn.status-error) {
		color: var(--akui-fg-danger, #721c24) !important;
		background-color: var(--akui-bg-danger, #f8d7da) !important;
		border-color: var(--akui-border-danger, #f5c6cb) !important;
	}
</style>
