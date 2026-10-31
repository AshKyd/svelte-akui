import { reducedMotion } from '../hooks/reducedMotion.svelte.js';
let batch = [];
/** True while `morphBetweenGrids` waits for its update; reflows must write directly then. */
let isHoldingReflow = false;
/** False without the View Transitions API, with Reduced Motion on, or during a grid-to-grid morph. */
export const canAnimateReflow = () => typeof document.startViewTransition === 'function' && !reducedMotion.value && !isHoldingReflow;
/** True while any view transition (ours, or e.g. `morphTransition`) is animating. */
const isViewTransitionRunning = () => document
    .getAnimations()
    .some((animation) => animation.effect?.pseudoElement?.startsWith('::view-transition'));
const play = async (reflows) => {
    const writeAll = () => reflows.forEach((reflow) => reflow.write());
    const hasMovingItems = reflows.some((reflow) => reflow.items.length > 0);
    // Nothing is moving (e.g. only the grid height changed), so there is nothing to tween.
    // Starting ours would also cancel a running card morph, so just place the cards.
    if (!hasMovingItems || isViewTransitionRunning()) {
        writeAll();
        return reflows.forEach((reflow) => reflow.resolve());
    }
    const root = document.documentElement;
    const items = reflows.flatMap((reflow) => reflow.items);
    // Names only last for the transition: a permanent name gives every card its own compositor layer.
    // Any name unique within the batch works, since old and new snapshots are of the same element.
    items.forEach((item, index) => (item.style.viewTransitionName = `akui-masonry-${index}`));
    root.dataset.akuiMasonryVt = '';
    root.style.setProperty('--akui-masonry-vt-duration', reflows[0].duration);
    root.style.setProperty('--akui-masonry-vt-easing', reflows[0].easing);
    const transition = document.startViewTransition(writeAll);
    transition.ready.catch(() => { });
    await transition.finished.catch(() => { });
    items.forEach((item) => (item.style.viewTransitionName = ''));
    delete root.dataset.akuiMasonryVt;
    root.style.removeProperty('--akui-masonry-vt-duration');
    root.style.removeProperty('--akui-masonry-vt-easing');
    reflows.forEach((reflow) => reflow.resolve());
};
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
export const morphBetweenGrids = async ({ update, duration = '0.35s', easing = 'cubic-bezier(0.2, 0, 0, 1)' }) => {
    if (!canAnimateReflow() || isViewTransitionRunning())
        return update();
    const root = document.documentElement;
    isHoldingReflow = true;
    root.dataset.akuiMasonryVt = '';
    root.style.setProperty('--akui-masonry-vt-duration', duration);
    root.style.setProperty('--akui-masonry-vt-easing', easing);
    const transition = document.startViewTransition(() => update().catch(() => { }));
    transition.ready.catch(() => { });
    await transition.updateCallbackDone.catch(() => { });
    isHoldingReflow = false;
    await transition.finished.catch(() => { });
    delete root.dataset.akuiMasonryVt;
    root.style.removeProperty('--akui-masonry-vt-duration');
    root.style.removeProperty('--akui-masonry-vt-easing');
};
/**
 * Animates a grid's items to new positions with a View Transition. Resolves when it has finished.
 *
 * Every grid that checks in before the next animation frame shares one transition, because the
 * browser runs only one at a time and a new one cancels the last. Without this, whichever of
 * Pinned and Others started first would snap instead of gliding.
 */
export const animateReflow = (reflow) => new Promise((resolve) => {
    batch.push({ ...reflow, resolve });
    if (batch.length > 1)
        return;
    requestAnimationFrame(() => {
        const reflows = batch;
        batch = [];
        play(reflows);
    });
});
