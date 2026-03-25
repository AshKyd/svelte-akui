<script lang="ts">
	import Loader from './Loader.svelte';

	/**
	 * @component LoaderOverlay
	 * A centered loader overlay component for containers or full-page coverage.
	 */

	interface Props {
		/** Size of the spinner within the overlay. Defaults to '2rem'. */
		size?: string | number;
		/** Colour of the spinner. Defaults to 'var(--akui-bg-accent)'. */
		colour?: string;
		/** Accessible label for the spinner. */
		label?: string;
		/** Backdrop opacity (0 to 1). Defaults to 0.7. */
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
		opacity = 0.7,
		backdrop = 'var(--akui-bg)',
		class: className = '',
		...rest
	}: Props = $props();
</script>

<div class="akui-loader-overlay {className}" {...rest}>
	<div class="akui-loader-backdrop" style:background-color={backdrop} style:opacity></div>
	<div class="akui-loader-spinner">
		<Loader {size} {colour} {label} />
	</div>
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

	.akui-loader-backdrop {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.akui-loader-spinner {
		position: relative;
		z-index: 1;
	}
</style>
