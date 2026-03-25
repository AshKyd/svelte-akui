<script lang="ts">
	import { getContext, type Snippet } from 'svelte';
	import { INPUT_GROUP_CONTEXT, type InputGroupContext } from '../context.js';
	import '../input.css';

	export interface Props {
		/** Label for the field. */
		label?: string;
		/** Optional hint text below the field. */
		hint?: string;
		/** Whether the field is required. */
		required?: boolean;
		/** The input control to render inside the field. */
		children: Snippet;
		/** ID of the input element (for label association). */
		for?: string;
		/** Additional CSS classes for the container. */
		class?: string;
		/** Inline styles for the container. */
		style?: string;
	}

	let {
		label,
		hint,
		required = false,
		children,
		for: id,
		class: className = '',
		style = ''
	}: Props = $props();

	const groupContext = getContext<InputGroupContext>(INPUT_GROUP_CONTEXT);
	const inJoinedGroup = $derived(groupContext?.joined ?? false);
</script>

<div class="akui-field {className}" {style}>
	{#if label && !inJoinedGroup}
		<label for={id}>
			{label}
			{#if required}<span class="akui-required" aria-hidden="true">*</span>{/if}
		</label>
	{:else if inJoinedGroup && label}
		<span class="akui-sr-only">{label}</span>
	{/if}

	{@render children()}

	{#if hint && !inJoinedGroup}
		<p class="akui-field-hint">{hint}</p>
	{/if}
</div>

<style>
	.akui-field {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
	}

	.akui-field-hint {
		font-size: 0.75rem;
		margin-top: 0.25rem;
		color: var(--akui-fg-secondary);
	}

	label {
		font-size: 0.875rem;
		font-weight: 500;
		margin-bottom: 0.375rem;
		color: var(--akui-fg-secondary);
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
	}

	.akui-required {
		color: #ef4444;
	}

	.akui-sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}
</style>
