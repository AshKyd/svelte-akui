/**
 * @file
 * Drag and drop coordinator for svelte-akui. Application-wide drag payload
 * tracking and hit-testing for registered drop targets. `dragSource()` (in
 * `dragSource.svelte.ts`) makes an element emit a payload; `dropTarget()` (in
 * `dropTarget.svelte.ts`) makes an element accept one. Both are pointer-based
 * and share one `DropManager`: a shared browser-wide coordinator by default, or an
 * isolated instance when `setDropManagerContext` provides one via context.
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
 * Type-safe context for DropManager in Svelte 5. Consumers that want an isolated
 * drag scope (a portalled overlay, a test) can call `setDropManagerContext(new DropManager())`
 * during component init.
 */
export const [getDropManagerContext, setDropManagerContext] = createContext();
/**
 * Browser-wide manager. Lazily created so drag and drop works with no setup and no
 * context at all — the standard case. A context set by `setDropManagerContext`
 * wins over this.
 */
let fallbackManager;
/**
 * Returns the DropManager for the current component: the one from context if
 * `setDropManagerContext` is above it, otherwise the shared browser-wide manager.
 * So bare `dragSource()` and `dropTarget()` elements anywhere on the page see each
 * other with zero setup.
 *
 * On the server there is no context and no shared state to keep, so each call
 * gets a throwaway instance — nothing registers targets or drags during SSR.
 */
export function getDropManager() {
    try {
        return getDropManagerContext();
    }
    catch {
        if (typeof window === 'undefined')
            return new DropManager();
        return (fallbackManager ??= new DropManager());
    }
}
/**
 * Drops the shared fallback manager so the next `getDropManager()` (outside any
 * context) builds a fresh one. For tests that need isolation between cases.
 */
export function resetDropManager() {
    fallbackManager = undefined;
}
