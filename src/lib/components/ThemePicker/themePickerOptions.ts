import { SYSTEM_THEME_ID, type AkuiTheme } from '../../hooks/themeStore.svelte.js';

export interface ThemeOption {
	id: string;
	label: string;
	/** The theme to select, or `null` for "follow the system". */
	theme: AkuiTheme | null;
}

/**
 * The surface and text values `theme.css` gives each built-in scheme. A picker card sets these
 * (plus the theme's own tokens) inline, so it shows the theme's colours without depending on the
 * cascade: the page's active theme can't leak in. There is no way to read a CSS custom property
 * for another scheme at runtime, so keep these in step with `theme.css` by hand.
 */
const SCHEME_SURFACES: Record<AkuiTheme['scheme'], Record<`--akui-${string}`, string>> = {
	light: {
		'--akui-bg': '#ffffff',
		'--akui-fg': '#111827',
		'--akui-bg-secondary': '#f3f4f6',
		'--akui-fg-secondary': '#4b5563',
		'--akui-bg-accent': '#2563eb',
		'--akui-border-input': '#d1d5db'
	},
	dark: {
		'--akui-bg': '#0d0f14',
		'--akui-fg': '#ffffff',
		'--akui-bg-secondary': '#161920',
		'--akui-fg-secondary': '#9ca3af',
		'--akui-bg-accent': '#3b82f6',
		'--akui-border-input': '#39404e'
	}
};

/**
 * Inline `style` that scopes an element to a theme: the scheme's base surface values, overridden
 * by the theme's own `tokens`.
 */
export function themeScopeStyle(theme: AkuiTheme): string {
	return Object.entries({ ...SCHEME_SURFACES[theme.scheme], ...theme.tokens })
		.map(([name, value]) => `${name}:${value}`)
		.join(';');
}

export type ThemeGroupBy = 'none' | 'scheme' | 'group';

export interface ThemeOptionGroup {
	/** Heading for the group, or `null` for options shown without one. */
	label: string | null;
	options: ThemeOption[];
}

const SCHEME_LABELS = { light: 'Light themes', dark: 'Dark themes' } as const;

/**
 * Splits options into headed groups, keeping the original order within each.
 * Options with no group (System, and themes without a `group`) come first, unheaded.
 * Groups appear in the order they are first seen; with `scheme`, light always precedes dark.
 */
export function groupThemeOptions(
	options: ThemeOption[],
	groupBy: ThemeGroupBy
): ThemeOptionGroup[] {
	if (groupBy === 'none') return [{ label: null, options }];

	const labelFor = ({ theme }: ThemeOption): string | null => {
		if (!theme) return null;
		return groupBy === 'scheme' ? SCHEME_LABELS[theme.scheme] : (theme.group ?? null);
	};
	const labels = [
		...new Set(options.map(labelFor).filter((label): label is string => label !== null))
	];
	const ordered =
		groupBy === 'scheme' ? Object.values(SCHEME_LABELS).filter((l) => labels.includes(l)) : labels;

	return [null, ...ordered]
		.map((label) => ({ label, options: options.filter((option) => labelFor(option) === label) }))
		.filter(({ options: members }) => members.length > 0);
}

interface BuildThemeOptionsArgs {
	/** The themes the `UIRoot` offers (`ThemeStore.themes`). */
	themes: AkuiTheme[];
	includeSystem?: boolean;
}

/** Builds the picker's option list: System (optional), then every theme the `UIRoot` offers. */
export function buildThemeOptions({
	themes,
	includeSystem = true
}: BuildThemeOptionsArgs): ThemeOption[] {
	return [
		...(includeSystem ? [{ id: SYSTEM_THEME_ID, label: 'System', theme: null }] : []),
		...themes.map((theme) => ({ id: theme.id, label: theme.label, theme }))
	];
}
