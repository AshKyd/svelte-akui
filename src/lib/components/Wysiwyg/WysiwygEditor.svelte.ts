import type { Action } from 'svelte/action';
import type { BlockEditFeatureConfig } from '@milkdown/crepe/feature/block-edit';

/**
 * Config for the Crepe "/" slash menu and block-drag-handle (the `BlockEdit` feature).
 * Set a group (`textGroup`/`listGroup`/`advancedGroup`) or item within it to `null` to hide it,
 * or provide `buildMenu` to append custom commands via Crepe's `GroupBuilder`.
 */
export type SlashMenuConfig = BlockEditFeatureConfig;

/**
 * Finds the ProseMirror document position at the end of the Nth word (0-indexed).
 * Clamps to the end of the document if index exceeds word count; returns null if empty.
 */
function docPositionForWordIndex(doc: any, targetIndex: number): number | null {
	let wordCount = 0;
	let result: number | null = null;
	let sawAnyText = false;

	doc.descendants((node: any, pos: number) => {
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
export class WysiwygEditorController {
	loading = $state(true);
	loadError = $state(false);

	#crepeInstance: any = null;
	#replaceAllFn: any = null;
	#onChange: (val: string) => void;
	#value = '';
	#options: WysiwygEditorOptions = {};
	#node = $state<HTMLElement | null>(null);

	// Crepe/Milkdown load on-demand (see #setup), so #crepeInstance isn't ready the instant this
	// controller (and the bound Wysiwyg component) exists. Anything that needs the live editor —
	// focusAtWordIndex included — awaits this instead of assuming #crepeInstance is already set.
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

	async #setup(node: HTMLElement) {
		this.loading = true;
		this.loadError = false;

		try {
			// Code-splitting Crepe and Milkdown modules so they load on-demand
			const { Crepe } = await import('@milkdown/crepe');
			const { replaceAll } = await import('@milkdown/kit/utils');
			const { editorViewOptionsCtx } = await import('@milkdown/kit/core');
			this.#replaceAllFn = replaceAll;

			if (this.#node !== node) return; // Guard against rapid re-initialization

			this.#crepeInstance = new Crepe({
				root: node,
				defaultValue: this.#value,
				features: {
					[Crepe.Feature.BlockEdit]: Boolean(this.#options.slashMenu),
					[Crepe.Feature.Placeholder]: Boolean(this.#options.placeholder)
				},
				featureConfigs: {
					[Crepe.Feature.Cursor]: {
						virtual: false
					},
					[Crepe.Feature.Placeholder]: {
						text: this.#options.placeholder || '',
						mode: 'doc'
					},
					[Crepe.Feature.BlockEdit]:
						typeof this.#options.slashMenu === 'object' ? this.#options.slashMenu : undefined
				}
			});

			this.#crepeInstance.editor.config((ctx: any) => {
				ctx.update(editorViewOptionsCtx, (prev: any) => ({
					...prev,
					transformPastedHTML: (html: string) => {
						const fn = this.#options.transformPastedHTML;
						return fn ? fn(html) : html;
					},
					transformPastedText: (text: string, plain: boolean) => {
						const fn = this.#options.transformPastedText;
						return fn ? fn(text, plain) : text;
					},
					handlePaste: (_view: any, event: ClipboardEvent) => {
						const fn = this.#options.handlePaste;
						if (fn) {
							const handled = fn(event);
							if (handled) return true;
						}
						return false;
					}
				}));
			});

			await this.#crepeInstance.create();

			if (this.#node !== node) {
				this.#destroy();
				return;
			}

			// Listen to content changes and synchronise value state
			this.#crepeInstance.on((listener: any) => {
				listener.markdownUpdated((_ctx: any, markdown: string) => {
					if (this.#value !== markdown) {
						this.#value = markdown;
						this.#onChange(markdown);
					}
				});
			});

			this.loading = false;
			console.debug('[Wysiwyg] editor ready');
		} catch (error) {
			console.error('Failed to load WYSIWYG editor:', error);
			this.loadError = true;
			this.loading = false;
		} finally {
			this.#resolveReady?.();
		}
	}

	/**
	 * Focuses the editor content editable element.
	 */
	focus(collapseToStart = true) {
		if (!this.#node) return false;
		const editorEl = this.#node.querySelector('[contenteditable="true"]') as HTMLElement | null;
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

	/**
	 * Places the cursor at (approximately) the Nth word of the document and focuses the editor.
	 * See {@link docPositionForWordIndex} for the word-counting rule the index must match.
	 */
	async focusAtWordIndex(index: number): Promise<boolean> {
		console.debug('[Wysiwyg] focusAtWordIndex called, awaiting editor readiness', { index });
		await this.#ready;

		if (!this.#crepeInstance) {
			console.debug('[Wysiwyg] focusAtWordIndex: no crepe instance after ready (load failed?)');
			return false;
		}

		const { editorViewCtx } = await import('@milkdown/kit/core');
		const { TextSelection } = await import('@milkdown/prose/state');

		let applied = false;
		this.#crepeInstance.editor.action((ctx: any) => {
			const view = ctx.get(editorViewCtx);
			const pos = docPositionForWordIndex(view.state.doc, index);
			console.debug('[Wysiwyg] focusAtWordIndex resolved doc position', {
				index,
				pos,
				docTextPreview: view.state.doc.textContent.slice(0, 200)
			});
			if (pos === null) return;

			const tr = view.state.tr.setSelection(TextSelection.create(view.state.doc, pos));
			view.dispatch(tr);
			view.focus();
			applied = true;
		});
		console.debug('[Wysiwyg] focusAtWordIndex applied?', applied);
		return applied;
	}

	#destroy() {
		if (this.#crepeInstance) {
			this.#crepeInstance.destroy();
			this.#crepeInstance = null;
		}
	}
}
