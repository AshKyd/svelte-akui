<script lang="ts">
	import { type Snippet } from 'svelte';
	import Icon from '../../Icon/Icon.svelte';
	import Padding from '../../Padding/Padding.svelte';
	import Checkbox from '../../Input/Checkbox/Checkbox.svelte';
	import Radio from '../../Input/Radio/Radio.svelte';

	interface Props {
		/** Optional icon name (Bootstrap Icon). */
		icon?: string;
		/** The text or content to display. */
		label?: string;
		/** Optional onclick handler. */
		onclick?: (event: MouseEvent) => void;
		/** Snippet for custom content (overrides label). */
		children?: Snippet;
		/** ARIA role. Defaults to 'menuitem' if inside a menu. */
		role?: string;
		/** Additional CSS classes. */
		class?: string;
		/** Whether the item is currently selected/active. */
		selected?: boolean;
		/** Whether the checkbox or radio is checked. */
		checked?: boolean;
		/** Optional control type on the right hand side. */
		controlType?: 'checkbox' | 'radio';
		/** Item density. 'small' condenses padding, text and icon. Defaults to 'large'. */
		size?: 'small' | 'large';
		/**
		 * Shows the keyboard focus style without DOM focus, for lists where focus stays elsewhere
		 * (e.g. the editor's slash menu, which uses `aria-activedescendant`).
		 */
		highlighted?: boolean;
		/** Spread remaining attributes. */
		[key: string]: unknown;
	}

	let {
		icon,
		label,
		onclick,
		children,
		role = 'menuitem',
		class: className = '',
		selected = false,
		checked = $bindable(false),
		controlType,
		size = 'large',
		highlighted = false,
		...rest
	}: Props = $props();

	function handleContainerClick(event: MouseEvent) {
		// A radio can only be switched on by clicking it; picking the chosen one again keeps it chosen.
		if (controlType) {
			checked = controlType === 'radio' ? true : !checked;
		}
		if (onclick) {
			onclick(event);
		}
	}
</script>

<li role="none" class="akui-control-item-text-wrapper">
	<button
		type="button"
		{role}
		class="akui-control-item-text bespoke {className}"
		class:selected
		class:highlighted
		class:small={size === 'small'}
		onclick={handleContainerClick}
		{...rest}
	>
		<Padding size={size === 'small' ? 's' : 'm'} class="akui-control-item-text-inner">
			<div class="akui-control-item-text-content">
				{#if icon}
					<Icon
						name={icon}
						size={size === 'small' ? '1em' : '1.25em'}
						class="akui-control-item-text-icon"
					/>
				{/if}
				<span class="akui-control-item-text-label">
					{#if children}
						{@render children()}
					{:else}
						{label}
					{/if}
				</span>
				<!-- The row's own click toggles `checked`; the control stops its click reaching the row. -->
				{#if controlType === 'checkbox'}
					<Checkbox
						size={size === 'small' ? 'small' : 'medium'}
						bind:checked
						onclick={(e: MouseEvent) => e.stopPropagation()}
					/>
				{:else if controlType === 'radio'}
					<Radio
						size={size === 'small' ? 'small' : 'medium'}
						value="on"
						group={checked ? 'on' : undefined}
						onclick={(e: MouseEvent) => e.stopPropagation()}
						onchange={() => (checked = true)}
					/>
				{/if}
			</div>
		</Padding>
	</button>
</li>

<style>
	.akui-control-item-text-wrapper {
		display: block;
		list-style: none;
	}

	.akui-control-item-text {
		display: block;
		width: 100%;
		appearance: none;
		background: transparent;
		border: none;
		padding: 0;
		margin: 0;
		color: var(--akui-fg);
		text-align: left;
		cursor: pointer;
		transition:
			background-color 0.2s ease,
			color 0.2s ease;
		outline: none;
	}

	/* Touch devices need larger tap targets (48px+), so give the inner Padding more room. */
	@media (pointer: coarse) {
		.akui-control-item-text {
			--akui-space-m: 1.25rem;
		}

		.akui-control-item-text.small {
			--akui-space-s: 0.75rem;
		}
	}

	.akui-control-item-text:hover {
		background-color: var(--akui-bg-hover);
	}

	.akui-control-item-text:active {
		background-color: var(--akui-bg-button-hover);
	}

	/*
	 * `bespoke` keeps the global button focus outline (theme.css) off this element: it drew a second
	 * outline outside the inset ring, which the list's overflow then clipped into a double line.
	 */
	.akui-control-item-text:focus-visible,
	.akui-control-item-text.highlighted {
		background-color: var(--akui-bg-hover);
		box-shadow: inset 0 0 0 2px var(--akui-bg-accent);
	}
	
	.akui-control-item-text.selected {
		background-color: color-mix(in oklch, var(--akui-bg-accent) 10%, transparent);
		color: var(--akui-bg-accent);
		border-left: 3px solid var(--akui-bg-accent);
	}

	.akui-control-item-text-content {
		display: flex;
		align-items: center;
		gap: var(--akui-space-m);
	}

	.akui-control-item-text.small .akui-control-item-text-content {
		gap: var(--akui-space-s);
	}

	.akui-control-item-text.small .akui-control-item-text-label {
		font-size: 0.85rem;
	}

	.akui-control-item-text-label {
		flex: 1;
		font-size: 0.95rem;
		font-weight: 500;
	}

	:global(.akui-control-item-text-icon) {
		color: var(--akui-fg-secondary);
		transition: color 0.2s ease;
	}

	.akui-control-item-text:hover :global(.akui-control-item-text-icon) {
		color: var(--akui-fg);
	}

	.akui-control-item-text.selected :global(.akui-control-item-text-icon) {
		color: var(--akui-bg-accent);
	}
</style>
