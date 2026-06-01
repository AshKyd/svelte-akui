export interface ThemeContext {
    readonly current: 'light' | 'dark';
}
/**
 * Returns the reactive theme state from the parent UIRoot component.
 * Defaults to 'light' if not rendered inside a UIRoot wrapper.
 */
export declare function getTheme(): ThemeContext;
