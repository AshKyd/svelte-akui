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

	/* Same pressed shadow as `.akui-btn.regular:active` in theme.css. */
	.akui-glow.inset {
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
	}
</style>
