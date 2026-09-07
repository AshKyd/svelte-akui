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
/**
 * Global drag and drop manager for coordinating pointer and drag events with targets.
 */
export class DropManager {
    #activePayload = $state(null);
    #isDragging = $state(false);
    #activeTarget = $state(null);
    #targets = new SvelteSet();
    get activePayload() {
        return this.#activePayload;
    }
    get isDragging() {
        return this.#isDragging;
    }
    get activeTarget() {
        return this.#activeTarget;
    }
    /**
     * Registers a DOM element as an active drop target.
     */
    register(element, options, instance) {
        const targetRecord = {
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
    startDrag(payload) {
        this.#activePayload = payload;
        this.#isDragging = true;
    }
    /**
     * Hit-tests registered targets against pointer coordinates and updates hover states.
     */
    updatePointer(clientX, clientY) {
        if (!this.#isDragging || !this.#activePayload)
            return;
        // Use document.elementsFromPoint to find the topmost registered drop target
        const elementsAtPoint = typeof document !== 'undefined' ? document.elementsFromPoint(clientX, clientY) : [];
        let matchedTarget = null;
        for (const el of elementsAtPoint) {
            for (const target of this.#targets) {
                if (target.element === el || target.element.contains(el)) {
                    matchedTarget = target;
                    break;
                }
            }
            if (matchedTarget)
                break;
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
    handleDrop(event) {
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
export const [getDropManagerContext, setDropManagerContext] = createContext();
/**
 * Returns the DropManager from context or creates a fallback if rendered outside UIRoot.
 */
export function getDropManager() {
    try {
        return getDropManagerContext();
    }
    catch {
        // Fallback for isolated components/tests
        return new DropManager();
    }
}
