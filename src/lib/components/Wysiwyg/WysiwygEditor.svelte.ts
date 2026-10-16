import type { Action } from 'svelte/action';
import type { Editor } from '@tiptap/core';
import type { Node as ProseNode } from '@tiptap/pm/model';
import type { SlashMenuConfig } from './slashItems';

export type { SlashItem, SlashMenuConfig } from './slashItems';

/**
 * Finds the ProseMirror document position at the end of the Nth word (0-indexed).
 * Clamps to the end of the document if index exceeds word count; returns null if empty.
 */
function docPositionForWordIndex(doc: ProseNode, targetIndex: number): number | null {
	let wordCount = 0;
	let result: number | null = null;
	let sawAnyText = false;

	doc.descendants((node, pos) => {
		if (result !== null) return false;
		if (!node.isText) return true;
		sawAnyText = true;

		const text: string = node.text ?? '';
		const wordRe = /\S+/g;
		let match: RegExpExecArray | null;
		while ((match = wordRe.exec(text))) {
			if (wordCount === targetIndex) {
				result = pos + match.index + match[0].length;
				return false;
			}
			wordCount++;
		}
		return true;
	});

	if (result !== null) return result;
	return sawAnyText ? doc.content.size : null;
}

// Markdown parsers require text after `[ ]` to recognise task items.
// Append a zero-width space to prevent empty checkboxes turning into literal text on round-trip.
const EMPTY_CHECKLIST_ITEM = /^([ \t]*[-*+][ \t]\[[ xX]\])[ \t]*$/gm;

export function preserveEmptyChecklistItems(markdown: string): string {
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
export function tightenChecklists(markdown: string): string {
	return markdown.replace(BLANK_LINES_BETWEEN_TASKS, '$1\n');
}

/** Markdown as it should be loaded into the editor. */
const prepareMarkdown = (markdown: string) => tightenChecklists(preserveEmptyChecklistItems(markdown));

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
export class WysiwygEditorController {
	loading = $state(true);
	loadError = $state(false);

	#editor: Editor | null = null;
	#onChange: (val: string) => void;
	#value = '';
	#options: WysiwygEditorOptions = {};
	#node = $state<HTMLElement | null>(null);
	#visualViewportCleanup: (() => void) | null = null;

	// Tiptap loads on-demand (see #setup), so #editor isn't ready the instant this controller (and the
	// bound Wysiwyg component) exists. Anything that needs the live editor — focusAtWordIndex
	// included — awaits this instead of assuming #editor is already set.
	#ready: Promise<void>;
	#resolveReady: (() => void) | null = null;

	constructor(
		initialValue: string,
		options: WysiwygEditorOptions = {},
		onChange: (val: string) => void
	) {
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
	setOptions(options: WysiwygEditorOptions) {
		this.#options = options;
	}

	/**
	 * Svelte Action to bind the editor to a DOM element container.
	 */
	init: Action<HTMLElement> = (node) => {
		this.#node = node;
		this.#setup(node);

		return {
			destroy: () => this.#destroy()
		};
	};

	/**
	 * Synchronise external value updates with the editor instance.
	 */
	updateValue(newValue: string) {
		if (this.#value === newValue) return;
		this.#value = newValue;
		this.#editor?.commands.setContent(prepareMarkdown(newValue), {
			contentType: 'markdown',
			emitUpdate: false
		});
	}

	/**
	 * Retries the editor initialization process.
	 */
	retry() {
		if (!this.#node) return;
		this.#destroy();
		this.#setup(this.#node);
	}

	async #setup(node: HTMLElement) {
		this.loading = true;
		this.loadError = false;

		try {
			// Code-splitting Tiptap so it loads on-demand
			const [{ Editor }, { default: StarterKit }, { Markdown }, listModule, tableModule, extras] =
				await Promise.all([
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

			if (this.#node !== node) return; // Guard against rapid re-initialization

			const { slashMenu, placeholder, groupCompletedTasks } = this.#options;

			const extensions = [
				StarterKit.configure({
					// Underline has no markdown form, so it would be lost on save.
					underline: false,
					link: { openOnClick: false, autolink: true }
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
			if (placeholder) extensions.push(Placeholder.configure({ placeholder }));

			if (slashMenu) {
				const { SlashCommand } = await import('./extensions/SlashCommand');
				extensions.push(
					SlashCommand.configure({
						config: typeof slashMenu === 'object' ? slashMenu : {},
						host: node
					})
				);
			}

			// Loaded on demand, so editors without the option don't pay for it.
			if (groupCompletedTasks) {
				const [{ Extension }, { createCompletedTasksPlugin }] = await Promise.all([
					import('@tiptap/core'),
					import('./completedTasks')
				]);
				extensions.push(
					Extension.create({
						name: 'akuiCompletedTasks',
						addProseMirrorPlugins: () => [createCompletedTasksPlugin()]
					})
				);
			}

			if (this.#node !== node) return;

			this.#editor = new Editor({
				element: node,
				extensions,
				content: prepareMarkdown(this.#value),
				contentType: 'markdown',
				editorProps: {
					transformPastedHTML: (html: string) => {
						const fn = this.#options.transformPastedHTML;
						return fn ? fn(html) : html;
					},
					transformPastedText: (text: string, plain: boolean) => {
						const fn = this.#options.transformPastedText;
						return fn ? fn(text, plain) : text;
					},
					handlePaste: (_view, event) => Boolean(this.#options.handlePaste?.(event))
				},
				// Listen to content changes and synchronise value state
				onUpdate: ({ editor }) => {
					const markdown = preserveEmptyChecklistItems(editor.getMarkdown());
					if (this.#value === markdown) return;
					this.#value = markdown;
					this.#onChange(markdown);
				}
			});

			if (slashMenu) this.#registerVisualViewportReflow();

			this.loading = false;
		} catch (error) {
			console.error('Failed to load WYSIWYG editor:', error);
			this.loadError = true;
			this.loading = false;
		} finally {
			this.#resolveReady?.();
		}
	}

	/**
	 * Focuses the editor, with the cursor at the start or end of the document.
	 */
	focus(collapseToStart = true) {
		if (!this.#editor) return false;
		// Tiptap's default scrolls the caret into view on the next frame. That scrolls every ancestor,
		// including overflow:hidden ones, so focusing while a pane is still sliding in made the layout jump.
		return this.#editor.commands.focus(collapseToStart ? 'start' : 'end', { scrollIntoView: false });
	}

	/**
	 * Places the cursor at (approximately) the Nth word of the document and focuses the editor.
	 * See {@link docPositionForWordIndex} for the word-counting rule the index must match.
	 */
	async focusAtWordIndex(index: number): Promise<boolean> {
		await this.#ready;
		const editor = this.#editor;
		if (!editor) return false;

		const pos = docPositionForWordIndex(editor.state.doc, index);
		if (pos === null) return false;
		const applied = editor.chain().focus(null, { scrollIntoView: false }).setTextSelection(pos).run();
		if (applied) this.#scrollCaretIntoViewVertically(editor, pos);
		return applied;
	}

	/**
	 * Brings the caret into view by scrolling only the nearest vertical scroll container.
	 * Unlike `scrollIntoView`, it never scrolls horizontally or moves outer overflow:hidden ancestors,
	 * which is what made the layout jump while a pane was sliding in.
	 */
	#scrollCaretIntoViewVertically(editor: Editor, pos: number) {
		const { top, bottom } = editor.view.coordsAtPos(pos);
		const scroller = (() => {
			for (let el = editor.view.dom.parentElement; el; el = el.parentElement) {
				if (/(auto|scroll)/.test(getComputedStyle(el).overflowY) && el.scrollHeight > el.clientHeight) return el;
			}
			return null;
		})();
		if (!scroller) return;
		const area = scroller.getBoundingClientRect();
		if (top < area.top) scroller.scrollTop += top - area.top;
		else if (bottom > area.bottom) scroller.scrollTop += bottom - area.bottom;
	}

	/**
	 * Nudge the slash menu to reposition when mobile keyboards resize the visual viewport.
	 */
	#registerVisualViewportReflow() {
		const viewport = typeof window !== 'undefined' ? window.visualViewport : null;
		if (!viewport) return;

		const reflow = () => {
			const editor = this.#editor;
			if (editor?.isFocused) editor.view.dispatch(editor.state.tr);
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
