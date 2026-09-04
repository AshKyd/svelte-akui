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
import type { Attachment } from 'svelte/attachments';

// TEMP: lifecycle tracing while debugging drag/drop. Set to false or remove once confirmed.
const DND_DEBUG = true;
function dndTrace(source: string, event: string, extra: Record<string, unknown> = {}) {
	if (DND_DEBUG) console.log(`[${source}]`, JSON.stringify({ event, ...extra }));
}

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
 * Global drag and drop manager for coordinating pointer and drag events with targets.
 */
export class DropManager {
	#activePayload = $state<DragPayload | null>(null);
	#isDragging = $state(false);
	#activeTarget = $state<RegisteredTarget | null>(null);
	#targets = new SvelteSet<RegisteredTarget>();
	// Plain mirror of #targets.size. `register()` runs inside an attachment effect, so
	// reading the reactive SvelteSet size there would make that effect depend on the set
	// it is mutating — an infinite register/unregister loop.
	#targetCount = 0;
	#lastNoMatchLog = 0;

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
	startDrag(payload: DragPayload) {
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
				if (i++ >= 4) break;
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

		if (DND_DEBUG && !matchedTarget && Date.now() - this.#lastNoMatchLog > 250) {
			this.#lastNoMatchLog = Date.now();
			const describe = (el: Element | undefined) =>
				el ? `${el.tagName}.${typeof el.className === 'string' ? el.className : '(svg)'}` : null;
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
			} else {
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
	handleDrop(event?: PointerEvent | DragEvent): boolean {
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

// --- Drag source ---------------------------------------------------------------

export interface DragMoveDetail {
	/** Pointer client X */
	x: number;
	/** Pointer client Y */
	y: number;
	/** Pointer X offset from where the drag began */
	dx: number;
	/** Pointer Y offset from where the drag began */
	dy: number;
}

/** Reason a drag ended without a drop. */
export type DragCancelReason = 'escape' | 'pointercancel' | 'detached';

export interface DragSourceOptions<T = unknown> {
	/** Builds the payload dispatched to the DropManager when the drag begins. Required. */
	getPayload: (ctx: { element: HTMLElement }) => DragPayload<T>;
	/** CSS selector for a drag handle; the drag only starts from a descendant that matches. */
	handleSelector?: string;
	/** Blocks drag initiation while true. */
	disabled?: boolean;
	/** Touch hold duration in milliseconds before a drag begins. Defaults to 350. */
	longPressDelay?: number;
	/** Mouse pointer travel in pixels before a drag begins. Defaults to 4. */
	mouseThreshold?: number;
	/** Invoked once, immediately after the drag begins. */
	ondragstart?: () => void;
	/** Invoked on every pointer move during a drag. */
	ondragmove?: (detail: DragMoveDetail) => void;
	/** Invoked on release. `handledExternally` is true when a drop target consumed the drop. */
	ondrop?: (detail: { handledExternally: boolean; event: PointerEvent }) => void;
	/** Invoked when a drag is aborted rather than dropped. */
	oncancel?: (reason: DragCancelReason) => void;
	/** Invoked last, after any drag ends (dropped or cancelled), once state is reset. */
	ondragend?: () => void;
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
export class DragSourceInstance<T = unknown> {
	#manager: DropManager;
	#options: DragSourceOptions<T>;

	#isDragging = $state(false);
	#delta = $state<{ x: number; y: number }>({ x: 0, y: 0 });
	#grabOffset = $state<{ x: number; y: number }>({ x: 0, y: 0 });

	#element: HTMLElement | null = null;
	#startX = 0;
	#startY = 0;
	#activePointerId: number | null = null;
	#pointerType: string = '';
	#longPressTimer: ReturnType<typeof setTimeout> | null = null;
	#gestureListenersAttached = false;
	#keyListenerAttached = false;
	#suppressNextClick = false;

	constructor(manager: DropManager, options: DragSourceOptions<T>) {
		this.#manager = manager;
		this.#options = options;
	}

	/** True while a drag gesture is active (after the start threshold, before release). */
	get isDragging(): boolean {
		return this.#isDragging;
	}

	/** Pointer offset from the grab point. `{ x: 0, y: 0 }` while idle. */
	get delta(): { x: number; y: number } {
		return this.#delta;
	}

	/** Pointer position within the element when the drag began, for anchoring a scale transform. */
	get grabOffset(): { x: number; y: number } {
		return this.#grabOffset;
	}

	updateOptions(newOptions: DragSourceOptions<T>) {
		this.#options = newOptions;
	}

	// Stable reference so `{@attach source.attach}` is not torn down and re-created on every re-render.
	#attachment: Attachment<HTMLElement> = (element: HTMLElement) => {
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
			} else {
				this.#teardownGesture();
			}
			this.#element = null;
		};
	};

	/** Svelte 5 attachment: `<div {@attach source.attach}>`. */
	get attach(): Attachment<HTMLElement> {
		return this.#attachment;
	}

	#onPointerDown = (e: PointerEvent) => {
		if (e.pointerType === 'mouse' && e.button !== 0) return;
		if (this.#options.disabled || !this.#element) return;

		const target = e.target;
		if (!(target instanceof Element)) return;
		const { handleSelector } = this.#options;
		if (handleSelector && !target.closest(handleSelector)) return;
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

	#onPointerMove = (e: PointerEvent) => {
		if (this.#activePointerId !== null && e.pointerId !== this.#activePointerId) return;

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
			if (!this.#isDragging) return;
		}

		e.preventDefault();
		this.#delta = { x: dx, y: dy };
		this.#manager.updatePointer(e.clientX, e.clientY);
		this.#options.ondragmove?.({ x: e.clientX, y: e.clientY, dx, dy });
	};

	#onPointerUp = (e: PointerEvent) => {
		if (this.#activePointerId !== null && e.pointerId !== this.#activePointerId) return;

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

	#onPointerCancel = (e: PointerEvent) => {
		if (this.#activePointerId !== null && e.pointerId !== this.#activePointerId) return;
		this.#cancel('pointercancel');
	};

	// While a drag is live the page must not scroll under it. `touch-action` alone
	// can't do this: a drag moves on both axes, and the element's touch-action is
	// fixed at pointerdown time (before the long-press promotes the gesture to a
	// drag), so a non-passive touchmove guard is required.
	#onTouchMove = (e: TouchEvent) => {
		if (this.#isDragging) e.preventDefault();
	};

	#onKeyDown = (e: KeyboardEvent) => {
		if (e.key !== 'Escape' || !this.#isDragging) return;
		e.preventDefault();
		this.#cancel('escape');
	};

	#onNativeDragStart = (e: DragEvent) => {
		e.preventDefault();
	};

	#onContextMenu = (e: MouseEvent) => {
		if (this.#isDragging || this.#longPressTimer || this.#gestureListenersAttached) {
			e.preventDefault();
		}
	};

	#onClickCapture = (e: MouseEvent) => {
		if (!this.#suppressNextClick) return;
		e.preventDefault();
		e.stopPropagation();
		this.#suppressNextClick = false;
	};

	#startDrag() {
		if (this.#isDragging || !this.#element) return;
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
			} catch {
				// Haptics are optional.
			}
		}

		if (!this.#keyListenerAttached && typeof window !== 'undefined') {
			window.addEventListener('keydown', this.#onKeyDown);
			this.#keyListenerAttached = true;
		}

		this.#options.ondragstart?.();
	}

	#cancel(reason: DragCancelReason) {
		const wasDragging = this.#isDragging;
		dndTrace('dragSource', 'cancel', { reason, wasDragging });
		if (wasDragging) this.#manager.cancelDrag();
		this.#teardownGesture();
		if (wasDragging) {
			this.#options.oncancel?.(reason);
			this.#resetDragState();
			this.#options.ondragend?.();
		}
	}

	#addGestureListeners() {
		if (this.#gestureListenersAttached || typeof window === 'undefined') return;
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
export function dragSource<T = unknown>(
	options: DragSourceOptions<T>,
	manager: DropManager = getDropManager()
): DragSourceInstance<T> {
	return new DragSourceInstance(manager, options);
}
