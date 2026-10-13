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
