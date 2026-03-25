<script lang="ts">
	import { getContext, type Snippet } from 'svelte';
	import { INPUT_GROUP_CONTEXT, type InputGroupContext } from './context.ts';

	export interface Props {
		/** Label for the field. */
		label?: string;
		/** Type of input. Defaults to 'text'. */
		type?:
			| 'text'
			| 'email'
			| 'password'
			| 'tel'
			| 'url'
			| 'search'
			| 'number'
			| 'date'
			| 'textarea'
			| 'select'
			| 'color';
		/** Placeholder text. */
		placeholder?: string;
		/** Optional size override. Falls back to group context. */
		size?: 'small' | 'medium' | 'large';
		/** Value of the field. */
		value?: unknown;
		/** Optional hint text below the field. */
		hint?: string;
		/** Whether the field is required. */
		required?: boolean;
		/** Whether the field is readonly. */
		readonly?: boolean;
		/** Whether the field is disabled. */
		disabled?: boolean;
		/** If type="select", the options to display. */
		options?: Array<{ value: string; label: string }>;
		/** Snippet for custom content (overrides input). */
		children?: Snippet;
		/** Additional CSS classes for the field container. */
		class?: string;
		/** Inline styles for the field container. */
		style?: string;
		/** Spread remaining attributes to the input element. */
		[key: string]: unknown;
	}

	let {
		label,
		type = 'text',
		placeholder,
		size,
		value = $bindable(),
		hint,
		required = false,
		disabled = false,
		readonly = false,
		options = [],
		children,
		class: className = '',
		style = '',
		...rest
	}: Props = $props();

	const groupContext = getContext<InputGroupContext>(INPUT_GROUP_CONTEXT);
	const inheritedSize = $derived(groupContext?.size ?? 'medium');
	const inJoinedGroup = $derived(groupContext?.joined ?? false);

	const effectiveSize = $derived(size ?? inheritedSize);
</script>

<div class="akui-field {className}" {style}>
	{#if label && !inJoinedGroup}
		<label for={rest.id as string}>{label}</label>
	{:else if inJoinedGroup}
		<span class="akui-sr-only">{label}</span>
	{/if}

	{#if children}
		{@render children()}
	{:else if type === 'textarea'}
		<textarea
			class={effectiveSize}
			{placeholder}
			bind:value
			{required}
			{readonly}
			{disabled}
			aria-label={inJoinedGroup ? label : undefined}
			{...rest}
		></textarea>
	{:else if type === 'select'}
		<select
			class={effectiveSize}
			bind:value
			{disabled}
			aria-label={inJoinedGroup ? label : undefined}
			{...rest}
		>
			{#if placeholder}
				<option value="" disabled selected>{placeholder}</option>
			{/if}
			{#each options as option (option.value)}
				<option value={option.value}>{option.label}</option>
			{/each}
		</select>
	{:else}
		<input
			{type}
			class={effectiveSize}
			{placeholder}
			bind:value
			{required}
			{readonly}
			{disabled}
			aria-label={inJoinedGroup ? label : undefined}
			{...rest}
		/>
	{/if}

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

	.akui-field input,
	.akui-field select,
	.akui-field textarea {
		appearance: none;
		border: 1px solid var(--akui-border-input);
		border-radius: var(--akui-radius-m);
		color: var(--akui-fg);
		font-family: inherit;
		outline: none;
		transition: all 0.2s ease;
		box-shadow: var(--akui-glow-inset-top), var(--akui-glow-inset-bottom);
		background-color: var(--akui-bg);
		box-sizing: border-box;
		width: 100%;
		line-height: 1;

		/* Medium (Default) */
		height: 2.25rem;
		padding: 0 0.75rem;
		font-size: 0.9375rem;
	}

	input:focus,
	select:focus,
	textarea:focus {
		border-color: var(--akui-bg-accent);
		box-shadow:
			0 0 0 2px rgba(var(--akui-bg-accent-rgb), 0.2),
			var(--akui-glow-inset-top),
			var(--akui-glow-inset-bottom);
	}

	.akui-field :is(input, select, textarea):disabled {
		background-color: var(--akui-bg-secondary);
		color: var(--akui-fg-secondary);
		cursor: not-allowed;
		opacity: 0.8;
	}

	/* Sizing Variants */
	.akui-field :is(input, select).small {
		height: 1.75rem;
		padding: 0 0.5rem;
		font-size: 0.8rem;
		border-radius: var(--akui-radius-s);
	}

	.akui-field :is(input, select).large {
		height: 3rem;
		padding: 0 1.5rem;
		font-size: 1.1rem;
		border-radius: var(--akui-radius-l);
	}

	.akui-field textarea {
		min-height: 5rem;
		height: auto;
		padding: 0.5rem 0.75rem;
		line-height: 1.5;
		resize: vertical;
	}

	.akui-field textarea.small {
		min-height: 4rem;
		padding: 0.375rem 0.5rem;
	}

	.akui-field textarea.large {
		min-height: 8rem;
		padding: 0.75rem 1rem;
	}

	.akui-field select {
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23666' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 0.75rem center;
		padding-right: 2.5rem;
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
	}
</style>
