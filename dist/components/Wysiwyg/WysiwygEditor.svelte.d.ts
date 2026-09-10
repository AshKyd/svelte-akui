import type { Action } from 'svelte/action';
export interface WysiwygEditorOptions {
    placeholder?: string;
    /** Optional hook to transform or sanitize pasted HTML before insertion. */
    transformPastedHTML?: (html: string) => string;
    /** Optional hook to transform or sanitize pasted plain text or markdown before insertion. */
    transformPastedText?: (text: string, plain: boolean) => string;
    /** Optional paste event handler. Return true to prevent default editor paste behaviour. */
    handlePaste?: (event: ClipboardEvent) => boolean | void;
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
}
