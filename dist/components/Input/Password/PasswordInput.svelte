<script lang="ts">
	import { getContext } from 'svelte';
	import TextInput from '../Text/TextInput.svelte';
	import Icon from '../../Icon/Icon.svelte';
	import { INPUT_GROUP_CONTEXT, type InputGroupContext } from '../context.js';
	import '../input.css';

	export interface Props {
		/** Value of the password input. */
		value?: string | null;
		/** Placeholder text. */
		placeholder?: string;
		/** Optional size override. */
		size?: 'small' | 'medium' | 'large';
		/** Whether the field is required. */
		required?: boolean;
		/** Whether to show the visibility toggle. Defaults to true. */
		toggleable?: boolean;
		/** Whether the field is disabled. */
		disabled?: boolean;
		/** Additional CSS classes. */
		class?: string;
		/** Spread remaining attributes to the input element. */
		[key: string]: unknown;
	}

	let {
		value = $bindable(),
		placeholder,
		size,
		required = false,
		toggleable = true,
		disabled = false,
		class: className = '',
		...rest
	}: Props = $props();

	let showPassword = $state(false);
	const type = $derived.by(() => (showPassword ? 'text' : 'password'));

	const groupContext = getContext<InputGroupContext>(INPUT_GROUP_CONTEXT);
	const inheritedSize = $derived.by(() => groupContext?.size ?? 'medium');
	const effectiveSize = $derived.by(() => size ?? inheritedSize);
</script>

<div class="akui-password-wrapper {effectiveSize}">
	<TextInput
		{type}
		bind:value
		{placeholder}
		{size}
		{required}
		{disabled}
		class="akui-password-input {className}"
		{...rest}
	/>
	{#if toggleable}
		<button
			type="button"
			class="akui-password-toggle"
			onclick={() => (showPassword = !showPassword)}
			tabindex="-1"
			aria-label={showPassword ? 'Hide password' : 'Show password'}
			{disabled}
		>
			<Icon name={showPassword ? 'eye-slash' : 'eye'} size="1rem" />
		</button>
	{/if}
</div>

<style>
	.akui-password-wrapper {
		position: relative;
		display: flex;
		align-items: center;
		width: 100%;
	}

	:global(.akui-password-wrapper .akui-password-input) {
		padding-right: 2.5rem !important;
	}

	.akui-password-toggle {
		position: absolute;
		right: 0.5rem;
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		padding: 0.25rem;
		cursor: pointer;
		color: var(--akui-fg-secondary);
		display: flex;
		border-radius: var(--akui-radius-s);
		transition: all 0.2s ease;
	}

	.akui-password-toggle:hover:not(:disabled) {
		color: var(--akui-fg);
		background-color: var(--akui-bg-secondary);
	}

	.akui-password-toggle:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	/* Adjust toggle position based on size */
	.akui-password-wrapper.small .akui-password-toggle {
		right: 0.375rem;
	}

	.akui-password-wrapper.large .akui-password-toggle {
		right: 1rem;
	}
</style>
