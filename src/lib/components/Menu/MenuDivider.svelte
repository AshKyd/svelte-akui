<script lang="ts">
	import Divider from '../Divider/Divider.svelte';

	interface Props {
		/** Vertical margin size. Defaults to 's' for menus. */
		margin?: 'none' | 's' | 'm' | 'l';
		/** Additional CSS classes. */
		class?: string;
	}

	let { margin = 's', class: className = '' }: Props = $props();
</script>

<li role="separator" class="akui-menu-divider {className}">
	<Divider {margin} />
</li>

<style>
	.akui-menu-divider {
		display: block;
		list-style: none;
		padding: 0;
	}
</style>
