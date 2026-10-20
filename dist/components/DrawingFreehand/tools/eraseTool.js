/**
 * The eraser is a stroke that is never committed. Each new segment of its trail is tested
 * against the elements; those hit are marked pending and only removed when the pointer lifts,
 * so one drag is one undo step.
 */
export function createEraseTool(context) {
    let trail = [];
    let pendingIds = new Set();
    const clear = () => {
        trail = [];
        pendingIds = new Set();
        context.setPendingErase(pendingIds);
        context.requestRedraw();
    };
    /** Tests the segment from the last trail point and marks anything newly hit. */
    const hitSegmentTo = (world) => {
        const from = trail[trail.length - 1] ?? world;
        const hits = context.store.findHits({ from, to: world }, context.eraserRadiusPx / context.getScale());
        const newHits = hits.filter((id) => !pendingIds.has(id));
        if (newHits.length === 0)
            return;
        pendingIds = new Set([...pendingIds, ...newHits]);
        context.setPendingErase(pendingIds);
    };
    return {
        id: 'erase',
        start({ world }) {
            trail = [];
            hitSegmentTo(world);
            trail = [world];
            context.requestRedraw();
        },
        move({ world }) {
            if (trail.length === 0)
                return;
            hitSegmentTo(world);
            trail.push(world);
            context.requestRedraw();
        },
        end() {
            const removed = context.store.remove(pendingIds);
            clear();
            if (removed > 0)
                context.notifyChange();
        },
        cancel: clear,
        draw(canvas) {
            if (trail.length === 0)
                return;
            canvas.globalAlpha = 0.25;
            canvas.lineCap = 'round';
            canvas.lineJoin = 'round';
            canvas.lineWidth = (context.eraserRadiusPx * 2) / context.getScale();
            canvas.strokeStyle = canvas.fillStyle;
            canvas.beginPath();
            trail.forEach(([x, y], index) => (index === 0 ? canvas.moveTo(x, y) : canvas.lineTo(x, y)));
            // A lone tap still shows its circle.
            if (trail.length === 1)
                canvas.lineTo(trail[0][0], trail[0][1]);
            canvas.stroke();
        }
    };
}
