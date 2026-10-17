import { Extension } from '@tiptap/core';
import { type SlashMenuConfig } from '../slashItems';
export interface SlashCommandOptions {
    config: SlashMenuConfig;
    /** Element the menu is appended to, so it inherits the akui theme variables. */
    host: HTMLElement | null;
}
/**
 * "/" command menu. Typing "/" at a word boundary opens the menu, further text filters it, arrow keys
 * move, Enter/Tab runs and Escape closes (handled by `@tiptap/suggestion`).
 */
export declare const SlashCommand: Extension<SlashCommandOptions, any>;
