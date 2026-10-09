import { type AkuiTheme } from '../../hooks/themeStore.svelte.js';
export interface ThemeOption {
    id: string;
    label: string;
    /** The theme to select, or `null` for "follow the system". */
    theme: AkuiTheme | null;
}
export type ThemeGroupBy = 'none' | 'scheme' | 'group';
export interface ThemeOptionGroup {
    /** Heading for the group, or `null` for options shown without one. */
    label: string | null;
    options: ThemeOption[];
}
/**
 * Splits options into headed groups, keeping the original order within each.
 * Options with no group (System, and themes without a `group`) come first, unheaded.
 * Groups appear in the order they are first seen; with `scheme`, light always precedes dark.
 */
export declare function groupThemeOptions(options: ThemeOption[], groupBy: ThemeGroupBy): ThemeOptionGroup[];
interface BuildThemeOptionsArgs {
    /** The themes the `UIRoot` offers (`ThemeStore.themes`). */
    themes: AkuiTheme[];
    includeSystem?: boolean;
}
/** Builds the picker's option list: System (optional), then every theme the `UIRoot` offers. */
export declare function buildThemeOptions({ themes, includeSystem }: BuildThemeOptionsArgs): ThemeOption[];
export {};
