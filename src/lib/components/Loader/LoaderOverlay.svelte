<script lang="ts">
	import Loader from './Loader.svelte';

	/**
	 * @component LoaderOverlay
	 * A centered loader overlay component for containers or full-page coverage.
	 */

	interface Props {
		/** Size of the spinner within the overlay. */
		size?: string | number;
		/** Colour of the spinner. */
		colour?: string;
		/** Accessible label for the spinner. */
		label?: string;
		/** Backdrop opacity (0 to 1). Defaults to 0.5. */
		opacity?: number;
		/** Backdrop colour. Defaults to "var(--akui-bg)". */
		backdrop?: string;
		/** Additional CSS classes */
		class?: string;
		/** Spread remaining attributes to the container */
		[key: string]: unknown;
	}

	let {
		size = '2rem',
		colour = 'var(--akui-bg-accent)',
		label,
		opacity = 0.5,
		backdrop = 'var(--akui-bg)',
		class: className = '',
		...rest
	}: Props = $props();
</script>

<div
	class="akui-loader-overlay {className}"
	style:background-color={backdrop}
	style:opacity
	{...rest}
>
	<Loader {size} {colour} {label} />
</div>

<style>
	.akui-loader-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10;
		pointer-events: all;
	}
</style>
