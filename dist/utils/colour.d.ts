import type { AkuiColour } from '../hooks/themeStore.svelte.js';
/** Accent punch used when a colour sets no `chroma`; matches the fallback in `theme.css`. */
export declare const DEFAULT_CHROMA = 0.21;
/** Named accents offered by `AccentPicker`. Hues are oklch angles. */
export declare const ACCENT_PRESETS: {
    id: string;
    label: string;
    colour: AkuiColour;
}[];
/**
 * Converts `#rrggbb` (or `#rgb`) to an `AkuiColour` with the same hue and chroma, so a native colour
 * input can drive a theme. Returns `null` for anything that isn't a hex colour.
 */
export declare function colourFromHex(hex: string): AkuiColour | null;
/** A CSS colour for previewing an accent, e.g. a swatch. */
export declare function accentSwatch({ hue, chroma }: AkuiColour, lightness?: number): string;
