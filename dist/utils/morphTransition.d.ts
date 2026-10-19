interface MorphTransitionOptions {
    /** The `view-transition-name` shared by the element morphed from and the one morphed to. */
    name: string;
    /** The element the morph starts from, e.g. the clicked card. Without it there is nothing to morph. */
    fromElement: Element | null;
    /**
     * The element the morph ends on. A function so it is looked up after `update` has changed the DOM,
     * e.g. the card to return to when closing. When it finds nothing the browser plain-crossfades.
     */
    toElement: () => Element | null;
    /** Changes the page, e.g. waits for the navigation to finish. The new snapshot is taken after it resolves. */
    update: () => Promise<unknown>;
}
/**
 * Runs `update` inside a view transition that morphs `fromElement` into `toElement`.
 *
 * A `view-transition-name` must be unique on the page when a snapshot is taken, and the card and the
 * full-screen pane both exist at once. So the name is on `fromElement` for the old snapshot, then
 * moved to `toElement` once `update` has run.
 *
 * Without the View Transitions API, with Reduced Motion on, or with no `fromElement`, it only runs
 * `update`.
 */
export declare function morphTransition({ name, fromElement, toElement, update }: MorphTransitionOptions): Promise<void>;
export {};
