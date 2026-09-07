/**
 * @file
 * Drag and drop coordinator for svelte-akui. Application-wide drag payload
 * tracking and hit-testing for registered drop targets. `dragSource()` (in
 * `dragSource.svelte.ts`) makes an element emit a payload; `dropTarget()` (in
 * `dropTarget.svelte.ts`) makes an element accept one. Both are pointer-based
 * and share one `DropManager`, provided per `UIRoot` via context.
 */

import { createContext } from 'svelte';
import { SvelteSet } from 'svelte/reactivity';
import type { DragPayload, DropTargetOptions } from './types.js';
import type { DropTargetInstance } from './dropTarget.svelte.js';

export interface RegisteredTarget {
	element: HTMLElement;
	options: DropTargetOptions;
	state: DropTargetInstance;
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
	register(
		element: HTMLElement,
		options: DropTargetOptions,
		instance: DropTargetInstance
	): () => void {
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
		const elementsAtPoint =
			typeof document !== 'undefined' ? document.elementsFromPoint(clientX, clientY) : [];

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
