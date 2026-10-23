import { panBy, screenToWorld, zoomAbout } from './viewTransform';
/** Multiplier on trackpad pinch deltas (reported as ctrl+wheel). */
const WHEEL_ZOOM_SPEED = 0.01;
/** A touch contact wider than this (CSS px) is a palm or fist, not a fingertip. */
const PALM_CONTACT_PX = 40;
/** The palm often lands as the pen lifts, so touches this soon after a pen release are ignored. */
const PALM_AFTER_PEN_MS = 300;
/**
 * Decides what each pointer does:
 * - one pointer (mouse, pen or touch) runs the active tool;
 * - a second touch cancels the tool and the two fingers pan and zoom;
 * - once a pen has been seen, a single touch is ignored (palm rejection) but two still pan/zoom;
 * - mouse wheel pans, ctrl+wheel (trackpad pinch) zooms, middle button or Space+drag pans.
 *
 * Listeners are added with `addEventListener` rather than Svelte's `on*` attributes because wheel
 * handlers there are passive and couldn't stop the page scrolling or browser zooming.
 */
export function createPointerGestures({ getTool, getView, setView }) {
    const pointers = new Map();
    let mode = 'idle';
    let activeId = -1;
    /** The `pointerType` running the tool, so touches can't interrupt a pen stroke. */
    let activeType = '';
    let lastPenUpAt = -Infinity;
    let hasSeenPen = false;
    let isSpaceHeld = false;
    let lastPinch = null;
    /** Fixed when the press lands, so releasing Alt mid-stroke can't swap the tool halfway through. */
    let activeTool = null;
    function attach(node) {
        const toScreen = (event) => {
            const rect = node.getBoundingClientRect();
            return [event.clientX - rect.left, event.clientY - rect.top];
        };
        const toSample = (event) => ({
            world: screenToWorld(getView(), toScreen(event)),
            pressure: event.pressure || 0.5,
            pointerType: event.pointerType
        });
        const touchPoints = () => [...pointers.values()].filter(({ type }) => type === 'touch').map(({ point }) => point);
        /** Midpoint and spread of the first two fingers, or null with fewer than two. */
        const measurePinch = () => {
            const [a, b] = touchPoints();
            if (!a || !b)
                return null;
            return {
                mid: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2],
                distance: Math.hypot(a[0] - b[0], a[1] - b[1])
            };
        };
        /** A touch is dropped before it is even tracked when it is a resting palm, not a fingertip. */
        const isPalm = (event) => event.width > PALM_CONTACT_PX ||
            event.height > PALM_CONTACT_PX ||
            event.timeStamp - lastPenUpAt < PALM_AFTER_PEN_MS;
        const onPointerDown = (event) => {
            // Controls laid over the canvas (toolbar, size menu) keep their own clicks. Svelte's
            // delegated `onpointerdown` fires too late to stop propagation, so the check lives here.
            if (event.target instanceof Element && event.target.closest('[data-gesture-ignore]'))
                return;
            // Stops Safari following up with mouse events, which start a text selection drag.
            if (event.pointerType !== 'mouse')
                event.preventDefault();
            const isPenStroke = mode === 'tool' && activeType === 'pen';
            if (event.pointerType === 'touch' && (isPenStroke || isPalm(event)))
                return;
            // A pen beats anything a palm or finger started before it landed.
            if (event.pointerType === 'pen' && mode !== 'idle') {
                if (mode === 'tool')
                    activeTool?.cancel();
                activeTool = null;
                pointers.clear();
                mode = 'idle';
            }
            // A fresh touch sequence can't be a leftover of the last one.
            if (pointers.size === 0)
                mode = 'idle';
            pointers.set(event.pointerId, { point: toScreen(event), type: event.pointerType });
            // Keeps move/up events coming when the pointer leaves the box. Throws for synthetic
            // pointers that the browser doesn't know, which only tests send.
            try {
                node.setPointerCapture(event.pointerId);
            }
            catch {
                /* capture is a nicety, not required */
            }
            if (event.pointerType === 'pen')
                hasSeenPen = true;
            if (mode === 'gesture')
                return;
            if (touchPoints().length >= 2) {
                // The first finger was probably the start of a pinch, so drop its stroke.
                if (mode === 'tool')
                    activeTool?.cancel();
                mode = 'gesture';
                lastPinch = measurePinch();
                return;
            }
            if (mode !== 'idle')
                return;
            if (event.pointerType === 'touch' && hasSeenPen)
                return;
            if (event.button === 1 || isSpaceHeld) {
                mode = 'pan';
                activeId = event.pointerId;
                return;
            }
            if (event.button !== 0)
                return;
            mode = 'tool';
            activeId = event.pointerId;
            activeType = event.pointerType;
            activeTool = getTool(event.altKey);
            activeTool.start(toSample(event));
        };
        const onPointerMove = (event) => {
            const tracked = pointers.get(event.pointerId);
            if (!tracked)
                return;
            const previous = tracked.point;
            tracked.point = toScreen(event);
            if (mode === 'tool' && event.pointerId === activeId) {
                // Coalesced events recover samples the browser merged between frames: smoother pen lines.
                const samples = event.getCoalescedEvents?.() ?? [];
                (samples.length ? samples : [event]).forEach((sample) => activeTool?.move(toSample(sample)));
                return;
            }
            if (mode === 'pan' && event.pointerId === activeId) {
                setView(panBy(getView(), tracked.point[0] - previous[0], tracked.point[1] - previous[1]));
                return;
            }
            if (mode === 'gesture') {
                const pinch = measurePinch();
                if (pinch && lastPinch && lastPinch.distance > 0) {
                    const panned = panBy(getView(), pinch.mid[0] - lastPinch.mid[0], pinch.mid[1] - lastPinch.mid[1]);
                    setView(zoomAbout(panned, pinch.mid, pinch.distance / lastPinch.distance));
                }
                lastPinch = pinch;
            }
        };
        const onPointerEnd = (event) => {
            if (!pointers.delete(event.pointerId))
                return;
            if (event.pointerType === 'pen')
                lastPenUpAt = event.timeStamp;
            if (mode === 'tool' && event.pointerId === activeId) {
                if (event.type === 'pointercancel')
                    activeTool?.cancel();
                else
                    activeTool?.end();
                activeTool = null;
                mode = 'idle';
            }
            else if (mode === 'pan' && event.pointerId === activeId) {
                mode = 'idle';
            }
            else if (mode === 'gesture') {
                // Stay in gesture mode until every finger is up, so a remaining finger can't start a stroke.
                lastPinch = measurePinch();
                if (pointers.size === 0)
                    mode = 'idle';
            }
        };
        const onWheel = (event) => {
            event.preventDefault();
            if (event.ctrlKey) {
                setView(zoomAbout(getView(), toScreen(event), Math.exp(-event.deltaY * WHEEL_ZOOM_SPEED)));
                return;
            }
            setView(panBy(getView(), -event.deltaX, -event.deltaY));
        };
        const isTypingTarget = (target) => target instanceof HTMLElement &&
            (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
        const onKeyDown = (event) => {
            if (event.code !== 'Space' || isTypingTarget(event.target))
                return;
            isSpaceHeld = true;
            // Stops the page scrolling while Space is the pan modifier.
            if (event.target === document.body)
                event.preventDefault();
        };
        const onKeyUp = (event) => {
            if (event.code === 'Space')
                isSpaceHeld = false;
        };
        // Context menu, text selection, drags and Safari's own pinch would all steal a pen or touch drag.
        const onContextMenu = (event) => event.preventDefault();
        const blockedEvents = ['selectstart', 'dragstart', 'gesturestart', 'gesturechange'];
        blockedEvents.forEach((type) => node.addEventListener(type, onContextMenu));
        node.addEventListener('pointerdown', onPointerDown);
        node.addEventListener('pointermove', onPointerMove);
        node.addEventListener('pointerup', onPointerEnd);
        node.addEventListener('pointercancel', onPointerEnd);
        node.addEventListener('wheel', onWheel, { passive: false });
        node.addEventListener('contextmenu', onContextMenu);
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        return () => {
            node.removeEventListener('pointerdown', onPointerDown);
            node.removeEventListener('pointermove', onPointerMove);
            node.removeEventListener('pointerup', onPointerEnd);
            node.removeEventListener('pointercancel', onPointerEnd);
            node.removeEventListener('wheel', onWheel);
            node.removeEventListener('contextmenu', onContextMenu);
            blockedEvents.forEach((type) => node.removeEventListener(type, onContextMenu));
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
        };
    }
    return { attach };
}
