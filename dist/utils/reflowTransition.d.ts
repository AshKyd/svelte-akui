interface Reflow {
    /** The grid's items; they are named so the browser can tween each one. */
    items: HTMLElement[];
    /** Applies the grid's new positions. Runs inside the view transition. */
    write: () => void;
    duration: string;
    easing: string;
    resolve: () => void;
}
/** False without the View Transitions API, with Reduced Motion on, or during a grid-to-grid morph. */
export declare const canAnimateReflow: () => boolean;
/**
 * Runs `update` inside a view transition so an item that leaves one grid and joins another glides
 * between them. The caller gives the moving item (in both grids) the same `view-transition-name`
 * while `update` runs; the browser pairs the old and new elements by name.
 *
 * `update` must leave both grids fully packed: reflows are written directly (not animated) until it
 * resolves, because a reflow's own transition would cancel this one and its animation frame never
 * fires while the page is frozen for the snapshot. Falls back to plain `update()` when animation
 * isn't possible.
 */
export declare const morphBetweenGrids: ({ update, duration, easing }: {
    update: () => Promise<void>;
    duration?: string;
    easing?: string;
}) => Promise<void>;
/**
 * Animates a grid's items to new positions with a View Transition. Resolves when it has finished.
 *
 * Every grid that checks in before the next animation frame shares one transition, because the
 * browser runs only one at a time and a new one cancels the last. Without this, whichever of
 * Pinned and Others started first would snap instead of gliding.
 */
export declare const animateReflow: (reflow: Omit<Reflow, "resolve">) => Promise<void>;
export {};
