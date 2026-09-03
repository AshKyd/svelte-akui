/**
 * @file
 * Drag and drop coordinator for svelte-akui.
 * Provides application-wide drag payload tracking, hit-testing for registered
 * drop targets, and element attachments for drop target components.
 */
import { createContext } from 'svelte';
import { SvelteSet } from 'svelte/reactivity';
/**
 * Reactive drop target state instance bound to an element attachment.
 */
export class DropTargetInstance {
    #manager;
    #options;
    #isOver = $state(false);
    #canDrop = $state(false);
    constructor(manager, options) {
        this.#manager = manager;
        this.#options = options;
    }
    get isDragging() {
        return this.#manager.isDragging;
    }
    get isOver() {
        return this.#isOver;
    }
    get canDrop() {
        return this.#canDrop;
    }
    get activePayload() {
        return this.#manager.activePayload;
    }
    get options() {
        return this.#options;
    }
    updateOptions(newOptions) {
        this.#options = newOptions;
    }
    setHover(isOver, canDrop) {
        this.#isOver = isOver;
        this.#canDrop = canDrop;
    }
    /**
     * Svelte 5 attachment function to be used with `{@attach target.attach}`
     */
    get attach() {
        return (element) => {
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
export function dropTarget(options = {}) {
    const manager = getDropManager();
    return new DropTargetInstance(manager, options);
}
