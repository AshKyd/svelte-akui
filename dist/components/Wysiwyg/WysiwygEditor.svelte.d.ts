import type { Action } from 'svelte/action';
import type { BlockEditFeatureConfig } from '@milkdown/crepe/feature/block-edit';
/**
 * Config for the Crepe "/" slash menu and block-drag-handle (the `BlockEdit` feature).
 * Set a group (`textGroup`/`listGroup`/`advancedGroup`) or item within it to `null` to hide it,
 * or provide `buildMenu` to append custom commands via Crepe's `GroupBuilder`.
 */
export type SlashMenuConfig = BlockEditFeatureConfig;
export interface WysiwygEditorOptions {
    placeholder?: string;
    /** Optional hook to transform or sanitize pasted HTML before insertion. */
    transformPastedHTML?: (html: string) => string;
    /** Optional hook to transform or sanitize pasted plain text or markdown before insertion. */
    transformPastedText?: (text: string, plain: boolean) => string;
    /** Optional paste event handler. Return true to prevent default editor paste behaviour. */
    handlePaste?: (event: ClipboardEvent) => boolean | void;
    /**
     * Opt in to the "/" slash menu and block-drag-handle. Pass `true` for Crepe's defaults, or a
     * {@link SlashMenuConfig} to hide groups/items or extend the menu with `buildMenu`.
     */
    slashMenu?: boolean | SlashMenuConfig;
}
/**
 * Controller class to manage the lifecycle and state of the Milkdown Crepe WYSIWYG editor.
 * Uses Svelte 5 runes for reactive state tracking.
 */
export declare class WysiwygEditorController {
    #private;
    loading: boolean;
    loadError: boolean;
    constructor(initialValue: string, options: WysiwygEditorOptions | undefined, onChange: (val: string) => void);
    /**
     * Update active options dynamically without re-initializing the editor.
     */
    setOptions(options: WysiwygEditorOptions): void;
    /**
     * Svelte Action to bind the editor to a DOM element container.
     */
    init: Action<HTMLElement>;
    /**
     * Synchronise external value updates with the editor instance.
     */
    updateValue(newValue: string): void;
    /**
     * Retries the editor initialization process.
     */
    retry(): void;
    /**
     * Focuses the editor content editable element.
     */
    focus(collapseToStart?: boolean): boolean;
    /**
     * Places the cursor at (approximately) the Nth word of the document and focuses the editor.
     * See {@link docPositionForWordIndex} for the word-counting rule the index must match.
     */
    focusAtWordIndex(index: number): Promise<boolean>;
}
