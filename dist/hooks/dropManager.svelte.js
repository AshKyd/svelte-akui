/**
 * @file
 * Drag and drop coordinator for svelte-akui.
 * Provides application-wide drag payload tracking, hit-testing for registered
 * drop targets, and element attachments for both drop target and drag source
 * components. `dropTarget()` makes an element accept payloads; `dragSource()`
 * makes an element emit one. Both are pointer-based and share one `DropManager`.
 */
import { createContext } from 'svelte';
import { SvelteSet } from 'svelte/reactivity';
// TEMP: lifecycle tracing while debugging drag/drop. Set to false or remove once confirmed.
const DND_DEBUG = true;
function dndTrace(source, event, extra = {}) {
    if (DND_DEBUG)
        console.log(`[${source}]`, JSON.stringify({ event, ...extra }));
}
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
    // Stable reference so `{@attach target.attach}` is not torn down and re-created on every re-render.
    #attachment = (element) => {
        const unregister = this.#manager.register(element, this.#options, this);
        return () => {
            unregister();
        };
    };
    /**
     * Svelte 5 attachment function to be used with `{@attach target.attach}`
     */
    get attach() {
        return this.#attachment;
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
    // Plain mirror of #targets.size. `register()` runs inside an attachment effect, so
    // reading the reactive SvelteSet size there would make that effect depend on the set
    // it is mutating — an infinite register/unregister loop.
    #targetCount = 0;
    #lastNoMatchLog = 0;
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
        this.#targetCount++;
        dndTrace('DropManager', 'register', {
            total: this.#targetCount,
            el: element.tagName,
            cls: element.className
        });
        return () => {
            if (this.#activeTarget === targetRecord) {
                this.#clearActiveTarget();
            }
            this.#targets.delete(targetRecord);
            this.#targetCount--;
            dndTrace('DropManager', 'unregister', { total: this.#targetCount });
        };
    }
    /**
     * Initiates a global drag session with the given payload.
     */
    startDrag(payload) {
        this.#activePayload = payload;
        this.#isDragging = true;
        dndTrace('DropManager', 'startDrag', {
            type: payload.type,
            source: payload.source,
            targets: this.#targetCount
        });
        if (DND_DEBUG) {
            let i = 0;
            for (const t of this.#targets) {
                if (i++ >= 4)
                    break;
                const r = t.element.getBoundingClientRect();
                dndTrace('DropManager', 'target', {
                    tag: t.element.tagName,
                    cls: t.element.className,
                    connected: t.element.isConnected,
                    box: `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}`
                });
            }
        }
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
        if (DND_DEBUG && !matchedTarget && Date.now() - this.#lastNoMatchLog > 250) {
            this.#lastNoMatchLog = Date.now();
            const describe = (el) => el ? `${el.tagName}.${typeof el.className === 'string' ? el.className : '(svg)'}` : null;
            dndTrace('DropManager', 'updatePointer:noMatch', {
                at: `${Math.round(clientX)},${Math.round(clientY)}`,
                targets: this.#targetCount,
                count: elementsAtPoint.length,
                stack: elementsAtPoint.slice(0, 8).map(describe)
            });
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
                dndTrace('DropManager', 'enterTarget', { canDrop: isAllowed });
            }
            else {
                dndTrace('DropManager', 'leaveTarget');
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
            dndTrace('DropManager', 'handleDrop:noop', {
                isDragging: this.#isDragging,
                hasPayload: !!this.#activePayload
            });
            this.endDrag();
            return false;
        }
        const currentTarget = this.#activeTarget;
        const payload = this.#activePayload;
        if (currentTarget && currentTarget.state.canDrop) {
            dndTrace('DropManager', 'handleDrop:accepted');
            currentTarget.options.ondrop?.(payload, event);
            this.#clearActiveTarget();
            this.endDrag();
            return true;
        }
        dndTrace('DropManager', 'handleDrop:rejected', {
            hasTarget: !!currentTarget,
            canDrop: currentTarget?.state.canDrop ?? null
        });
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
 *
 * The manager is read from context, so call this during component initialisation. To build
 * targets later (lazily, per list item), grab the manager once at init with
 * `getDropManager()` and pass it as the second argument.
 */
export function dropTarget(options = {}, manager = getDropManager()) {
    return new DropTargetInstance(manager, options);
}
/** Distance in pixels a touch pointer may drift before the long-press is treated as a scroll. */
const TOUCH_LONG_PRESS_SLOP = 8;
/**
 * Reactive drag source state instance bound to an element attachment.
 *
 * Owns the full pointer gesture: the start gate (mouse travel threshold / touch
 * long-press), pointer capture, native-drag suppression, a one-shot trailing-click
 * swallow, Escape-to-cancel, and driving the DropManager. It applies no styling —
 * `<Draggable>` layers the default drag visuals on top.
 */
export class DragSourceInstance {
    #manager;
    #options;
    #isDragging = $state(false);
    #delta = $state({ x: 0, y: 0 });
    #grabOffset = $state({ x: 0, y: 0 });
    #element = null;
    #startX = 0;
    #startY = 0;
    #activePointerId = null;
    #pointerType = '';
    #longPressTimer = null;
    #gestureListenersAttached = false;
    #keyListenerAttached = false;
    #suppressNextClick = false;
    constructor(manager, options) {
        this.#manager = manager;
        this.#options = options;
    }
    /** True while a drag gesture is active (after the start threshold, before release). */
    get isDragging() {
        return this.#isDragging;
    }
    /** Pointer offset from the grab point. `{ x: 0, y: 0 }` while idle. */
    get delta() {
        return this.#delta;
    }
    /** Pointer position within the element when the drag began, for anchoring a scale transform. */
    get grabOffset() {
        return this.#grabOffset;
    }
    updateOptions(newOptions) {
        this.#options = newOptions;
    }
    // Stable reference so `{@attach source.attach}` is not torn down and re-created on every re-render.
    #attachment = (element) => {
        this.#element = element;
        element.addEventListener('pointerdown', this.#onPointerDown);
        element.addEventListener('dragstart', this.#onNativeDragStart);
        element.addEventListener('contextmenu', this.#onContextMenu);
        element.addEventListener('click', this.#onClickCapture, true);
        // Non-passive so preventDefault() can stop the page scrolling under an active
        // drag. The element's `touch-action` is `pan-y` (see Draggable.svelte) so a
        // plain swipe scrolls; this guard only bites once `#isDragging` is true.
        element.addEventListener('touchmove', this.#onTouchMove, { passive: false });
        return () => {
            element.removeEventListener('pointerdown', this.#onPointerDown);
            element.removeEventListener('dragstart', this.#onNativeDragStart);
            element.removeEventListener('contextmenu', this.#onContextMenu);
            element.removeEventListener('click', this.#onClickCapture, true);
            element.removeEventListener('touchmove', this.#onTouchMove);
            if (this.#isDragging) {
                this.#manager.cancelDrag();
                this.#teardownGesture();
                this.#options.oncancel?.('detached');
                this.#resetDragState();
                this.#options.ondragend?.();
            }
            else {
                this.#teardownGesture();
            }
            this.#element = null;
        };
    };
    /** Svelte 5 attachment: `<div {@attach source.attach}>`. */
    get attach() {
        return this.#attachment;
    }
    #onPointerDown = (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0)
            return;
        if (this.#options.disabled || !this.#element)
            return;
        const target = e.target;
        if (!(target instanceof Element))
            return;
        const { handleSelector } = this.#options;
        if (handleSelector && !target.closest(handleSelector))
            return;
        if (!handleSelector && target.closest('input, textarea, select, [contenteditable="true"]'))
            return;
        dndTrace('dragSource', 'pointerdown', { pointerType: e.pointerType });
        this.#suppressNextClick = false;
        this.#startX = e.clientX;
        this.#startY = e.clientY;
        this.#activePointerId = e.pointerId;
        this.#pointerType = e.pointerType;
        const rect = this.#element.getBoundingClientRect();
        this.#grabOffset = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        // No setPointerCapture: it redirects the trailing `click` and breaks in-card links
        // even when the press was never a drag. The window listeners below track the whole
        // gesture without it.
        this.#addGestureListeners();
        if (e.pointerType === 'touch') {
            const delay = this.#options.longPressDelay ?? 350;
            this.#longPressTimer = setTimeout(() => this.#startDrag(), delay);
        }
    };
    #onPointerMove = (e) => {
        if (this.#activePointerId !== null && e.pointerId !== this.#activePointerId)
            return;
        const dx = e.clientX - this.#startX;
        const dy = e.clientY - this.#startY;
        const distance = Math.hypot(dx, dy);
        // A moving finger before the hold completes means the user is scrolling, not dragging.
        if (this.#longPressTimer && distance > TOUCH_LONG_PRESS_SLOP) {
            clearTimeout(this.#longPressTimer);
            this.#longPressTimer = null;
        }
        if (!this.#isDragging) {
            const threshold = this.#options.mouseThreshold ?? 4;
            if (this.#pointerType === 'mouse' && distance > threshold) {
                this.#startDrag();
            }
            if (!this.#isDragging)
                return;
        }
        e.preventDefault();
        this.#delta = { x: dx, y: dy };
        this.#manager.updatePointer(e.clientX, e.clientY);
        this.#options.ondragmove?.({ x: e.clientX, y: e.clientY, dx, dy });
    };
    #onPointerUp = (e) => {
        if (this.#activePointerId !== null && e.pointerId !== this.#activePointerId)
            return;
        if (!this.#isDragging) {
            dndTrace('dragSource', 'pointerup:noDrag');
            this.#teardownGesture();
            return;
        }
        const handledExternally = this.#manager.handleDrop(e);
        dndTrace('dragSource', 'pointerup:drop', { handledExternally });
        this.#teardownGesture();
        this.#options.ondrop?.({ handledExternally, event: e });
        this.#resetDragState();
        this.#options.ondragend?.();
    };
    #onPointerCancel = (e) => {
        if (this.#activePointerId !== null && e.pointerId !== this.#activePointerId)
            return;
        this.#cancel('pointercancel');
    };
    // While a drag is live the page must not scroll under it. `touch-action` alone
    // can't do this: a drag moves on both axes, and the element's touch-action is
    // fixed at pointerdown time (before the long-press promotes the gesture to a
    // drag), so a non-passive touchmove guard is required.
    #onTouchMove = (e) => {
        if (this.#isDragging)
            e.preventDefault();
    };
    #onKeyDown = (e) => {
        if (e.key !== 'Escape' || !this.#isDragging)
            return;
        e.preventDefault();
        this.#cancel('escape');
    };
    #onNativeDragStart = (e) => {
        e.preventDefault();
    };
    #onContextMenu = (e) => {
        if (this.#isDragging || this.#longPressTimer || this.#gestureListenersAttached) {
            e.preventDefault();
        }
    };
    #onClickCapture = (e) => {
        if (!this.#suppressNextClick)
            return;
        e.preventDefault();
        e.stopPropagation();
        this.#suppressNextClick = false;
    };
    #startDrag() {
        if (this.#isDragging || !this.#element)
            return;
        if (this.#longPressTimer) {
            clearTimeout(this.#longPressTimer);
            this.#longPressTimer = null;
        }
        this.#isDragging = true;
        this.#suppressNextClick = true;
        this.#delta = { x: 0, y: 0 };
        dndTrace('dragSource', 'startDrag', { pointerType: this.#pointerType });
        const payload = this.#options.getPayload({ element: this.#element });
        this.#manager.startDrag(payload);
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            try {
                navigator.vibrate(40);
            }
            catch {
                // Haptics are optional.
            }
        }
        if (!this.#keyListenerAttached && typeof window !== 'undefined') {
            window.addEventListener('keydown', this.#onKeyDown);
            this.#keyListenerAttached = true;
        }
        this.#options.ondragstart?.();
    }
    #cancel(reason) {
        const wasDragging = this.#isDragging;
        dndTrace('dragSource', 'cancel', { reason, wasDragging });
        if (wasDragging)
            this.#manager.cancelDrag();
        this.#teardownGesture();
        if (wasDragging) {
            this.#options.oncancel?.(reason);
            this.#resetDragState();
            this.#options.ondragend?.();
        }
    }
    #addGestureListeners() {
        if (this.#gestureListenersAttached || typeof window === 'undefined')
            return;
        window.addEventListener('pointermove', this.#onPointerMove);
        window.addEventListener('pointerup', this.#onPointerUp);
        window.addEventListener('pointercancel', this.#onPointerCancel);
        this.#gestureListenersAttached = true;
    }
    #teardownGesture() {
        if (this.#longPressTimer) {
            clearTimeout(this.#longPressTimer);
            this.#longPressTimer = null;
        }
        if (this.#gestureListenersAttached && typeof window !== 'undefined') {
            window.removeEventListener('pointermove', this.#onPointerMove);
            window.removeEventListener('pointerup', this.#onPointerUp);
            window.removeEventListener('pointercancel', this.#onPointerCancel);
        }
        if (this.#keyListenerAttached && typeof window !== 'undefined') {
            window.removeEventListener('keydown', this.#onKeyDown);
        }
        this.#gestureListenersAttached = false;
        this.#keyListenerAttached = false;
        this.#activePointerId = null;
    }
    #resetDragState() {
        this.#isDragging = false;
        this.#delta = { x: 0, y: 0 };
        this.#grabOffset = { x: 0, y: 0 };
    }
}
/**
 * Creates a drag source instance that provides an attachment and reactive drag state.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { dragSource } from 'svelte-akui';
 *   const source = dragSource({
 *     getPayload: () => ({ type: 'note', data: note })
 *   });
 * </script>
 *
 * <div {@attach source.attach} class:dragging={source.isDragging}>
 *   Drag me
 * </div>
 * ```
 *
 * The manager is read from context, so call this during component initialisation. To build
 * sources later (lazily, per list item), grab the manager once at init with
 * `getDropManager()` and pass it as the second argument.
 */
export function dragSource(options, manager = getDropManager()) {
    return new DragSourceInstance(manager, options);
}
