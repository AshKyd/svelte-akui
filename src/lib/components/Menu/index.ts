import { getContext } from 'svelte';
export { default as Menu } from './Menu.svelte';
export { default as MenuItem } from './MenuItem.svelte';
export { default as MenuContent } from './MenuContent.svelte';
export { default as MenuDesktop } from './MenuDesktop.svelte';
export { default as MenuMobile } from './MenuMobile.svelte';

export const MENU_CONTEXT_KEY = Symbol('akui-menu');

export function useMenu() {
	return getContext<{ close: () => void } | undefined>(MENU_CONTEXT_KEY);
}
