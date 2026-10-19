import { reducedMotion } from '../hooks/reducedMotion.svelte.js';
let batch = [];
/** False without the View Transitions API, or with Reduced Motion on. */
export const canAnimateReflow = () => typeof document.startViewTransition === 'function' && !reducedMotion.value;
/** True while any view transition (ours, or e.g. `morphTransition`) is animating. */
const isViewTransitionRunning = () => document
    .getAnimations()
    .some((animation) => animation.effect?.pseudoElement?.startsWith('::view-transition'));
const play = async (reflows) => {
    const writeAll = () => reflows.forEach((reflow) => reflow.write());
    // Starting ours would cancel a running card morph, so just place the cards.
    if (isViewTransitionRunning()) {
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
