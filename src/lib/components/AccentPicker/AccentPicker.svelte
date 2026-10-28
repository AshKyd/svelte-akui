<script lang="ts">
	import { getThemeStore, type AkuiColour } from '../../hooks/themeStore.svelte.js';
	import { ACCENT_PRESETS, accentSwatch, colourFromHex } from '../../utils/colour.js';

	interface Props {
		/** Swatches to offer. Defaults to `ACCENT_PRESETS`. */
		presets?: { id: string; label: string; colour: AkuiColour }[];
		/** Show the hue slider for picking any colour. */
		showSlider?: boolean;
		/** Show a native colour input, whose hue and punch become the accent. */
		showColourInput?: boolean;
		/** Accessible label for the swatch group. */
		label?: string;
		/** Called after the accent changes (`null` = back to the theme's own colour). */
		onchange?: (colour: AkuiColour | null) => void;
	}

	let {
		presets = ACCENT_PRESETS,
		showSlider = true,
		showColourInput = true,
		label = 'Accent colour',
		onchange
	}: Props = $props();

	const store = getThemeStore();

	/** The accent in effect: the user's pick, otherwise the theme's own colour. */
	const current = $derived(store.colour);

	const isSame = (a: AkuiColour | undefined, b: AkuiColour) =>
		a?.hue === b.hue && (a?.chroma ?? null) === (b.chroma ?? null);

	function pick(colour: AkuiColour | null) {
		store.setAccent(colour);
		onchange?.(colour);
	}

	/** The slider keeps the current chroma and tint, so dragging it never turns Graphite colourful. */
	function pickHue(hue: number) {
		pick({ ...(current ?? {}), hue });
	}

	function pickFromColourInput(hex: string) {
		const colour = colourFromHex(hex);
		if (colour) pick(colour);
	}
</script>

<div class="accent-picker">
	<div class="swatches" role="group" aria-label={label}>
		{#each presets as preset (preset.id)}
			<button
				type="button"
				class="swatch bespoke"
				style:--swatch={accentSwatch(preset.colour)}
				aria-pressed={store.accent !== null && isSame(store.accent, preset.colour)}
				aria-label={preset.label}
				title={preset.label}
				onclick={() => pick(preset.colour)}
			></button>
		{/each}
		{#if showColourInput}
			<input
				class="colour-input bespoke"
				type="color"
				aria-label="Custom accent colour"
				value="#6a4cff"
				oninput={(event) => pickFromColourInput(event.currentTarget.value)}
			/>
		{/if}
		{#if store.accent}
			<button type="button" class="reset" onclick={() => pick(null)}>Reset</button>
		{/if}
	</div>

	{#if showSlider}
		<input
			class="hue-slider bespoke"
			type="range"
			min="0"
			max="360"
			step="1"
			aria-label="Accent hue"
			value={current?.hue ?? 263}
			oninput={(event) => pickHue(Number(event.currentTarget.value))}
		/>
	{/if}
</div>

<style>
	.accent-picker {
		display: flex;
		flex-direction: column;
		gap: var(--akui-space-s);
	}

	.swatches {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--akui-space-s);
	}

	.swatch {
		width: 1.75rem;
		height: 1.75rem;
		padding: 0;
		border: 2px solid transparent;
		border-radius: 50%;
		background: var(--swatch);
		box-shadow: var(--akui-shadow-shiny);
		cursor: pointer;
		transition: transform 0.12s ease;
	}

	.swatch:hover {
		transform: scale(1.1);
	}

	/* A ring in the page colour, then the foreground, so it reads on any swatch. */
	.swatch[aria-pressed='true'] {
		border-color: var(--akui-bg);
		outline: 2px solid var(--akui-fg);
	}

	.swatch:focus-visible,
	.colour-input:focus-visible {
		outline: 3px solid var(--akui-bg-accent);
		outline-offset: 2px;
	}

	.colour-input {
		width: 1.75rem;
		height: 1.75rem;
		padding: 0;
		border: 1px solid var(--akui-border-input);
		border-radius: 50%;
		background: none;
		cursor: pointer;
	}

	.colour-input::-webkit-color-swatch-wrapper {
		padding: 0;
	}

	.colour-input::-webkit-color-swatch {
		border: none;
		border-radius: 50%;
	}

	.colour-input::-moz-color-swatch {
		border: none;
		border-radius: 50%;
	}

	.reset {
		margin-inline-start: var(--akui-space-xs);
		padding: 0;
		border: none;
		background: none;
		color: var(--akui-fg-secondary);
		font-size: 0.8rem;
		text-decoration: underline;
		cursor: pointer;
	}

	/* The track shows the hue wheel at the accent's own lightness and chroma. */
	.hue-slider {
		appearance: none;
		width: 100%;
		max-width: 16rem;
		height: 0.5rem;
		padding: 0;
		border: none;
		border-radius: 999px;
		background: linear-gradient(
			in oklch longer hue to right,
			oklch(0.65 0.2 0),
			oklch(0.65 0.2 360)
		);
		cursor: pointer;
	}

	.hue-slider::-webkit-slider-thumb {
		appearance: none;
		width: 1.1rem;
		height: 1.1rem;
		border: 2px solid var(--akui-bg);
		border-radius: 50%;
		background: var(--akui-bg-accent);
		box-shadow: var(--akui-shadow-shiny);
	}

	.hue-slider::-moz-range-thumb {
		width: 1.1rem;
		height: 1.1rem;
		border: 2px solid var(--akui-bg);
		border-radius: 50%;
		background: var(--akui-bg-accent);
		box-shadow: var(--akui-shadow-shiny);
	}
</style>
