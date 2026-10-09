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
export declare const SYSTEM_THEME_ID = "system";
/** No tokens: `theme.css` already defines the light and dark values. */
export declare const LIGHT_THEME: AkuiTheme;
export declare const DARK_THEME: AkuiTheme;
export declare const DEFAULT_THEMES: AkuiTheme[];
/**
 * The app's current theme. One instance per `UIRoot` (not a module singleton) so SSR requests
 * never share state.
 *
 * The full theme object is persisted, not just its id, so a custom theme restores on load even
 * when no `ThemePicker` (and therefore no theme list) is mounted.
 */
export declare class ThemeStore {
    #private;
    constructor(getCustomThemes?: () => AkuiTheme[]);
    /**
     * Every theme on offer: Light and Dark, then the custom ones. A custom theme with id `light` or
     * `dark` replaces that built-in in place, which is how an app re-brands the defaults (e.g. its
     * own accent colour). Other duplicate ids keep the first.
     */
    themes: AkuiTheme[];
    /** Live OS `prefers-color-scheme` value. */
    systemScheme: ThemeScheme;
    /**
     * The active theme, or `null` to follow the system. If the app still offers a theme with the
     * saved id, that fresh definition wins over the saved copy, so edited tokens apply on reload.
     * The saved copy is the fallback for a theme the app no longer lists.
     */
    selected: AkuiTheme | null;
    selectedId: string;
    /** The scheme actually rendering: the selected theme's, otherwise the OS one. */
    scheme: ThemeScheme;
    /**
     * Token overrides to apply. Following the system uses the Light or Dark theme's tokens for the
     * current OS scheme, so a re-branded default still applies under "System".
     */
    tokens: Record<`--akui-${string}`, string>;
    /** Tracks the OS colour scheme. Call from an `$effect`; the returned cleanup removes the listener. */
    listenToSystemScheme(): () => void;
    /** Selects a theme (`null` = follow the system). Pass `persist: false` for externally driven changes. */
    select(theme: AkuiTheme | null, { persist }?: {
        persist?: boolean | undefined;
    }): void;
}
export declare function setThemeStore(store: ThemeStore): ThemeStore;
/** Returns the `ThemeStore` from the nearest `UIRoot`. Throws outside one. */
export declare function getThemeStore(): ThemeStore;
