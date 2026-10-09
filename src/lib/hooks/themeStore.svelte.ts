import { getContext, setContext } from 'svelte';

export type ThemeScheme = 'light' | 'dark';

export interface AkuiTheme {
	/** Unique id, stored in localStorage and exposed as `data-akui-theme`. */
	id: string;
	/** Name shown in the `ThemePicker`. */
	label: string;
	/** Optional heading the `ThemePicker` groups this theme under when `groupBy="group"`. */
	group?: string;
	/** Which built-in `[data-theme]` rules the theme builds on, so existing dark/light styles keep working. */
	scheme: ThemeScheme;
	/** `--akui-*` overrides applied inline on `.akui-root`. */
	tokens?: Record<`--akui-${string}`, string>;
}

const STORAGE_KEY = 'akui-theme';
// `Symbol.for`, not `Symbol()`: the key must be the same across module copies. HMR or a duplicated
// bundle reloads this module separately for `UIRoot` and `ThemePicker`, and a plain symbol would
// then differ between them, so the picker couldn't find the root's store.
const CONTEXT_KEY = Symbol.for('akui-theme-store');

export const SYSTEM_THEME_ID = 'system';
/** No tokens: `theme.css` already defines the light and dark values. */
export const LIGHT_THEME: AkuiTheme = { id: 'light', label: 'Light', scheme: 'light' };
export const DARK_THEME: AkuiTheme = { id: 'dark', label: 'Dark', scheme: 'dark' };
export const DEFAULT_THEMES: AkuiTheme[] = [LIGHT_THEME, DARK_THEME];

/** Narrows parsed JSON to an `AkuiTheme`, so a hand-edited or outdated stored value is ignored. */
function isTheme(value: unknown): value is AkuiTheme {
	if (typeof value !== 'object' || value === null) return false;
	const { id, label, scheme, tokens } = value as Record<string, unknown>;
	return (
		typeof id === 'string' &&
		typeof label === 'string' &&
		(scheme === 'light' || scheme === 'dark') &&
		(tokens === undefined || (typeof tokens === 'object' && tokens !== null))
	);
}

/** Reads the persisted theme, or `null` (follow the system) when missing, unparseable or invalid. */
function readStoredTheme(): AkuiTheme | null {
	if (typeof localStorage === 'undefined') return null;
	const stored = localStorage.getItem(STORAGE_KEY);
	if (!stored) return null;
	try {
		const parsed: unknown = JSON.parse(stored);
		return isTheme(parsed) ? parsed : null;
	} catch {
		return null;
	}
}

/**
 * The app's current theme. One instance per `UIRoot` (not a module singleton) so SSR requests
 * never share state.
 *
 * The full theme object is persisted, not just its id, so a custom theme restores on load even
 * when no `ThemePicker` (and therefore no theme list) is mounted.
 */
export class ThemeStore {
	/** Reads the custom themes `UIRoot` was given. A getter, so the list stays reactive and SSR-safe. */
	#getCustomThemes: () => AkuiTheme[];

	constructor(getCustomThemes: () => AkuiTheme[] = () => []) {
		this.#getCustomThemes = getCustomThemes;
	}

	/**
	 * Every theme on offer, in the order the app passed them. A custom theme with id `light` or
	 * `dark` replaces that built-in, which is how an app re-brands the defaults (e.g. its own
	 * accent colour), and takes the position it was given. Built-ins the app doesn't replace come
	 * first. Duplicate ids keep the first.
	 */
	themes = $derived.by(() => {
		const custom = this.#getCustomThemes();
		const untouchedDefaults = DEFAULT_THEMES.filter(
			({ id }) => !custom.some((theme) => theme.id === id)
		);
		const all = [...untouchedDefaults, ...custom];
		return all.filter((theme, index) => all.findIndex(({ id }) => id === theme.id) === index);
	});

	/** Live OS `prefers-color-scheme` value. */
	systemScheme = $state<ThemeScheme>('light');
	/** The chosen theme as saved or selected; may be stale if the app has since edited that theme. */
	#chosen = $state<AkuiTheme | null>(readStoredTheme());

	/**
	 * The active theme, or `null` to follow the system. If the app still offers a theme with the
	 * saved id, that fresh definition wins over the saved copy, so edited tokens apply on reload.
	 * The saved copy is the fallback for a theme the app no longer lists.
	 */
	selected = $derived(
		this.#chosen && (this.themes.find(({ id }) => id === this.#chosen?.id) ?? this.#chosen)
	);

	selectedId = $derived(this.selected?.id ?? SYSTEM_THEME_ID);
	/** The scheme actually rendering: the selected theme's, otherwise the OS one. */
	scheme = $derived<ThemeScheme>(this.selected?.scheme ?? this.systemScheme);
	/**
	 * Token overrides to apply. Following the system uses the Light or Dark theme's tokens for the
	 * current OS scheme, so a re-branded default still applies under "System".
	 */
	tokens = $derived(
		(this.selected ?? this.themes.find(({ id }) => id === this.systemScheme))?.tokens ?? {}
	);

	/** Tracks the OS colour scheme. Call from an `$effect`; the returned cleanup removes the listener. */
	listenToSystemScheme(): () => void {
		if (typeof window === 'undefined') return () => {};
		const mql = window.matchMedia('(prefers-color-scheme: dark)');
		const update = () => {
			this.systemScheme = mql.matches ? 'dark' : 'light';
		};
		update();
		mql.addEventListener('change', update);
		return () => mql.removeEventListener('change', update);
	}

	/** Selects a theme (`null` = follow the system). Pass `persist: false` for externally driven changes. */
	select(theme: AkuiTheme | null, { persist = true } = {}): void {
		this.#chosen = theme;
		if (!persist || typeof localStorage === 'undefined') return;
		if (theme) localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
		else localStorage.removeItem(STORAGE_KEY);
	}
}

export function setThemeStore(store: ThemeStore): ThemeStore {
	return setContext(CONTEXT_KEY, store);
}

/** Returns the `ThemeStore` from the nearest `UIRoot`. Throws outside one. */
export function getThemeStore(): ThemeStore {
	const store = getContext<ThemeStore | undefined>(CONTEXT_KEY);
	if (!store) throw new Error('getThemeStore() must be called inside a <UIRoot>.');
	return store;
}
