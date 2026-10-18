import type { Action } from 'svelte/action';
import type { SlashMenuConfig } from './slashItems';
export type { SlashItem, SlashMenuConfig } from './slashItems';
export declare function preserveEmptyChecklistItems(markdown: string): string;
/**
 * Removes blank lines between checklist items.
 *
 * Tiptap's markdown parser turns each blank-line-separated item into its own task list, with one
 * item in it. Completing a task moves it within its list, so with one item per list there is nowhere
 * to move it to, and every list grows its own "completed" header. Joining them makes one list. The
 * editor saves checklists without blank lines anyway, so only older notes are affected.
 */
export declare function tightenChecklists(markdown: string): string;
export interface WysiwygEditorOptions {
    placeholder?: string;
    /** Optional hook to transform or sanitize pasted HTML before insertion. */
    transformPastedHTML?: (html: string) => string;
    /** Optional hook to transform or sanitize pasted plain text or markdown before insertion. */
    transformPastedText?: (text: string, plain: boolean) => string;
    /** Optional paste event handler. Return true to prevent default editor paste behaviour. */
    handlePaste?: (event: ClipboardEvent) => boolean | void;
    /**
     * Opt in to the "/" slash menu. Pass `true` for the default commands, or a
     * {@link SlashMenuConfig} to hide, reorder or add commands.
     */
    slashMenu?: boolean | SlashMenuConfig;
    /**
     * Move ticked task items to a collapsible "completed" section at the end of their list.
     * Read once when the editor loads.
     */
    groupCompletedTasks?: boolean;
    /**
     * When the value is empty, start with an empty H1 instead of a paragraph and focus it.
     * Read once when the editor loads, and again each time the value is reset to empty.
     */
    startWithHeading?: boolean;
    /**
     * Turn the first-line H1 into a paragraph once it is longer than this many characters (once per
     * editor). Read once when the editor loads.
     */
    demoteLongHeadingAt?: number;
    /**
     * Svelte context of the host component (`getAllContexts()`), passed to components that
     * `svelteNodeView` mounts inside the editor. Read once when the editor loads.
     */
    context?: Map<unknown, unknown>;
}
/**
 * Controller class to manage the lifecycle and state of the Tiptap WYSIWYG editor.
 * Notes are stored as markdown, so content goes in and out through `@tiptap/markdown`.
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
     * Focuses the editor, with the cursor at the start or end of the document.
     */
    focus(collapseToStart?: boolean): boolean;
    /**
     * Places the cursor at (approximately) the Nth word of the document and focuses the editor.
     * See {@link docPositionForWordIndex} for the word-counting rule the index must match.
     */
    focusAtWordIndex(index: number): Promise<boolean>;
    /**
     * Places the cursor `offset` characters into the first-line heading (clamped to its length)
     * and focuses the editor. Does nothing if the first line is not a heading.
     */
    focusHeadingAt(offset: number): Promise<boolean>;
}
