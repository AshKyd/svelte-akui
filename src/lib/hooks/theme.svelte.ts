import { getContext } from 'svelte';

export interface ThemeContext {
	readonly current: 'light' | 'dark';
}

/**
 * Returns the reactive theme state from the parent UIRoot component.
 * Defaults to 'light' if not rendered inside a UIRoot wrapper.
 */
export function getTheme(): ThemeContext {
	try {
		return getContext<ThemeContext>('akui-theme') ?? { current: 'light' };
	} catch (e) {
		return { current: 'light' };
	}
}
