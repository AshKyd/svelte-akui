import type { Editor, Range } from '@tiptap/core';
/** One entry in the "/" slash menu. */
export interface SlashItem {
    /** Stable identifier. */
    id: string;
    /** Text shown in the menu. */
    label: string;
    /** Bootstrap icon name shown before the label, as on `MenuItem`. */
    icon?: string;
    /** Extra search terms matched alongside the label. */
    keywords?: string[];
    /** Runs after the typed "/query" has been removed. */
    onRun: (editor: Editor) => void;
}
/** Slash menu options. */
export interface SlashMenuConfig {
    /** Receives the default items and returns the list to show. Use it to hide, reorder or add commands. */
    items?: (defaults: SlashItem[]) => SlashItem[];
    /** Item density. 'small' condenses the menu. Defaults to 'small'. */
    size?: 'small' | 'large';
}
export declare const defaultSlashItems: SlashItem[];
/** Case-insensitive match against label, id and keywords. */
export declare function filterSlashItems(items: SlashItem[], query: string): SlashItem[];
/** Removes the typed "/query" then runs the item. */
export declare function runSlashItem(editor: Editor, range: Range, item: SlashItem): void;
