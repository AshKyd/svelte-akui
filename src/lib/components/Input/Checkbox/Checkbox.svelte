<script lang="ts">
	/**
	 * @component Checkbox
	 * A styled native `<input type="checkbox">`. Form name/value, reset, required validation,
	 * keyboard (Space) and screen-reader behaviour are the browser's own.
	 */
	import { getContext, type Snippet } from 'svelte';
	import Glow from '../../Glow/Glow.svelte';
	import CheckMark from './CheckMark.svelte';
	import { INPUT_GROUP_CONTEXT, type InputGroupContext } from '../context.ts';
	import '../choice.css';

	export interface Props {
		/** Whether the box is ticked. */
		checked?: boolean;
		/** Shows a dash instead of a tick, e.g. for a "select all" when only some items are chosen. */
		indeterminate?: boolean;
		/** Label text. Use `children` instead for rich content. */
		label?: string;
		/** Optional size override. Falls back to group context. */
		size?: 'small' | 'medium' | 'large';
		/** Submitted with the form when ticked. */
		value?: string;
		/** Form field name. */
		name?: string;
		/** Whether the field is required. */
		required?: boolean;
		/** Whether the field is disabled. */
		disabled?: boolean;
		/** Additional CSS classes for the outer label. */
		class?: string;
		/** Rich label content, shown instead of `label`. */
		children?: Snippet;
		/** Spread remaining attributes to the input element. */
		[key: string]: unknown;
	}

	let {
		checked = $bindable(false),
		indeterminate = $bindable(false),
		label,
		size,
		value,
		name,
		required = false,
		disabled = false,
		class: className = '',
		children,
		...rest
	}: Props = $props();

	const groupContext = getContext<InputGroupContext>(INPUT_GROUP_CONTEXT);
	const effectiveSize = $derived(size ?? groupContext?.size ?? 'medium');

	let inputEl = $state<HTMLInputElement>();

	/** Focuses the input element. */
	export function focus() {
		inputEl?.focus();
	}

	/** `indeterminate` is a DOM property only, so mirror it onto the element. */
	$effect(() => {
		if (inputEl) inputEl.indeterminate = indeterminate;
	});

	/** A user click always resolves the indeterminate state, as in native checkboxes. */
	function handleChange() {
		indeterminate = false;
	}
</script>

<label class="akui-choice {effectiveSize} {className}" class:disabled>
	<input
		bind:this={inputEl}
		bind:checked
		type="checkbox"
		class="akui-choice-input bespoke"
		{value}
		{name}
		{required}
		{disabled}
		onchange={handleChange}
		{...rest}
	/>
	<span class="akui-choice-box">
		<CheckMark />
		<!-- Sunken while empty, raised once on. -->
		<Glow inset={!checked && !indeterminate} />
	</span>
	{#if children}
		<span class="akui-choice-label">{@render children()}</span>
	{:else if label}
		<span class="akui-choice-label">{label}</span>
	{/if}
</label>
