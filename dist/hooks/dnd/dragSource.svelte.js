/**
 * @file
 * Drag-source primitive. `dragSource()` returns an instance whose `.attach` owns
 * the full pointer gesture, alongside reactive drag state. Use it directly for an
 * unstyled drag source, or reach for the `<Draggable>` component for the default
 * cursor-follow / scale / settle visuals.
 */
import { DropManager, getDropManager } from './manager.svelte.js';
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
            this.#teardownGesture();
            return;
        }
        const handledExternally = this.#manager.handleDrop(e);
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
        if (this.#isDragging) {
            e.preventDefault();
            return;
        }
        // Once the browser starts scrolling it owns the touch, and it may send neither
        // pointermove nor pointercancel — leaving the long-press timer to fire mid-scroll
        // and yank the card out from under the finger. touchmove always arrives, so the
        // "finger moved, this is a scroll" check has to live here as well.
        if (!this.#longPressTimer)
            return;
        const touch = e.touches[0];
        if (!touch)
            return;
        const moved = Math.hypot(touch.clientX - this.#startX, touch.clientY - this.#startY);
        if (moved > TOUCH_LONG_PRESS_SLOP) {
            clearTimeout(this.#longPressTimer);
            this.#longPressTimer = null;
        }
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
 * This is the primitive layer — no styling. `<Draggable>` wraps it with the default visuals.
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
 * No `<UIRoot>` needed: with no drag-scope context above it, `getDropManager()` returns a
 * shared browser-wide manager, so a bare `dropTarget()` elsewhere still sees this source.
 * Only when you *do* provide a scoped context (`<UIRoot>` / `setDropManagerContext`) and
 * build sources lazily from render scope must you grab the manager once at init with
 * `getDropManager()` and pass it as the second argument — the context is not reachable later.
 */
export function dragSource(options, manager = getDropManager()) {
    return new DragSourceInstance(manager, options);
}
