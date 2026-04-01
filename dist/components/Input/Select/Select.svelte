<script lang="ts">
	import { ChevronDown } from 'svelte-bootstrap-icons';
	import { getContext } from 'svelte';
	import { INPUT_GROUP_CONTEXT } from '../context.js';
	import type { InputGroupContext } from '../context.js';
	import '../input.css';

	export interface Props {
		/** Value of the select. */
		value?: string | number | null;
		/** Options to display in the select. */
		options?: Array<{ value: string; label: string }>;
		/** Placeholder text (shown as disabled first option). */
		placeholder?: string;
		/** Optional size override. Falls back to group context. */
		size?: 'small' | 'medium' | 'large';
		/** Whether the field is disabled. */
		disabled?: boolean;
		/** Additional CSS classes for the select. */
		class?: string;
		/** Spread remaining attributes to the select element. */
		[key: string]: unknown;
	}

	let {
		value = $bindable(),
		options = [],
		placeholder,
		size,
		disabled = false,
		class: className = '',
		...rest
	}: Props = $props();

	const groupContext = getContext<InputGroupContext>(INPUT_GROUP_CONTEXT);
	const inheritedSize = $derived.by(() => groupContext?.size ?? 'medium');
	const effectiveSize = $derived.by(() => size ?? inheritedSize);

	const iconSize = $derived.by(() => {
		if (effectiveSize === 'small') return 12;
		if (effectiveSize === 'large') return 20;
		return 16;
	});
</script>

<div class="akui-select-container">
	<select class="akui-input-base {effectiveSize} {className}" bind:value {disabled} {...rest}>
		{#if placeholder}
			<option value="" disabled selected>{placeholder}</option>
		{/if}
		{#each options as option (option.value)}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>
	<div class="akui-select-arrow" aria-hidden="true">
		<ChevronDown width={iconSize} height={iconSize} color="currentColor" />
	</div>
</div>
