export { default as Menu } from './Menu.svelte';
export { default as MenuItem } from './MenuItem.svelte';
export { default as MenuContent } from './MenuContent.svelte';
export { default as MenuDesktop } from './MenuDesktop.svelte';
export { default as MenuMobile } from './MenuMobile.svelte';
export declare const MENU_CONTEXT_KEY: unique symbol;
export declare function useMenu(): {
    close: () => void;
} | undefined;
