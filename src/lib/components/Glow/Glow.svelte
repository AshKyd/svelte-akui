<script lang="ts">
	interface Props {
		/** Sunken (inner) glow instead of the raised (outer) one, e.g. for a pressed or selected control. */
		inset?: boolean;
	}

	let { inset = false }: Props = $props();
</script>

<div class="akui-glow" class:inset aria-hidden="true"></div>

<style>
	.akui-glow {
		position: absolute;
		inset: 0;
		pointer-events: none;
		box-shadow: var(--akui-shadow-glow);
		border-radius: inherit;
		z-index: 10;
	}

	/* The exact inverse of the raised glow: a dark 1px line on top, a light one below. Same as inputs. */
	.akui-glow.inset {
		box-shadow: var(--akui-shadow-sunken);
	}
</style>
