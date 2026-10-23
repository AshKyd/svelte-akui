/**
 * Calls `onloadmore` whenever `sentinel` comes within `rootMargin` of the viewport (or of `root`),
 * and keeps chaining pages until it moves out of range. Returns a cleanup function for use in an
 * `$effect`.
 *
 * @param root Scroll container the sentinel lives in. Omit to watch the page viewport.
 * @param settle Awaited after each page, before the sentinel re-arms. Masonry needs extra frames
 * for its fire-and-forget layout to finish.
 */
export declare function observeInfiniteScroll({ sentinel, onloadmore, root, rootMargin, settle }: {
    sentinel: HTMLElement;
    onloadmore: () => Promise<void>;
    root?: HTMLElement | null;
    rootMargin?: string;
    settle?: () => Promise<void>;
}): () => void;
