import type { Action } from 'svelte/action';

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
	#node = $state<HTMLElement | null>(null);

	constructor(initialValue: string, onChange: (val: string) => void) {
		this.#value = initialValue;
		this.#onChange = onChange;
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
			this.#replaceAllFn = replaceAll;

			if (this.#node !== node) return; // Guard against rapid re-initialization

			this.#crepeInstance = new Crepe({
				root: node,
				defaultValue: this.#value,
				features: {
					[Crepe.Feature.BlockEdit]: false
				},
				featureConfigs: {
					[Crepe.Feature.Cursor]: {
						virtual: false
					}
				}
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
		} catch (error) {
			console.error('Failed to load WYSIWYG editor:', error);
			this.loadError = true;
			this.loading = false;
		}
	}

	#destroy() {
		if (this.#crepeInstance) {
			this.#crepeInstance.destroy();
			this.#crepeInstance = null;
		}
	}
}
