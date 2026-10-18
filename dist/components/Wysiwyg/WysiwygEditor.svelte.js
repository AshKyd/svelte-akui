/**
 * Finds the ProseMirror document position at the end of the Nth word (0-indexed).
 * Clamps to the end of the document if index exceeds word count; returns null if empty.
 */
function docPositionForWordIndex(doc, targetIndex) {
    let wordCount = 0;
    let result = null;
    let sawAnyText = false;
    doc.descendants((node, pos) => {
        if (result !== null)
            return false;
        if (!node.isText)
            return true;
        sawAnyText = true;
        const text = node.text ?? '';
        const wordRe = /\S+/g;
        let match;
        while ((match = wordRe.exec(text))) {
            if (wordCount === targetIndex) {
                result = pos + match.index + match[0].length;
                return false;
            }
            wordCount++;
        }
        return true;
    });
    if (result !== null)
        return result;
    return sawAnyText ? doc.content.size : null;
}
// Markdown parsers require text after `[ ]` to recognise task items.
// Append a zero-width space to prevent empty checkboxes turning into literal text on round-trip.
const EMPTY_CHECKLIST_ITEM = /^([ \t]*[-*+][ \t]\[[ xX]\])[ \t]*$/gm;
export function preserveEmptyChecklistItems(markdown) {
    return markdown.replace(EMPTY_CHECKLIST_ITEM, '$1 ​');
}
// A task item line, then blank lines, then another task item line.
const BLANK_LINES_BETWEEN_TASKS = /^([ \t]*[-*+][ \t]\[[ xX]\].*)\n(?:[ \t]*\n)+(?=[ \t]*[-*+][ \t]\[[ xX]\])/gm;
/**
 * Removes blank lines between checklist items.
 *
 * Tiptap's markdown parser turns each blank-line-separated item into its own task list, with one
 * item in it. Completing a task moves it within its list, so with one item per list there is nowhere
 * to move it to, and every list grows its own "completed" header. Joining them makes one list. The
 * editor saves checklists without blank lines anyway, so only older notes are affected.
 */
export function tightenChecklists(markdown) {
    return markdown.replace(BLANK_LINES_BETWEEN_TASKS, '$1\n');
}
/** Markdown as it should be loaded into the editor. */
const prepareMarkdown = (markdown) => tightenChecklists(preserveEmptyChecklistItems(markdown));
const EMPTY_HEADING_DOC = { type: 'doc', content: [{ type: 'heading', attrs: { level: 1 } }] };
/**
 * Controller class to manage the lifecycle and state of the Tiptap WYSIWYG editor.
 * Notes are stored as markdown, so content goes in and out through `@tiptap/markdown`.
 * Uses Svelte 5 runes for reactive state tracking.
 */
export class WysiwygEditorController {
    loading = $state(true);
    loadError = $state(false);
    #editor = null;
    #onChange;
    #value = '';
    #options = {};
    #node = $state(null);
    #visualViewportCleanup = null;
    // Tiptap loads on-demand (see #setup), so #editor isn't ready the instant this controller (and the
    // bound Wysiwyg component) exists. Anything that needs the live editor — focusAtWordIndex
    // included — awaits this instead of assuming #editor is already set.
    #ready;
    #resolveReady = null;
    constructor(initialValue, options = {}, onChange) {
        this.#value = initialValue;
        this.#options = options;
        this.#onChange = onChange;
        this.#ready = new Promise((resolve) => {
            this.#resolveReady = resolve;
        });
    }
    /**
     * Update active options dynamically without re-initializing the editor.
     */
    setOptions(options) {
        this.#options = options;
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
        if (this.#value === newValue)
            return;
        this.#value = newValue;
        if (!this.#editor)
            return;
        this.#setDocument(this.#editor, newValue);
    }
    /**
     * Replaces the document without emitting an update. An empty value becomes an empty H1 when
     * `startWithHeading` is on, because empty markdown has no way to say "heading".
     */
    #setDocument(editor, markdown) {
        if (!markdown && this.#options.startWithHeading) {
            editor.commands.setContent(EMPTY_HEADING_DOC, { emitUpdate: false });
            return;
        }
        editor.commands.setContent(prepareMarkdown(markdown), {
            contentType: 'markdown',
            emitUpdate: false
        });
    }
    /**
     * Retries the editor initialization process.
     */
    retry() {
        if (!this.#node)
            return;
        this.#destroy();
        this.#setup(this.#node);
    }
    async #setup(node) {
        this.loading = true;
        this.loadError = false;
        try {
            // Code-splitting Tiptap so it loads on-demand
            const [{ Editor }, { default: StarterKit }, { Markdown }, listModule, tableModule, extras] = await Promise.all([
                import('@tiptap/core'),
                import('@tiptap/starter-kit'),
                import('@tiptap/markdown'),
                import('@tiptap/extension-list'),
                import('@tiptap/extension-table'),
                import('@tiptap/extensions')
            ]);
            const { TaskList } = listModule;
            const { TableKit } = tableModule;
            const { Placeholder } = extras;
            const [{ Keybindings }, { SvelteTaskItem }] = await Promise.all([
                import('./extensions/Keybindings'),
                import('./extensions/TaskItem')
            ]);
            if (this.#node !== node)
                return; // Guard against rapid re-initialization
            const { slashMenu, placeholder, groupCompletedTasks, demoteLongHeadingAt } = this.#options;
            const extensions = [
                StarterKit.configure({
                    // Underline has no markdown form, so it would be lost on save.
                    underline: false,
                    // Clicking opens the link; to edit one, move the cursor into it with the keyboard.
                    link: { openOnClick: true, autolink: true }
                }),
                Markdown,
                TaskList,
                // Checkbox is an akui `Checkbox` mounted by `svelteNodeView`; see devdocs/wysiwyg-tiptap.md.
                SvelteTaskItem.configure({ nested: true, context: this.#options.context }),
                // Parse and keep pasted/existing tables. There are no editing tools and no slash command to
                // create one, so column resizing (which needs a drag handle UI) is off.
                TableKit.configure({ table: { resizable: false } }),
                Keybindings
            ];
            if (placeholder)
                extensions.push(Placeholder.configure({ placeholder }));
            if (demoteLongHeadingAt !== undefined) {
                const { HeadingAutoDemote } = await import('./extensions/HeadingAutoDemote');
                extensions.push(HeadingAutoDemote.configure({ maxLength: demoteLongHeadingAt }));
            }
            if (slashMenu) {
                const { SlashCommand } = await import('./extensions/SlashCommand');
                extensions.push(SlashCommand.configure({
                    config: typeof slashMenu === 'object' ? slashMenu : {},
                    host: node
                }));
            }
            // Loaded on demand, so editors without the option don't pay for it.
            if (groupCompletedTasks) {
                const [{ Extension }, { createCompletedTasksPlugin }] = await Promise.all([
                    import('@tiptap/core'),
                    import('./completedTasks')
                ]);
                extensions.push(Extension.create({
                    name: 'akuiCompletedTasks',
                    addProseMirrorPlugins: () => [createCompletedTasksPlugin()]
                }));
            }
            if (this.#node !== node)
                return;
            this.#editor = new Editor({
                element: node,
                extensions,
                content: prepareMarkdown(this.#value),
                contentType: 'markdown',
                editorProps: {
                    transformPastedHTML: (html) => {
                        const fn = this.#options.transformPastedHTML;
                        return fn ? fn(html) : html;
                    },
                    transformPastedText: (text, plain) => {
                        const fn = this.#options.transformPastedText;
                        return fn ? fn(text, plain) : text;
                    },
                    handlePaste: (_view, event) => Boolean(this.#options.handlePaste?.(event))
                },
                // Listen to content changes and synchronise value state
                onUpdate: ({ editor }) => {
                    const markdown = preserveEmptyChecklistItems(editor.getMarkdown());
                    if (this.#value === markdown)
                        return;
                    this.#value = markdown;
                    this.#onChange(markdown);
                }
            });
            // The constructor content is markdown, which can't express an empty heading.
            if (!this.#value)
                this.#setDocument(this.#editor, this.#value);
            if (slashMenu)
                this.#registerVisualViewportReflow();
            this.loading = false;
        }
        catch (error) {
            console.error('Failed to load WYSIWYG editor:', error);
            this.loadError = true;
            this.loading = false;
        }
        finally {
            this.#resolveReady?.();
        }
    }
    /**
     * Focuses the editor, with the cursor at the start or end of the document.
     */
    focus(collapseToStart = true) {
        if (!this.#editor)
            return false;
        // Tiptap's default scrolls the caret into view on the next frame. That scrolls every ancestor,
        // including overflow:hidden ones, so focusing while a pane is still sliding in made the layout jump.
        return this.#editor.commands.focus(collapseToStart ? 'start' : 'end', { scrollIntoView: false });
    }
    /**
     * Places the cursor at (approximately) the Nth word of the document and focuses the editor.
     * See {@link docPositionForWordIndex} for the word-counting rule the index must match.
     */
    async focusAtWordIndex(index) {
        await this.#ready;
        const editor = this.#editor;
        if (!editor)
            return false;
        const pos = docPositionForWordIndex(editor.state.doc, index);
        if (pos === null)
            return false;
        const applied = editor.chain().focus(null, { scrollIntoView: false }).setTextSelection(pos).run();
        if (applied)
            this.#scrollCaretIntoViewVertically(editor, pos);
        return applied;
    }
    /**
     * Places the cursor `offset` characters into the first-line heading (clamped to its length)
     * and focuses the editor. Does nothing if the first line is not a heading.
     */
    async focusHeadingAt(offset) {
        await this.#ready;
        const editor = this.#editor;
        const first = editor?.state.doc.firstChild;
        if (!editor || first?.type.name !== 'heading')
            return false;
        // Position 0 is before the heading node, so its text starts at 1.
        const pos = 1 + Math.max(0, Math.min(offset, first.content.size));
        const applied = editor.chain().focus(null, { scrollIntoView: false }).setTextSelection(pos).run();
        if (applied)
            this.#scrollCaretIntoViewVertically(editor, pos);
        return applied;
    }
    /**
     * Brings the caret into view by scrolling only the nearest vertical scroll container.
     * Unlike `scrollIntoView`, it never scrolls horizontally or moves outer overflow:hidden ancestors,
     * which is what made the layout jump while a pane was sliding in.
     */
    #scrollCaretIntoViewVertically(editor, pos) {
        const { top, bottom } = editor.view.coordsAtPos(pos);
        const scroller = (() => {
            for (let el = editor.view.dom.parentElement; el; el = el.parentElement) {
                if (/(auto|scroll)/.test(getComputedStyle(el).overflowY) && el.scrollHeight > el.clientHeight)
                    return el;
            }
            return null;
        })();
        if (!scroller)
            return;
        const area = scroller.getBoundingClientRect();
        if (top < area.top)
            scroller.scrollTop += top - area.top;
        else if (bottom > area.bottom)
            scroller.scrollTop += bottom - area.bottom;
    }
    /**
     * Nudge the slash menu to reposition when mobile keyboards resize the visual viewport.
     */
    #registerVisualViewportReflow() {
        const viewport = typeof window !== 'undefined' ? window.visualViewport : null;
        if (!viewport)
            return;
        const reflow = () => {
            const editor = this.#editor;
            if (editor?.isFocused)
                editor.view.dispatch(editor.state.tr);
        };
        viewport.addEventListener('resize', reflow);
        this.#visualViewportCleanup = () => viewport.removeEventListener('resize', reflow);
    }
    #destroy() {
        this.#visualViewportCleanup?.();
        this.#visualViewportCleanup = null;
        this.#editor?.destroy();
        this.#editor = null;
    }
}
