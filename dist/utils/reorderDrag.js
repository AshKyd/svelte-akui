/**
 * Pointer-driven "drag to reorder" for a vertical run of sibling elements.
 *
 * Shared by the `Wysiwyg` task items and the `Tree`. It owns the pointer maths only; the caller
 * draws the result. While dragging, `onUpdate` reports how far the dragged item has been pulled
 * (`offsetY`), the gap it would drop into (`slot`) and how far its siblings must slide to make room
 * (`shiftY`). The caller renders those as CSS transforms, so the real order never changes until
 * `onEnd` reports the drop and the caller reorders its data once. The siblings are already sitting
 * where they end up, so only the dragged item appears to move.
 *
 * Pointer events (not HTML5 drag and drop) are used so it works by touch too.
 */
/** Distance from a scroll container's edge at which dragging scrolls it. */
const AUTOSCROLL_EDGE_PX = 40;
const AUTOSCROLL_STEP_PX = 14;
// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------
/**
 * The gap a dragged item would drop into, given its resting `index` and how far it has been pulled
 * (`offsetY`, down is positive). An item passes a sibling once its leading edge (bottom edge going
 * down, top edge going up) crosses that sibling's midpoint. Using the leading edge, not the
 * centre, means a clamped item at the end of the list still reaches the last slot. Capped at
 * `maxSlot` so the item can't pass into fixed items after it.
 */
export function dropSlotFromOffset(rects, index, offsetY, maxSlot) {
    const midpoint = ({ top, bottom }) => (top + bottom) / 2;
    const own = rects[index];
    if (offsetY >= 0) {
        const leadingEdge = own.bottom + offsetY;
        const passed = rects.filter((rect, k) => k > index && midpoint(rect) < leadingEdge).length;
        return Math.min(index + 1 + passed, maxSlot);
    }
    const leadingEdge = own.top + offsetY;
    return rects.filter((rect, k) => k < index && midpoint(rect) < leadingEdge).length;
}
/**
 * Index the dragged item ends up at once it is removed and re-inserted into `slot`, or null when
 * that leaves it where it is (dropping into the gap just before or after itself).
 */
export function reorderTargetIndex(fromIndex, slot) {
    if (slot === fromIndex || slot === fromIndex + 1)
        return null;
    return slot > fromIndex ? slot - 1 : slot;
}
/**
 * How far the sibling at `siblingIndex` slides while `index` is dragged into `slot`: up by `shiftY`
 * when the item passed over it going down, down by `shiftY` when going up, otherwise not at all.
 */
export function siblingShift({ siblingIndex, index, slot, shiftY }) {
    if (siblingIndex > index && siblingIndex < slot)
        return -shiftY;
    if (siblingIndex < index && siblingIndex >= slot)
        return shiftY;
    return 0;
}
// ---------------------------------------------------------------------------
// Pointer handling
// ---------------------------------------------------------------------------
function nearestScrollContainer(element) {
    for (let current = element.parentElement; current; current = current.parentElement) {
        const { overflowY } = getComputedStyle(current);
        if (/(auto|scroll)/.test(overflowY) && current.scrollHeight > current.clientHeight) {
            return current;
        }
    }
    return null;
}
/**
 * Starts a drag. Call it from the handle's `pointerdown`. Listens on the window until the pointer
 * is released or the drag is cancelled.
 *
 * @returns a function that abandons the drag without calling `onEnd`, or null if it can't start.
 */
export function startReorderDrag({ items, index, minSlot = 0, maxSlot = items.length, event, onUpdate, onEnd, isActive = () => true }) {
    const dragged = items[index];
    if (!dragged)
        return null;
    event.preventDefault();
    const scrollContainer = nearestScrollContainer(dragged);
    const scrollOffset = () => (scrollContainer ? scrollContainer.scrollTop : window.scrollY);
    // Measure once, before anything moves: transforms during the drag would skew later readings.
    // Positions are in document coordinates (client + scroll) so autoscrolling doesn't shift them.
    const rects = items.map((item) => {
        const { top, bottom } = item.getBoundingClientRect();
        return { top: top + scrollOffset(), bottom: bottom + scrollOffset() };
    });
    const own = rects[index];
    // The item stays between the first and last slots it may take.
    const minOffset = rects[minSlot].top - own.top;
    const maxOffset = rects[maxSlot - 1].bottom - own.bottom;
    // Siblings slide by the item's height plus the gap between items. Measure that gap against the
    // previous item, or the next one if it may be passed. Never across a fixed item after the run:
    // anything between them (a section header) would add a phantom item's worth of space.
    const neighbourGap = rects[index - 1]
        ? own.top - rects[index - 1].bottom
        : index + 1 < maxSlot
            ? rects[index + 1].top - own.bottom
            : 0;
    const shiftY = own.bottom - own.top + neighbourGap;
    const startY = event.clientY + scrollOffset();
    /** Latest slot, kept here so release doesn't depend on the caller having rendered it. */
    let slot = index;
    let lastClientY = event.clientY;
    const follow = () => {
        const offsetY = Math.min(Math.max(lastClientY + scrollOffset() - startY, minOffset), maxOffset);
        slot = dropSlotFromOffset(rects, index, offsetY, maxSlot);
        onUpdate({ offsetY, slot, shiftY });
    };
    const teardown = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onCancel);
        window.removeEventListener('keydown', onKeyDown, true);
    };
    /**
     * The click that follows releasing the handle lands on the (moved) row, which would select it.
     * Swallow that one click.
     */
    const swallowNextClick = () => {
        const swallow = (clickEvent) => {
            clickEvent.stopPropagation();
            clickEvent.preventDefault();
        };
        window.addEventListener('click', swallow, true);
        setTimeout(() => window.removeEventListener('click', swallow, true), 0);
    };
    const finish = (commit) => {
        teardown();
        swallowNextClick();
        onEnd(commit ? { slot } : null);
    };
    function onMove(moveEvent) {
        if (!isActive())
            return teardown();
        lastClientY = moveEvent.clientY;
        if (scrollContainer) {
            const { top, bottom } = scrollContainer.getBoundingClientRect();
            if (lastClientY < top + AUTOSCROLL_EDGE_PX)
                scrollContainer.scrollBy(0, -AUTOSCROLL_STEP_PX);
            if (lastClientY > bottom - AUTOSCROLL_EDGE_PX)
                scrollContainer.scrollBy(0, AUTOSCROLL_STEP_PX);
        }
        follow();
    }
    function onUp() {
        if (!isActive())
            return teardown();
        finish(true);
    }
    function onCancel() {
        finish(false);
    }
    function onKeyDown(keyEvent) {
        if (keyEvent.key !== 'Escape')
            return;
        keyEvent.stopPropagation();
        finish(false);
    }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    window.addEventListener('keydown', onKeyDown, true);
    onUpdate({ offsetY: 0, slot, shiftY });
    return teardown;
}
