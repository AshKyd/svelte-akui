<script lang="ts">
	/**
	 * @component Radio
	 * A styled native `<input type="radio">`. Radios sharing a `name` form one group with the
	 * browser's own arrow-key navigation. Bind `group` to the selected `value`.
	 */
	import { getContext, type Snippet } from 'svelte';
	import Glow from '../../Glow/Glow.svelte';
	import { INPUT_GROUP_CONTEXT, type InputGroupContext } from '../context.ts';
	import '../choice.css';

	export interface Props {
		/** The `value` of the selected radio in the group. Use with `bind:group`. */
		group?: string;
		/** Submitted with the form when selected. Required. */
		value: string;
		/** Label text. Use `children` instead for rich content. */
		label?: string;
		/** Optional size override. Falls back to group context. */
		size?: 'small' | 'medium' | 'large';
		/** Form field name. Radios sharing a `name` form one group. */
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
		group = $bindable(),
		value,
		label,
		size,
		name,
		required = false,
		disabled = false,
		class: className = '',
		children,
		...rest
	}: Props = $props();

	const groupContext = getContext<InputGroupContext>(INPUT_GROUP_CONTEXT);
	const effectiveSize = $derived(size ?? groupContext?.size ?? 'medium');
	const isSelected = $derived(group === value);

	let inputEl = $state<HTMLInputElement>();

	/** Focuses the input element. */
	export function focus() {
		inputEl?.focus();
	}
</script>

<label class="akui-choice radio {effectiveSize} {className}" class:disabled>
	<input
		bind:this={inputEl}
		bind:group
		type="radio"
		class="akui-choice-input bespoke"
		{value}
		{name}
		{required}
		{disabled}
		{...rest}
	/>
	<span class="akui-choice-box">
		<span class="dot"></span>
		<!-- Sunken while empty, raised once selected. -->
		<Glow inset={!isSelected} />
	</span>
	{#if children}
		<span class="akui-choice-label">{@render children()}</span>
	{:else if label}
		<span class="akui-choice-label">{label}</span>
	{/if}
</label>

<style>
	.radio {
		--akui-choice-radius: 50%;
	}

	.dot {
		width: 38%;
		height: 38%;
		border-radius: 50%;
		background-color: currentColor;
		transform: scale(0);
		transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.akui-choice-input:checked + .akui-choice-box .dot {
		transform: scale(1);
	}
</style>
