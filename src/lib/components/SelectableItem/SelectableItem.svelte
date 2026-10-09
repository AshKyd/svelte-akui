<script lang="ts">
	/**
	 * @component SelectableItem
	 * A selectable card of any content, backed by a real radio button or checkbox so it works in
	 * regular forms (`name`, `value`, `required`, reset, submit) and keeps native keyboard and
	 * screen-reader behaviour: arrow keys inside a radio group, Space on a checkbox.
	 *
	 * It supplies only the behaviour and the feedback: hover tint, pressed look, an inset glow
	 * when selected and a `:focus-visible` ring. The design inside, and any border or background,
	 * belongs to the caller (give it a `class`; the selected state is exposed as `data-checked`).
	 */
	import type { Snippet } from 'svelte';
	import Glow from '../Glow/Glow.svelte';

	interface Props {
		/** `radio` picks one item of a `name` group; `checkbox` toggles independently. */
		type?: 'radio' | 'checkbox';
		/** Radio only: the `value` of the selected item in the group. Bind it with `bind:group`. */
		group?: string;
		/** Checkbox only: whether the item is ticked. */
		checked?: boolean;
		/** Submitted with the form when the item is selected. Required for radios. */
		value?: string;
		/** Form field name. Radios sharing a `name` form one group. */
		name?: string;
		/** Stops the item being changed or submitted. */
		disabled?: boolean;
		/** Called when the user changes the selection. */
		onchange?: (event: Event) => void;
		/** Additional CSS classes for the outer element. */
		class?: string;
		/** The item's contents. */
		children: Snippet;
		/** Spread onto the underlying input (e.g. `aria-label`, `required`, `form`). */
		[key: string]: unknown;
	}

	let {
		type = 'radio',
		group = $bindable(),
		checked = $bindable(false),
		value,
		name,
		disabled = false,
		onchange,
		class: className = '',
		children,
		...rest
	}: Props = $props();

	const isChecked = $derived(type === 'radio' ? group === value : checked);
</script>

<label class="akui-selectable {className}" class:disabled data-checked={isChecked}>
	<!-- Two branches: Svelte needs a static `type` on an input that uses two-way binding. -->
	{#if type === 'radio'}
		<input type="radio" bind:group {value} {name} {disabled} {onchange} {...rest} />
	{:else}
		<input type="checkbox" bind:checked {value} {name} {disabled} {onchange} {...rest} />
	{/if}
	{@render children()}
	<!-- Raised glow normally; sunken with an accent edge once selected. -->
	<Glow inset={isChecked} />
</label>

<style>
	.akui-selectable {
		position: relative; /* Anchors the input, the hover tint and the Glow. */
		display: block;
		overflow: hidden;
		border-radius: var(--akui-radius-m);
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		transition: transform 0.1s ease;
	}

	.akui-selectable.disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	/*
	 * The real input covers the whole item, invisibly: clicks land on it, and it keeps focus and
	 * form state without a custom control. Hidden with opacity, not display, so it stays focusable.
	 */
	input {
		position: absolute;
		inset: 0;
		z-index: 11;
		width: 100%;
		height: 100%;
		margin: 0;
		opacity: 0;
		cursor: inherit;
	}

	/* Hover tint from the theme's own hover token, so it suits any design inside. */
	.akui-selectable::after {
		content: '';
		position: absolute;
		inset: 0;
		z-index: 9;
		background: var(--akui-bg-hover);
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.2s ease;
	}

	.akui-selectable:not(.disabled):hover::after {
		opacity: 1;
	}

	/* Pressed in, like `.akui-btn:active`. Selected items rest in this state. */
	.akui-selectable:not(.disabled):active,
	.akui-selectable[data-checked='true'] {
		transform: translateY(1px);
	}

	.akui-selectable :global(.akui-glow) {
		transition: box-shadow 0.2s ease;
	}

	/*
	 * Selected also glows inward in the accent colour. It sits on the Glow overlay, not the item,
	 * because opaque contents would paint over an inset shadow on the item itself.
	 */
	.akui-selectable[data-checked='true'] :global(.akui-glow) {
		box-shadow:
			inset 0 2px 4px rgba(0, 0, 0, 0.1),
			inset 0 0 6px 0.5px rgba(var(--akui-bg-accent-rgb), 0.55);
	}

	.akui-selectable:has(input:focus-visible) {
		outline: 2px solid var(--akui-bg-accent-focus);
		outline-offset: 2px;
	}
</style>
