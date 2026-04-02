<script lang="ts">
	import { getContext } from 'svelte';
	import TextInput from '../Text/TextInput.svelte';
	import InputWithIcon from '../InputWithIcon.svelte';
	import Icon from '../../Icon/Icon.svelte';
	import { INPUT_GROUP_CONTEXT, type InputGroupContext } from '../context.ts';
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

<InputWithIcon size={effectiveSize} class={className}>
	<TextInput
		{type}
		bind:value
		{placeholder}
		{size}
		{required}
		{disabled}
		class="akui-password-input"
		{...rest}
	/>

	{#if toggleable}
		{#snippet right()}
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
		{/snippet}
	{/if}
</InputWithIcon>

<style>
	.akui-password-toggle {
		background: none;
		border: none;
		padding: 0.25rem;
		cursor: pointer;
		color: var(--akui-fg-secondary);
		display: flex;
		border-radius: var(--akui-radius-s);
		transition: all 0.2s ease;
		pointer-events: auto;
	}

	.akui-password-toggle:hover:not(:disabled) {
		color: var(--akui-fg);
		background-color: var(--akui-bg-secondary);
	}

	.akui-password-toggle:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}
</style>
