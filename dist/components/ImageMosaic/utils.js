/**
 * Groups a flat array of items into rows.
 * If rows is provided, it uses explicit row counts cycling through them.
 * If rows is not provided, it uses an aspect-ratio-based auto-balancing algorithm.
 * Inspired by the row-height justification math in abcnews/odyssey.
 */
export function groupItemsIntoRows(items, containerWidth, minWidth, gap, rows) {
    if (items.length === 0)
        return [];
    const width = containerWidth || 1000; // Fallback for SSR and tests
    if (rows && rows.length > 0) {
        let patternIndex = 0;
        return items.reduce((acc, item) => {
            if (acc.length === 0) {
                return [[item]];
            }
            const currentTargetSize = rows[patternIndex % rows.length];
            const lastRow = acc[acc.length - 1];
            if (lastRow.length < currentTargetSize) {
                lastRow.push(item);
            }
            else {
                patternIndex++;
                acc.push([item]);
            }
            return acc;
        }, []);
    }
    // Auto-balance logic based on aspect ratio
    const sortedItems = [...items].sort((a, b) => a.width / a.height - b.width / b.height);
    return sortedItems.reduce((acc, item) => {
        if (acc.length === 0)
            return [[item]];
        const currentRow = acc[acc.length - 1];
        currentRow.push(item);
        const totalAspect = currentRow.reduce((sum, i) => sum + i.width / i.height, 0);
        const availableWidth = width - gap * (currentRow.length - 1);
        const minItemWidth = currentRow.reduce((min, i) => {
            const itemWidth = availableWidth * (i.width / i.height / totalAspect);
            return Math.min(min, itemWidth);
        }, Infinity);
        if (minItemWidth < minWidth && currentRow.length > 1) {
            currentRow.pop();
            acc.push([item]);
        }
        return acc;
    }, []);
}
/**
 * Calculates CSS width percentages (taking gaps into account) and aspect ratios
 * for all items grouped by rows. Returns a flat list.
 */
export function calculateLayoutItems(rows, gap) {
    return rows.flatMap((row) => {
        const totalAspect = row.reduce((sum, item) => sum + item.width / item.height, 0);
        return row.map((item) => {
            const aspect = item.width / item.height;
            const fraction = aspect / totalAspect;
            const gapPx = fraction * gap * (row.length - 1);
            return {
                item,
                widthCalc: `calc(${fraction * 100}% - ${gapPx}px)`,
                aspectRatio: aspect
            };
        });
    });
}
