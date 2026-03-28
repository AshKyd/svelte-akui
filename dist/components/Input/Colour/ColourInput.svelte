<script lang="ts">
	import { getContext } from 'svelte';
	import TextInput from '../Text/TextInput.svelte';
	import { INPUT_GROUP_CONTEXT, type InputGroupContext } from '../context.js';
	import '../input.css';

	export interface Props {
		/** Value of the colour input (hex string). */
		value?: string | null;
		/** Placeholder text. Defaults to '#000000'. */
		placeholder?: string;
		/** Optional size override. Falls back to group context. */
		size?: 'small' | 'medium' | 'large';
		/** Whether the field is required. */
		required?: boolean;
		/** Whether the field is disabled. */
		disabled?: boolean;
		/** Whether the field is readonly. */
		readonly?: boolean;
		/** Additional CSS classes. */
		class?: string;
		/** Spread remaining attributes to the input element. */
		[key: string]: unknown;
	}

	let {
		value = $bindable(),
		placeholder = '#000000',
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

	let colorInput: HTMLInputElement | undefined = $state();

	// Internal state for the text input to allow intermediate typing without strict hex validation
	let textValue = $state(value ?? '');

	// Sync textValue when external value changes
	$effect(() => {
		if (value !== null && value !== undefined && value !== textValue) {
			textValue = value;
		}
	});

	// Derived HEX for the native picker (must be #rrggbb)
	const pickerValue = $derived.by(() => {
		if (!textValue) return '#000000';
		let hex = textValue.replace('#', '');
		if (hex.length === 3) {
			hex = hex
				.split('')
				.map((c) => c + c)
				.join('');
		}
		if (hex.length === 6) {
			return `#${hex.toLowerCase()}`;
		}
		return '#000000';
	});

	function handleTextInput(e: Event) {
		const target = e.target as HTMLInputElement;
		const val = target.value;

		// Only update the bound value if it's a valid hex (3 or 6 chars, optional #)
		const hexMatch = val.match(/^#?([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/);
		if (hexMatch) {
			// Ensure it has the # prefix when updating the bound value
			value = val.startsWith('#') ? val : `#${val}`;
		}
	}

	function handlePickerInput(e: Event) {
		const target = e.target as HTMLInputElement;
		value = target.value;
		textValue = target.value;
	}

	function openPicker() {
		if (!disabled && !readonly && colorInput) {
			colorInput.click();
		}
	}
</script>

<div class="akui-colour-wrapper {effectiveSize} {className}">
	<TextInput
		bind:value={textValue}
		{placeholder}
		{size}
		{required}
		{disabled}
		{readonly}
		oninput={handleTextInput}
		class="akui-colour-input"
		{...rest}
	/>

	<button
		type="button"
		class="akui-colour-swatch"
		onclick={openPicker}
		style="background-color: {pickerValue}"
		tabindex="-1"
		aria-label="Select colour"
		{disabled}
	></button>

	<input
		bind:this={colorInput}
		type="color"
		class="akui-colour-hidden-picker"
		value={pickerValue}
		oninput={handlePickerInput}
		{disabled}
	/>
</div>

<style>
	.akui-colour-wrapper {
		position: relative;
		display: flex;
		align-items: center;
		width: 100%;
	}

	:global(.akui-colour-wrapper .akui-colour-input) {
		padding-left: 2.5rem !important;
	}

	.akui-colour-swatch {
		position: absolute;
		left: 0.5rem;
		top: 50%;
		transform: translateY(-50%);
		width: 1.5rem;
		height: 1.5rem;
		border-radius: var(--akui-radius-m);
		border: 1px solid var(--akui-border);
		cursor: pointer;
		padding: 0;
		transition: all 0.2s ease;
		box-shadow: var(--akui-shadow-sm);
	}

	.akui-colour-swatch:hover:not(:disabled) {
		transform: translateY(-50%) scale(1.1);
		border-color: var(--akui-border-hover);
	}

	.akui-colour-swatch:active:not(:disabled) {
		transform: translateY(-50%) scale(0.95);
	}

	.akui-colour-swatch:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}

	.akui-colour-hidden-picker {
		position: absolute;
		opacity: 0;
		pointer-events: none;
		width: 0;
		height: 0;
		visibility: hidden;
	}

	/* Adjust swatch size and position based on wrapper size */
	.akui-colour-wrapper.small .akui-colour-swatch {
		width: 1rem;
		height: 1rem;
		left: 0.375rem;
		border-radius: var(--akui-radius-s);
	}

	.akui-colour-wrapper.large .akui-colour-swatch {
		width: 2rem;
		height: 2rem;
		left: 0.75rem;
		border-radius: var(--akui-radius-l);
	}

	/* Update padding-left based on size */
	.akui-colour-wrapper.small :global(.akui-colour-input) {
		padding-left: 2.125rem !important;
	}

	.akui-colour-wrapper.large :global(.akui-colour-input) {
		padding-left: 3.5rem !important;
	}
</style>
