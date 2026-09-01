/**
 * Controller class to manage the lifecycle and state of the Milkdown Crepe WYSIWYG editor.
 * Uses Svelte 5 runes for reactive state tracking.
 */
export class WysiwygEditorController {
    loading = $state(true);
    loadError = $state(false);
    #crepeInstance = null;
    #replaceAllFn = null;
    #onChange;
    #value = '';
    #placeholder = '';
    #node = $state(null);
    constructor(initialValue, placeholder = '', onChange) {
        this.#value = initialValue;
        this.#placeholder = placeholder;
        this.#onChange = onChange;
    }
    /**
     * Svelte Action to bind the editor to a DOM element container.
     */
    init = (node) => {
        this.#node = node;
        this.#setup(node);
        return {
            destroy: () => this.#destroy()
        };
    };
    /**
     * Synchronise external value updates with the editor instance.
     */
    updateValue(newValue) {
        if (this.#value !== newValue) {
            this.#value = newValue;
            if (this.#crepeInstance && this.#replaceAllFn) {
                this.#crepeInstance.editor.action(this.#replaceAllFn(newValue));
            }
        }
    }
    /**
     * Retries the editor initialization process.
     */
    retry() {
        if (this.#node) {
            this.#destroy();
            this.#setup(this.#node);
        }
    }
    async #setup(node) {
        this.loading = true;
        this.loadError = false;
        try {
            // Code-splitting Crepe and Milkdown modules so they load on-demand
            const { Crepe } = await import('@milkdown/crepe');
            const { replaceAll } = await import('@milkdown/kit/utils');
            this.#replaceAllFn = replaceAll;
            if (this.#node !== node)
                return; // Guard against rapid re-initialization
            this.#crepeInstance = new Crepe({
                root: node,
                defaultValue: this.#value,
                features: {
                    [Crepe.Feature.BlockEdit]: false,
                    [Crepe.Feature.Placeholder]: Boolean(this.#placeholder)
                },
                featureConfigs: {
                    [Crepe.Feature.Cursor]: {
                        virtual: false
                    },
                    [Crepe.Feature.Placeholder]: {
                        text: this.#placeholder || '',
                        mode: 'doc'
                    }
                }
            });
            await this.#crepeInstance.create();
            if (this.#node !== node) {
                this.#destroy();
                return;
            }
            // Listen to content changes and synchronise value state
            this.#crepeInstance.on((listener) => {
                listener.markdownUpdated((_ctx, markdown) => {
                    if (this.#value !== markdown) {
                        this.#value = markdown;
                        this.#onChange(markdown);
                    }
                });
            });
            this.loading = false;
        }
        catch (error) {
            console.error('Failed to load WYSIWYG editor:', error);
            this.loadError = true;
            this.loading = false;
        }
    }
    /**
     * Focuses the editor content editable element.
     */
    focus(collapseToStart = true) {
        if (!this.#node)
            return false;
        const editorEl = this.#node.querySelector('[contenteditable="true"]');
        if (editorEl) {
            editorEl.focus();
            const range = document.createRange();
            const selection = window.getSelection();
            if (selection) {
                range.selectNodeContents(editorEl);
                range.collapse(collapseToStart);
                selection.removeAllRanges();
                selection.addRange(range);
            }
            return true;
        }
        return false;
    }
    #destroy() {
        if (this.#crepeInstance) {
            this.#crepeInstance.destroy();
            this.#crepeInstance = null;
        }
    }
}
