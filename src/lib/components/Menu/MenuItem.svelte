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
		class: className = '',
		...rest
	}: Props = $props();

	const menu = useMenu();
	const resolvedSize = $derived(size ?? menu?.size ?? 'large');

	function handleClick(e: MouseEvent) {
		if (onclick) onclick(e);
		if (menu) menu.close();
	}
</script>

{#if customContent}
	<ControlItemText
		{icon}
		{label}
		size={resolvedSize}
		onclick={handleClick}
		class={className}
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
		class={className}
		{...rest}
	/>
{/if}
