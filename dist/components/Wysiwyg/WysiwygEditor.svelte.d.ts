import type { Action } from 'svelte/action';
/**
 * Controller class to manage the lifecycle and state of the Milkdown Crepe WYSIWYG editor.
 * Uses Svelte 5 runes for reactive state tracking.
 */
export declare class WysiwygEditorController {
    #private;
    loading: boolean;
    loadError: boolean;
    constructor(initialValue: string, placeholder: string | undefined, onChange: (val: string) => void);
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
