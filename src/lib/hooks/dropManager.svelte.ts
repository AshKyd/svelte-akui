/**
 * @file
 * Drag and drop coordinator for svelte-akui.
 * Provides application-wide drag payload tracking, hit-testing for registered
 * drop targets, and element attachments for drop target components.
 */

import { createContext } from 'svelte';
import { SvelteSet } from 'svelte/reactivity';
import type { Attachment } from 'svelte/attachments';

export interface DragPayload<T = unknown> {
	/** Identifier describing the type of payload (e.g. 'akui-masonry-item', 'note') */
	type: string;
	/** The payload data itself */
	data: T;
	/** Optional source identifier */
	source?: string;
}

export interface DropTargetOptions<T = unknown> {
	/** Predicate testing if the active drag payload is acceptable */
	canDrop?: (payload: DragPayload) => boolean;
	/** Callback invoked when a valid payload is dropped onto this target */
	ondrop?: (payload: DragPayload, event?: PointerEvent | DragEvent) => void;
	/** Callback invoked when a valid drag enters this target */
	ondragenter?: (payload: DragPayload) => void;
	/** Callback invoked when a drag leaves this target */
	ondragleave?: () => void;
}

export interface RegisteredTarget {
	element: HTMLElement;
	options: DropTargetOptions;
	state: DropTargetInstance;
}

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

	/**
	 * Svelte 5 attachment function to be used with `{@attach target.attach}`
	 */
	get attach(): Attachment<HTMLElement> {
		return (element: HTMLElement) => {
			const unregister = this.#manager.register(element, this.#options, this);
			return () => {
				unregister();
			};
		};
	}
}

/**
 * Global drag and drop manager for coordinating pointer and drag events with targets.
 */
export class DropManager {
	#activePayload = $state<DragPayload | null>(null);
	#isDragging = $state(false);
	#activeTarget = $state<RegisteredTarget | null>(null);
	#targets = new SvelteSet<RegisteredTarget>();

	get activePayload(): DragPayload | null {
		return this.#activePayload;
	}

	get isDragging(): boolean {
		return this.#isDragging;
	}

	get activeTarget(): RegisteredTarget | null {
		return this.#activeTarget;
	}

	/**
	 * Registers a DOM element as an active drop target.
	 */
	register(element: HTMLElement, options: DropTargetOptions, instance: DropTargetInstance): () => void {
		const targetRecord: RegisteredTarget = {
			element,
			options,
			state: instance
		};
		this.#targets.add(targetRecord);

		return () => {
			if (this.#activeTarget === targetRecord) {
				this.#clearActiveTarget();
			}
			this.#targets.delete(targetRecord);
		};
	}

	/**
	 * Initiates a global drag session with the given payload.
	 */
	startDrag(payload: DragPayload) {
		this.#activePayload = payload;
		this.#isDragging = true;
	}

	/**
	 * Hit-tests registered targets against pointer coordinates and updates hover states.
	 */
	updatePointer(clientX: number, clientY: number) {
		if (!this.#isDragging || !this.#activePayload) return;

		// Use document.elementsFromPoint to find the topmost registered drop target
		const elementsAtPoint = typeof document !== 'undefined' ? document.elementsFromPoint(clientX, clientY) : [];

		let matchedTarget: RegisteredTarget | null = null;

		for (const el of elementsAtPoint) {
			for (const target of this.#targets) {
				if (target.element === el || target.element.contains(el)) {
					matchedTarget = target;
					break;
				}
			}
			if (matchedTarget) break;
		}

		if (matchedTarget !== this.#activeTarget) {
			this.#clearActiveTarget();

			if (matchedTarget) {
				const isAllowed = matchedTarget.options.canDrop
					? matchedTarget.options.canDrop(this.#activePayload)
					: true;

				matchedTarget.state.setHover(true, isAllowed);
				if (isAllowed) {
					matchedTarget.options.ondragenter?.(this.#activePayload);
				}
				this.#activeTarget = matchedTarget;
			}
		}
	}

	#clearActiveTarget() {
		if (this.#activeTarget) {
			this.#activeTarget.state.setHover(false, false);
			this.#activeTarget.options.ondragleave?.();
			this.#activeTarget = null;
		}
	}

	/**
	 * Commits drop if pointer is currently over a valid drop target.
	 * Returns true if handled by a drop target.
	 */
	handleDrop(event?: PointerEvent | DragEvent): boolean {
		if (!this.#isDragging || !this.#activePayload) {
			this.endDrag();
			return false;
		}

		const currentTarget = this.#activeTarget;
		const payload = this.#activePayload;

		if (currentTarget && currentTarget.state.canDrop) {
			currentTarget.options.ondrop?.(payload, event);
			this.#clearActiveTarget();
			this.endDrag();
			return true;
		}

		this.#clearActiveTarget();
		this.endDrag();
		return false;
	}

	/**
	 * Cancels drag operation without triggering a drop.
	 */
	cancelDrag() {
		this.#clearActiveTarget();
		this.endDrag();
	}

	/**
	 * Resets drag state.
	 */
	endDrag() {
		this.#clearActiveTarget();
		this.#isDragging = false;
		this.#activePayload = null;
	}
}

/**
 * Type-safe context for DropManager in Svelte 5.
 */
export const [getDropManagerContext, setDropManagerContext] = createContext<DropManager>();

/**
 * Returns the DropManager from context or creates a fallback if rendered outside UIRoot.
 */
export function getDropManager(): DropManager {
	try {
		return getDropManagerContext();
	} catch {
		// Fallback for isolated components/tests
		return new DropManager();
	}
}

/**
 * Creates a drop target instance that provides an attachment and reactive hover state.
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
 */
export function dropTarget<T = unknown>(options: DropTargetOptions<T> = {}): DropTargetInstance {
	const manager = getDropManager();
	return new DropTargetInstance(manager, options);
}
