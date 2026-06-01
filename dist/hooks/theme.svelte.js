import { getContext } from 'svelte';
/**
 * Returns the reactive theme state from the parent UIRoot component.
 * Defaults to 'light' if not rendered inside a UIRoot wrapper.
 */
export function getTheme() {
    try {
        return getContext('akui-theme') ?? { current: 'light' };
    }
    catch (e) {
        return { current: 'light' };
    }
}
