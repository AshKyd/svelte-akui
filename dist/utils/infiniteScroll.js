import { tick } from 'svelte';
/**
 * Calls `onloadmore` whenever `sentinel` comes within `rootMargin` of the viewport (or of `root`),
 * and keeps chaining pages until it moves out of range. Returns a cleanup function for use in an
 * `$effect`.
 *
 * @param root Scroll container the sentinel lives in. Omit to watch the page viewport.
 * @param settle Awaited after each page, before the sentinel re-arms. Masonry needs extra frames
 * for its fire-and-forget layout to finish.
 */
export function observeInfiniteScroll({ sentinel, onloadmore, root = null, rootMargin = '1000px', settle = async () => { } }) {
    // Not reactive: this guard must not retrigger the caller's effect when it flips.
    let isLoadingMore = false;
    const observer = new IntersectionObserver(async (entries) => {
        if (!entries[0].isIntersecting || isLoadingMore)
            return;
        isLoadingMore = true;
        try {
            await onloadmore();
            await tick();
            await settle();
            // IntersectionObserver only reports transitions. When the sentinel is still inside
            // the root margin — a tall viewport, or a page shorter than the margin — it would
            // never fire again, so re-observing forces a fresh initial callback and the pages
            // keep chaining.
            observer.unobserve(sentinel);
            observer.observe(sentinel);
        }
        finally {
            isLoadingMore = false;
        }
    }, { root, rootMargin });
    observer.observe(sentinel);
    return () => observer.disconnect();
}
