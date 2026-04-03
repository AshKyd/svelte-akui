<script lang="ts">
	import { getContext } from 'svelte';
	import { INPUT_GROUP_CONTEXT, type InputGroupContext } from '../context.js';
	import '../input.css';

	export interface Props {
		/** Type of input (text, email, password, tel, url, search, number, date, color). Defaults to 'text'. */
		type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search' | 'number' | 'date' | 'color';
		/** Value of the input. */
		value?: string | number | null;
		/** Placeholder text. */
		placeholder?: string;
		/** Optional size override. Falls back to group context. */
		size?: 'small' | 'medium' | 'large';
		/** Whether the field is required. */
		required?: boolean;
		/** Whether the field is readonly. */
		readonly?: boolean;
		/** Whether the field is disabled. */
		disabled?: boolean;
		/** Additional CSS classes for the input. */
		class?: string;
		/** Spread remaining attributes to the input element. */
		[key: string]: unknown;
	}

	let {
		type = 'text',
		value = $bindable(),
		placeholder,
		size,
		required = false,
		disabled = false,
		readonly = false,
		class: className = '',
		...rest
	}: Props = $props();

	const groupContext = getContext<InputGroupContext>(INPUT_GROUP_CONTEXT);
	const inheritedSize = $derived.by(() => groupContext?.size ?? 'medium');

	const effectiveSize = $derived.by(() => size ?? inheritedSize);

	let inputEl = $state<HTMLInputElement>();

	/** Focuses the input element. */
	export function focus() {
		inputEl?.focus();
	}
</script>

<input
	bind:this={inputEl}
	{type}
	class="akui-input-base {effectiveSize} {className}"
	{placeholder}
	bind:value
	{required}
	{readonly}
	{disabled}
	{...rest}
/>
