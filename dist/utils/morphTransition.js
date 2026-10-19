import { reducedMotion } from '../hooks/reducedMotion.svelte.js';
const setName = (element, name) => element instanceof HTMLElement && (element.style.viewTransitionName = name);
const clearName = (element) => element instanceof HTMLElement && (element.style.viewTransitionName = '');
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
export async function morphTransition({ name, fromElement, toElement, update }) {
    if (!fromElement || reducedMotion.value || !document.startViewTransition) {
        await update();
        return;
    }
    setName(fromElement, name);
    const transition = document.startViewTransition(async () => {
        await update();
        // Skip the shared name when the element is still the same one (e.g. the pane that closes keeps it).
        const target = toElement();
        if (target !== fromElement)
            clearName(fromElement);
        setName(target, name);
    });
    // Names are only needed while snapshots are taken; leaving them would clash on the next transition.
    await transition.finished.catch(() => { }).finally(() => {
        clearName(fromElement);
        clearName(toElement());
    });
}
