export interface RowWindow {
    /** Index of the first row to render. */
    start: number;
    /** Index after the last row to render. */
    end: number;
}
/**
 * Works out which rows of a fixed-height list are worth rendering. Rows outside the viewport
 * (plus `overscan` either side, so fast scrolling doesn't flash blank) are replaced by padding.
 */
export declare function windowRows({ scrollTop, viewportHeight, rowHeight, rowCount, overscan }: {
    scrollTop: number;
    viewportHeight: number;
    rowHeight: number;
    rowCount: number;
    overscan?: number;
}): RowWindow;
