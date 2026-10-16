<script lang="ts">
	import { type Snippet } from 'svelte';
	import { ControlItemText } from '../ControlGroup/index.js';
	import { useMenu } from './index.js';

	interface Props {
		/** Optional icon name (Bootstrap Icon). */
		icon?: string;
		/** The text or content to display. */
		label?: string;
		/** Optional onclick handler. */
		onclick?: (event: MouseEvent) => void;
		/** Snippet for custom content (overrides label). */
		children?: Snippet;
		/** Item density. Defaults to the parent `Menu`'s `size`. */
		size?: 'small' | 'large';
		/**
		 * Shows a checkbox or radio on the right and gives the item the matching ARIA role
		 * (`menuitemcheckbox` / `menuitemradio`) and `aria-checked`.
		 */
		controlType?: 'checkbox' | 'radio';
		/** Whether the checkbox or radio is checked. Only used with `controlType`. */
		checked?: boolean;
		/** Shows the keyboard focus style without DOM focus (see `ControlItemText`). */
		highlighted?: boolean;
		/** Additional CSS classes. */
		class?: string;
		/** Spread remaining attributes. */
		[key: string]: unknown;
	}

	let {
		icon,
		label,
		onclick,
		children: customContent,
		size,
		controlType,
		checked = false,
		class: className = '',
		...rest
	}: Props = $props();

	const menu = useMenu();
	const resolvedSize = $derived(size ?? menu?.size ?? 'large');

	// Screen readers need the role to know a menu row is a choice, and the state to read it out.
	// The `akui-menu-choice` class makes the drawn control display-only (see the style below).
	const controlProps = $derived(
		controlType
			? {
					controlType,
					checked,
					role: controlType === 'radio' ? 'menuitemradio' : 'menuitemcheckbox',
					'aria-checked': checked
				}
			: {}
	);
	const itemClass = $derived(
		[className, controlType && 'akui-menu-choice'].filter(Boolean).join(' ')
	);

	function handleClick(e: MouseEvent) {
		if (onclick) onclick(e);
		// A radio or checkbox is a setting, not an action: the menu stays open so the new state is
		// visible and the next option can be changed too.
		if (menu && !controlType) menu.close();
	}
</script>

{#if customContent}
	<ControlItemText
		{icon}
		{label}
		size={resolvedSize}
		onclick={handleClick}
		class={itemClass}
		{...controlProps}
		{...rest}
	>
		{@render customContent()}
	</ControlItemText>
{:else}
	<ControlItemText
		{icon}
		{label}
		size={resolvedSize}
		onclick={handleClick}
		class={itemClass}
		{...controlProps}
		{...rest}
	/>
{/if}

<style>
	/*
	 * The radio or checkbox is only a picture of the state, driven by `checked`. Left clickable, a
	 * radio checks itself without telling the parent, so two radios in a menu both showed as chosen
	 * (they share no group). Letting clicks fall through to the row means one handler decides.
	 */
	:global(.akui-menu-choice .akui-choice) {
		pointer-events: none;
	}
</style>
