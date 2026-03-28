<script lang="ts">
	import { getContext } from 'svelte';
	import { INPUT_GROUP_CONTEXT, type InputGroupContext } from '../context.ts';
	import '../input.css';

	export interface Props {
		/** Value of the textarea. */
		value?: string | null;
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
		/** Additional CSS classes for the textarea. */
		class?: string;
		/** Spread remaining attributes to the textarea element. */
		[key: string]: unknown;
	}

	let {
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
</script>

<textarea
	class="akui-input-base {effectiveSize} {className}"
	{placeholder}
	bind:value
	{required}
	{readonly}
	{disabled}
	{...rest}
></textarea>
