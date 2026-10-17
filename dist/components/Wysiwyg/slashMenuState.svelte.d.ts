import type { SlashItem } from './slashItems';
/** Reactive state shared between the Tiptap suggestion plugin and `SlashMenu.svelte`. */
export interface SlashMenuState {
    /** Items matching the typed query. */
    items: SlashItem[];
    /** Index of the highlighted item. */
    selectedIndex: number;
    /** Called when an item is clicked. */
    onselect: (item: SlashItem) => void;
}
export declare function createSlashMenuState(onselect: SlashMenuState['onselect']): SlashMenuState;
/** DOM id of an item, referenced by the editor's `aria-activedescendant`. */
export declare function slashOptionId(menuId: string, itemId: string): string;
