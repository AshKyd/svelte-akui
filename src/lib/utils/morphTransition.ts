import { reducedMotion } from '../hooks/reducedMotion.svelte.js';

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
	/**
	 * 'open' hands over from the small element to the big one early; 'close' hands over late, so the
	 * big element shrinks before the small one appears. Defaults to 'open'.
	 */
	direction?: 'open' | 'close';
	/** Resolves once the page has changed, e.g. SvelteKit's `navigation.complete`. The new snapshot is taken after it. */
	update: () => Promise<unknown>;
}

const setName = (element: Element | null, name: string) =>
	element instanceof HTMLElement && (element.style.viewTransitionName = name);

const clearName = (element: Element | null) =>
	element instanceof HTMLElement && (element.style.viewTransitionName = '');

/**
 * Morphs `fromElement` into `toElement` with a View Transition around a page change.
 *
 * Built for SvelteKit's `onNavigate`, so return the result from that callback. The returned promise
 * resolves as soon as the old snapshot is being taken, which is what lets SvelteKit go on to change
 * the page. `update` is only awaited after that, inside the transition. Awaiting the navigation
 * before returning would deadlock: the navigation waits for this promise, and this would wait for it.
 *
 * A `view-transition-name` must be unique on the page when a snapshot is taken, and the card and the
 * full-screen pane both exist at once. So the name is on `fromElement` for the old snapshot, then
 * moved to `toElement` once `update` has resolved.
 *
 * With Reduced Motion on, the page does a brief crossfade instead of the morph. Without the View
 * Transitions API, or with no `fromElement`, it resolves straight away and the page just changes.
 */
export function morphTransition({
	name,
	fromElement,
	toElement,
	direction = 'open',
	update
}: MorphTransitionOptions): Promise<void> {
	if (!fromElement || !document.startViewTransition) return Promise.resolve();

	// Reduced Motion keeps a short crossfade of the whole page but drops the movement: no shared name,
	// so the card doesn't travel or scale. `akui-morph-reduced` shortens the crossfade (see theme.css).
	const isReduced = reducedMotion.value;
	const root = document.documentElement;

	return new Promise((resolve) => {
		if (isReduced) root.classList.add('akui-morph-reduced');
		else {
			setName(fromElement, name);
			root.classList.toggle('akui-morph-close', direction === 'close');
		}

		const transition = document.startViewTransition(async () => {
			resolve();
			await update();
			if (isReduced) return;
			const target = toElement();
			// The pane that closes can be the same element on both sides; only a different one needs moving.
			if (target !== fromElement) clearName(fromElement);
			setName(target, name);
		});

		// Names are only needed while snapshots are taken; leaving them would clash on the next transition.
		// `ready` and `updateCallbackDone` are handled too so a skipped transition isn't an unhandled rejection.
		transition.ready.catch(() => {});
		transition.updateCallbackDone.catch(() => {});
		transition.finished
			.catch(() => {})
			.finally(() => {
				root.classList.remove('akui-morph-reduced', 'akui-morph-close');
				clearName(fromElement);
				clearName(toElement());
				resolve();
			});
	});
}
