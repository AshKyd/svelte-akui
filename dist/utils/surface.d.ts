/** Optional overrides for the background, text and edge of a chrome component (header, sidebar, panes). */
export interface SurfaceStyle {
    /** Any CSS background colour, e.g. 'transparent' or 'rgb(255 255 255 / 0.6)'. Defaults to the theme's `--akui-bg`. */
    background?: string;
    /** Any CSS text colour. Defaults to the theme's `--akui-fg`. */
    foreground?: string;
    /** Any CSS colour for the component's edge border. Defaults to the theme's `--akui-border-input`. */
    borderColour?: string;
    /** Any CSS `backdrop-filter` value, e.g. 'blur(12px) saturate(1.4)'. Defaults to none. */
    backdropFilter?: string;
}
/**
 * Mixes any `--akui-*` colour token with transparent, e.g. `alphaColour('bg', 0.25)` for a 25% opaque
 * `--akui-bg`. Use it for a `SurfaceStyle` field; `alpha` is clamped to 0–1.
 *
 * It uses `color-mix` rather than rgb triplets so it works with every token format and follows the
 * active theme. Pair with `--akui-alpha-surface` when the strength should be set once for the whole UI.
 */
export declare function alphaColour(token: string, alpha: number): string;
/**
 * Turns a `SurfaceStyle` into private custom properties for one component, e.g. `--akui-header-bg`.
 *
 * Each component uses its own `prefix` because custom properties inherit: a shared name set on a
 * pane would leak into the Header rendered inside it. Unset fields are left out, so the component's
 * CSS falls back to its theme token via `var(--akui-header-bg, var(--akui-bg))`.
 */
export declare function surfaceStyle(prefix: string, surface?: SurfaceStyle): string;
