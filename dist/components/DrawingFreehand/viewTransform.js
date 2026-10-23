export const MIN_SCALE = 0.1;
export const MAX_SCALE = 10;
export const IDENTITY_VIEW = { x: 0, y: 0, k: 1 };
export const screenToWorld = ({ x, y, k }, [sx, sy]) => [
    (sx - x) / k,
    (sy - y) / k
];
export const worldToScreen = ({ x, y, k }, [wx, wy]) => [
    wx * k + x,
    wy * k + y
];
export const panBy = (view, dx, dy) => ({
    ...view,
    x: view.x + dx,
    y: view.y + dy
});
/** Scales by `factor` while keeping the world point under `screenPoint` where it is. */
export function zoomAbout(view, [sx, sy], factor) {
    const k = Math.min(MAX_SCALE, Math.max(MIN_SCALE, view.k * factor));
    const appliedFactor = k / view.k;
    return {
        k,
        x: sx - (sx - view.x) * appliedFactor,
        y: sy - (sy - view.y) * appliedFactor
    };
}
/** A view that centres `bounds` in the viewport with some padding. No content gives the identity view. */
export function fitView(bounds, { width, height }, padding = 32) {
    if (!bounds || width <= 0 || height <= 0)
        return IDENTITY_VIEW;
    const contentWidth = Math.max(1, bounds.maxX - bounds.minX);
    const contentHeight = Math.max(1, bounds.maxY - bounds.minY);
    const k = Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.min((width - padding * 2) / contentWidth, (height - padding * 2) / contentHeight)));
    return {
        k,
        x: (width - contentWidth * k) / 2 - bounds.minX * k,
        y: (height - contentHeight * k) / 2 - bounds.minY * k
    };
}
