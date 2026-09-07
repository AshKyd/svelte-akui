/**
 * @file
 * Drop-target primitive. `dropTarget()` returns an instance whose `.attach` makes
 * an element accept drag payloads, alongside reactive hover state. Use it directly
 * for an unstyled drop target, or reach for the `<DropTarget>` component for the
 * default styling.
 */

import type { Attachment } from 'svelte/attachments';
import type { DragPayload, DropTargetOptions } from './types.js';
import { DropManager, getDropManager } from './manager.svelte.js';

/**
 * Reactive drop target state instance bound to an element attachment.
 */
export class DropTargetInstance {
	#manager: DropManager;
	#options: DropTargetOptions;
	#isOver = $state(false);
	#canDrop = $state(false);

	constructor(manager: DropManager, options: DropTargetOptions) {
		this.#manager = manager;
		this.#options = options;
	}

	get isDragging(): boolean {
		return this.#manager.isDragging;
	}

	get isOver(): boolean {
		return this.#isOver;
	}

	get canDrop(): boolean {
		return this.#canDrop;
	}

	get activePayload(): DragPayload | null {
		return this.#manager.activePayload;
	}

	get options(): DropTargetOptions {
		return this.#options;
	}

	updateOptions(newOptions: DropTargetOptions) {
		this.#options = newOptions;
	}

	setHover(isOver: boolean, canDrop: boolean) {
		this.#isOver = isOver;
		this.#canDrop = canDrop;
	}

	// Stable reference so `{@attach target.attach}` is not torn down and re-created on every re-render.
	#attachment: Attachment<HTMLElement> = (element: HTMLElement) => {
		const unregister = this.#manager.register(element, this.#options, this);
		return () => {
			unregister();
		};
	};

	/**
	 * Svelte 5 attachment function to be used with `{@attach target.attach}`
	 */
	get attach(): Attachment<HTMLElement> {
		return this.#attachment;
	}
}

/**
 * Creates a drop target instance that provides an attachment and reactive hover state.
 * This is the primitive layer — no styling. `<DropTarget>` wraps it with the default look.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { dropTarget } from 'svelte-akui';
 *   const target = dropTarget({
 *     canDrop: (payload) => payload.type === 'note',
 *     ondrop: (payload) => handleDrop(payload.data)
 *   });
 * </script>
 *
 * <div {@attach target.attach} class:hovering={target.isOver && target.canDrop}>
 *   Drop here
 * </div>
 * ```
 *
 * The manager is read from context, so call this during component initialisation. To build
 * targets later (lazily, per list item), grab the manager once at init with
 * `getDropManager()` and pass it as the second argument.
 */
export function dropTarget<T = unknown>(
	options: DropTargetOptions<T> = {},
	manager: DropManager = getDropManager()
): DropTargetInstance {
	return new DropTargetInstance(manager, options);
}
