interface Reflow {
    /** The grid's items; they are named so the browser can tween each one. */
    items: HTMLElement[];
    /** Applies the grid's new positions. Runs inside the view transition. */
    write: () => void;
    duration: string;
    easing: string;
    resolve: () => void;
}
/** False without the View Transitions API, or with Reduced Motion on. */
export declare const canAnimateReflow: () => boolean;
/**
 * Animates a grid's items to new positions with a View Transition. Resolves when it has finished.
 *
 * Every grid that checks in before the next animation frame shares one transition, because the
 * browser runs only one at a time and a new one cancels the last. Without this, whichever of
 * Pinned and Others started first would snap instead of gliding.
 */
export declare const animateReflow: (reflow: Omit<Reflow, "resolve">) => Promise<void>;
export {};
