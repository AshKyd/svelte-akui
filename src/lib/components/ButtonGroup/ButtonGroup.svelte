<script lang="ts">
	import { type Snippet } from 'svelte';

	interface Props {
		/** Size of all buttons in the group. */
		size?: 'small' | 'medium' | 'large';
		/** The buttons to group together. */
		children: Snippet;
		/** Additional CSS classes. */
		class?: string;
		/** Spread remaining attributes to the group element. */
		[key: string]: any;
	}

	let {
		size = 'medium',
		children,
		class: className = '',
		...rest
	}: Props = $props();
</script>

<div
	class="akui-btn-group {size !== 'medium' ? size : ''} {className}"
	role="group"
	{...rest}
>
	{@render children()}
</div>
