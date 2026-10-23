/**
 * Works out which rows of a fixed-height list are worth rendering. Rows outside the viewport
 * (plus `overscan` either side, so fast scrolling doesn't flash blank) are replaced by padding.
 */
export function windowRows({ scrollTop, viewportHeight, rowHeight, rowCount, overscan = 6 }) {
    if (rowCount <= 0 || rowHeight <= 0)
        return { start: 0, end: 0 };
    const firstVisible = Math.floor(Math.max(0, scrollTop) / rowHeight);
    const lastVisible = Math.ceil((Math.max(0, scrollTop) + viewportHeight) / rowHeight);
    return {
        start: Math.min(rowCount, Math.max(0, firstVisible - overscan)),
        end: Math.min(rowCount, Math.max(0, lastVisible + overscan))
    };
}
