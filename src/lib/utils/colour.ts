import type { AkuiColour } from '../hooks/themeStore.svelte.js';

/** Accent punch used when a colour sets no `chroma`; matches the fallback in `theme.css`. */
export const DEFAULT_CHROMA = 0.21;

/** Named accents offered by `AccentPicker`. Hues are oklch angles. */
export const ACCENT_PRESETS: { id: string; label: string; colour: AkuiColour }[] = [
	{ id: 'blue', label: 'Blue', colour: { hue: 263 } },
	{ id: 'purple', label: 'Purple', colour: { hue: 300 } },
	{ id: 'pink', label: 'Pink', colour: { hue: 350 } },
	{ id: 'red', label: 'Red', colour: { hue: 27 } },
	{ id: 'orange', label: 'Orange', colour: { hue: 55 } },
	{ id: 'yellow', label: 'Yellow', colour: { hue: 95, chroma: 0.19 } },
	{ id: 'green', label: 'Green', colour: { hue: 150 } },
	{ id: 'graphite', label: 'Graphite', colour: { hue: 263, chroma: 0.02, tint: 0.3 } }
];

/** Undoes the sRGB transfer curve for one 0-1 channel. */
const toLinear = (channel: number) =>
	channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;

/**
 * Converts `#rrggbb` (or `#rgb`) to an `AkuiColour` with the same hue and chroma, so a native colour
 * input can drive a theme. Returns `null` for anything that isn't a hex colour.
 */
export function colourFromHex(hex: string): AkuiColour | null {
	const [, digits = ''] = hex.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i) ?? [];
	if (!digits) return null;
	const full = digits.length === 3 ? [...digits].map((digit) => digit + digit).join('') : digits;
	const [r = 0, g = 0, b = 0] = [0, 2, 4].map((start) =>
		toLinear(Number.parseInt(full.slice(start, start + 2), 16) / 255)
	);

	// Linear sRGB -> OKLab (Björn Ottosson).
	const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
	const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
	const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
	const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
	const bAxis = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

	const chroma = Math.hypot(a, bAxis);
	const hue = ((Math.atan2(bAxis, a) * 180) / Math.PI + 360) % 360;
	// A grey has no meaningful hue; keep the accent punchy only if the pick had colour in it.
	return chroma < 0.02
		? { hue: Math.round(hue), chroma: Math.round(chroma * 1000) / 1000, tint: 0.3 }
		: { hue: Math.round(hue), chroma: Math.min(0.3, Math.round(chroma * 1000) / 1000) };
}

/** A CSS colour for previewing an accent, e.g. a swatch. */
export function accentSwatch({ hue, chroma = DEFAULT_CHROMA }: AkuiColour, lightness = 0.6): string {
	return `oklch(${lightness} ${chroma} ${hue})`;
}
