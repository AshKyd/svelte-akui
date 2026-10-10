/**
 * Mixes any `--akui-*` colour token with transparent, e.g. `alphaColour('bg', 0.25)` for a 25% opaque
 * `--akui-bg`. Use it for a `SurfaceStyle` field; `alpha` is clamped to 0–1.
 *
 * It uses `color-mix` rather than rgb triplets so it works with every token format and follows the
 * active theme. Pair with `--akui-alpha-surface` when the strength should be set once for the whole UI.
 */
export function alphaColour(token, alpha) {
    const percent = Math.round(Math.min(Math.max(alpha, 0), 1) * 100);
    return `color-mix(in srgb, var(--akui-${token}) ${percent}%, transparent)`;
}
/**
 * Turns a `SurfaceStyle` into private custom properties for one component, e.g. `--akui-header-bg`.
 *
 * Each component uses its own `prefix` because custom properties inherit: a shared name set on a
 * pane would leak into the Header rendered inside it. Unset fields are left out, so the component's
 * CSS falls back to its theme token via `var(--akui-header-bg, var(--akui-bg))`.
 */
export function surfaceStyle(prefix, surface = {}) {
    const { background, foreground, borderColour, backdropFilter } = surface;
    return [
        [`--akui-${prefix}-bg`, background],
        [`--akui-${prefix}-fg`, foreground],
        [`--akui-${prefix}-border`, borderColour],
        [`--akui-${prefix}-backdrop`, backdropFilter]
    ]
        .flatMap(([name, value]) => (value ? [`${name}: ${value}`] : []))
        .join('; ');
}
