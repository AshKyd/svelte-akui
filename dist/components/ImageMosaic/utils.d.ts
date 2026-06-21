interface ImageItem {
    width: number;
    height: number;
}
export interface LayoutItem<T> {
    item: T;
    widthCalc: string;
    aspectRatio: number;
}
/**
 * Groups a flat array of items into rows.
 * If rows is provided, it uses explicit row counts cycling through them.
 * If rows is not provided, it uses an aspect-ratio-based auto-balancing algorithm.
 * Inspired by the row-height justification math in abcnews/odyssey.
 */
export declare function groupItemsIntoRows<T extends ImageItem>(items: T[], containerWidth: number, minWidth: number, gap: number, rows?: number[]): T[][];
/**
 * Calculates CSS width percentages (taking gaps into account) and aspect ratios
 * for all items grouped by rows. Returns a flat list.
 */
export declare function calculateLayoutItems<T extends ImageItem>(rows: T[][], gap: number): LayoutItem<T>[];
export {};
