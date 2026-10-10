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
 * Turns a `SurfaceStyle` into private custom properties for one component, e.g. `--akui-header-bg`.
 *
 * Each component uses its own `prefix` because custom properties inherit: a shared name set on a
 * pane would leak into the Header rendered inside it. Unset fields are left out, so the component's
 * CSS falls back to its theme token via `var(--akui-header-bg, var(--akui-bg))`.
 */
export function surfaceStyle(prefix: string, surface: SurfaceStyle = {}): string {
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
