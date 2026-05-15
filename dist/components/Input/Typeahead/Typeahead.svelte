<script lang="ts">
	import { untrack } from 'svelte';
	import Badge from '../../Badge/Badge.svelte';
	import '../input.css';

	interface Props {
		/** Array of selected string values. */
		value?: string[];
		/** Suggestion list for the typeahead. */
		values?: { value: string; label: string }[];
		/** Whether to allow arbitrary text values not in the suggestions. */
		allowFreetext?: boolean;
		/** Placeholder text shown when empty. */
		placeholder?: string;
		/** Whether the field is disabled. */
		disabled?: boolean;
		/** Size of the field. */
		size?: 'small' | 'medium' | 'large';
		/** Label text (used for aria-labelledby). */
		label?: string;
		/** Callback when values change. */
		onChange?: (value: string[]) => void;
		/** Additional CSS classes for the container. */
		class?: string;
		/** ID for the input and datalist. */
		id?: string;
	}

	let {
		value = $bindable([]),
		values = [],
		allowFreetext = false,
		placeholder = '',
		disabled = false,
		size = 'medium',
		label,
		onChange,
		class: className = '',
		id = 'akui-typeahead-' + Math.random().toString(36).slice(2, 9)
	}: Props = $props();

	let inputValue = $state('');
	let inputRef = $state<HTMLInputElement>();
	let announcement = $state('');

	// Map values to labels for display
	let selectedLabels = $derived.by(() => {
		return value.map((v) => {
			const found = values.find((opt) => opt.value === v);
			return found ? found.label : v;
		});
	});

	function addValue(val: string) {
		const trimmed = val.trim();
		if (!trimmed) return;

		// Check if it's already in the selected values
		if (value.includes(trimmed)) {
			inputValue = '';
			return;
		}

		// If it's a known value, use its value, otherwise use the label if allowFreetext
		const found = values.find((opt) => opt.label === trimmed || opt.value === trimmed);
		const toAdd = found ? found.value : (allowFreetext ? trimmed : null);

		if (toAdd && !value.includes(toAdd)) {
			value = [...value, toAdd];
			announcement = `Added ${found ? found.label : toAdd}`;
			onChange?.(value);
		}
		inputValue = '';
	}

	function removeValue(index: number) {
		const label = selectedLabels[index];
		value = value.filter((_, i) => i !== index);
		announcement = `Removed ${label}`;
		onChange?.(value);
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (disabled) return;

		if (e.key === ',' && allowFreetext) {
			e.preventDefault();
			addValue(inputValue);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			addValue(inputValue);
		} else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
			removeValue(value.length - 1);
		}
	}

	// Watch for datalist selections
	$effect(() => {
		if (!inputValue) return;
		
		const found = values.find((opt) => opt.label === inputValue);
		if (found) {
			untrack(() => {
				addValue(found.label);
			});
		}
	});
</script>

<div class="akui-sr-only" aria-live="polite">
	{announcement}
</div>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="akui-input-base akui-typeahead-container {size} {className}"
	class:disabled
	onclick={() => inputRef?.focus()}
	role="group"
	aria-labelledby={label ? `${id}-label` : undefined}
>
	<ul class="akui-typeahead-badges" id="{id}-selected" aria-label="Selected items">
		{#each selectedLabels as label, i}
			<li class="akui-typeahead-item">
				<Badge
					label={label}
					colour="auto"
					size={size === 'large' ? 'medium' : 'small'}
					onClose={() => removeValue(i)}
				/>
			</li>
		{/each}
		<li class="akui-typeahead-input-item">
			<input
				bind:this={inputRef}
				bind:value={inputValue}
				placeholder={value.length === 0 ? placeholder : ''}
				{disabled}
				list="{id}-list"
				onkeydown={handleKeyDown}
				class="akui-typeahead-input"
				{id}
				role="combobox"
				aria-autocomplete="list"
				aria-expanded="false"
				aria-haspopup="listbox"
				aria-controls="{id}-list"
				aria-describedby="{id}-selected"
			/>
		</li>
	</ul>
</div>

<datalist id="{id}-list">
	{#each values as opt}
		<option value={opt.label}></option>
	{/each}
</datalist>

<style>
	.akui-typeahead-container {
		height: auto;
		min-height: 2.25rem;
		padding: 4px 8px;
		display: flex;
		align-items: center;
		cursor: text;
	}

	.akui-typeahead-container.small {
		min-height: 1.75rem;
		padding: 2px 6px;
	}

	.akui-typeahead-container.large {
		min-height: 3rem;
		padding: 6px 12px;
	}

	.akui-typeahead-badges {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		width: 100%;
		align-items: center;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.akui-typeahead-input-item {
		flex: 1;
		display: flex;
		align-items: center;
	}

	.akui-typeahead-input {
		border: none !important;
		outline: none !important;
		background: transparent !important;
		box-shadow: none !important;
		width: 100%;
		min-width: 120px;
		height: 1.75rem;
		padding: 0;
		color: inherit;
		font-family: inherit;
		font-size: inherit;
	}

	.akui-typeahead-input:disabled {
		cursor: not-allowed;
	}

	.disabled {
		cursor: not-allowed;
	}
</style>
