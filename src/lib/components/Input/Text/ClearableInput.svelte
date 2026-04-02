<script lang="ts">
	import { getContext } from 'svelte';
	import TextInput from './TextInput.svelte';
	import InputWithIcon from '../InputWithIcon.svelte';
	import Icon from '../../Icon/Icon.svelte';
	import { INPUT_GROUP_CONTEXT, type InputGroupContext } from '../context.ts';

	interface Props {
		/** Value of the input. */
		value?: string | null;
		/** Placeholder text. */
		placeholder?: string;
		/** Optional size override. */
		size?: 'small' | 'medium' | 'large';
		/** Whether the input is disabled. */
		disabled?: boolean;
		/** Additional CSS classes for the input. */
		class?: string;
		/** Spread remaining attributes to the input element. */
		[key: string]: unknown;
	}

	let {
		value = $bindable(''),
		placeholder,
		size,
		disabled = false,
		class: className = '',
		...rest
	}: Props = $props();

	const groupContext = getContext<InputGroupContext>(INPUT_GROUP_CONTEXT);
	const inheritedSize = $derived.by(() => groupContext?.size ?? 'medium');
	const effectiveSize = $derived.by(() => size ?? inheritedSize);

	let inputEl = $state<HTMLInputElement>();

	function handleClear() {
		value = '';
		inputEl?.focus();
	}
</script>

<InputWithIcon size={effectiveSize} class={className}>
	<TextInput
		bind:this={inputEl}
		bind:value
		{placeholder}
		{size}
		{disabled}
		{...rest}
	/>

	{#snippet right()}
		{#if value && !disabled}
			<button
				type="button"
				class="akui-clear-button"
				onclick={handleClear}
				aria-label="Clear input"
				tabindex="-1"
			>
				<Icon name="x" size="0.875rem" />
			</button>
		{/if}
	{/snippet}
</InputWithIcon>

<style>
	.akui-clear-button {
		background: none;
		border: none;
		padding: 0.25rem;
		cursor: pointer;
		color: var(--akui-fg-secondary);
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: auto;
		border-radius: var(--akui-radius-s);
		transition: all 0.2s ease;
		margin-right: -0.25rem;
	}

	.akui-clear-button:hover {
		color: var(--akui-fg);
		background-color: var(--akui-bg-secondary);
	}

	/* Adjust for focus or specific feedback if desired */
	.akui-clear-button:active {
		transform: scale(0.9);
	}
</style>
