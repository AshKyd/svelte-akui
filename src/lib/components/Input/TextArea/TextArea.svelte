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
		/** Variant of the field. */
		variant?: 'regular' | 'ghost';
		/** Whether the field is required. */
		required?: boolean;
		/** Whether the field is readonly. */
		readonly?: boolean;
		/** Whether the field is disabled. */
		disabled?: boolean;
		/** Whether to automatically resize the height based on content. */
		autosize?: boolean;
		/** Additional CSS classes for the textarea. */
		class?: string;
		/** Spread remaining attributes to the textarea element. */
		[key: string]: unknown;
	}

	let {
		value = $bindable(),
		placeholder,
		size,
		variant = 'regular',
		required = false,
		disabled = false,
		readonly = false,
		autosize = false,
		class: className = '',
		...rest
	}: Props = $props();

	const groupContext = getContext<InputGroupContext>(INPUT_GROUP_CONTEXT);
	const inheritedSize = $derived.by(() => groupContext?.size ?? 'medium');
	const effectiveSize = $derived.by(() => size ?? inheritedSize);

	let inputEl = $state<HTMLTextAreaElement>();
	let clientWidth = $state<number>(0);

	$effect(() => {
		if (autosize && inputEl) {
			// Create a reactive dependency on value and clientWidth
			const _ = value;
			const __ = clientWidth;
			
			inputEl.style.height = 'auto';
			inputEl.style.height = `${inputEl.scrollHeight}px`;
		}
	});

	/** Focuses the textarea element. */
	export function focus() {
		inputEl?.focus();
	}
</script>

<textarea
	bind:this={inputEl}
	bind:clientWidth={clientWidth}
	class="akui-input-base {effectiveSize} {variant} {className}"
	{placeholder}
	bind:value
	{required}
	{readonly}
	{disabled}
	style:resize={autosize ? 'none' : undefined}
	{...rest}
></textarea>
