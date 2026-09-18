/**
 * @file
 * Small attachment for dismissing a selection, popover, or menu on an outside click.
 */

import type { Attachment } from 'svelte/attachments';
import { on } from 'svelte/events';

/**
 * Attachment that invokes `onOutside` when a pointer press lands outside the attached
 * element. Listens on `pointerdown` in the capture phase so it fires before the target's
 * own click handlers, including one that might re-select the same element.
 *
 * Uses `on()` from `svelte/events` rather than raw `addEventListener`: Svelte's own
 * declarative handlers (`onclick={...}`) are dispatched via event delegation, and `on()`
 * keeps this listener correctly ordered relative to those instead of racing them.
 *
 * @example
 * ```svelte
 * <div {@attach selected ? clickOutside(() => (selected = false)) : undefined}>
 * ```
 */
export function clickOutside(onOutside: () => void): Attachment<HTMLElement> {
	return (element) => {
		return on(
			document,
			'pointerdown',
			(event) => {
				if (event.target instanceof Node && element.contains(event.target)) return;
				onOutside();
			},
			{ capture: true }
		);
	};
}
