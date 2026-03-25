<script lang="ts">
	import { type Snippet } from 'svelte';
	import { ControlButton } from '../Control/index.ts';

	interface Props {
		/** Optional icon name (Bootstrap Icon). */
		icon?: string;
		/** The text or content to display. */
		label?: string;
		/** Optional onclick handler. */
		onclick?: (event: MouseEvent) => void;
		/** Snippet for custom content (overrides label). */
		children?: Snippet;
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
		class: className = '',
		...rest
	}: Props = $props();
</script>

{#if customContent}
	<ControlButton {icon} {label} {onclick} class={className} {...rest}>
		{@render customContent()}
	</ControlButton>
{:else}
	<ControlButton {icon} {label} {onclick} class={className} {...rest} />
{/if}
