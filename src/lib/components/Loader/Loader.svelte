<script lang="ts">
	/**
	 * @component Loader
	 * A versatile circular spinner component for standalone use.
	 */

	interface Props {
		/** Size of the spinner (e.g. "1.5rem", "24px", 20) */
		size?: string | number;
		/** Colour of the spinner. Defaults to "currentColor". */
		colour?: string;
		/** Accessible label for the spinner. */
		label?: string;
		/** Additional CSS classes */
		class?: string;
		/** Spread remaining attributes to the container */
		[key: string]: unknown;
	}

	let {
		size = '1em',
		colour = 'currentColor',
		label = 'Loading...',
		class: className = '',
		...rest
	}: Props = $props();

	// Normalize size to include units if it's a number
	let computedSize = $derived.by(() => (typeof size === 'number' ? `${size}px` : size));
</script>

<span
	class="akui-loader {className}"
	role="progressbar"
	aria-label={label}
	style="font-size: {computedSize}; color: {colour};"
	{...rest}
></span>

<style>
	.akui-loader {
		display: inline-flex;
		box-sizing: border-box;
		width: 1em;
		height: 1em;
		border: 2px solid rgba(0, 0, 0, 0.1);
		border-top-color: currentColor;
		border-radius: 50%;
		animation: akui-spin 0.6s linear infinite;
		flex-shrink: 0;
	}

	:global([data-theme='dark']) .akui-loader {
		border-color: rgba(255, 255, 255, 0.1);
		border-top-color: currentColor;
	}

	@keyframes akui-spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
