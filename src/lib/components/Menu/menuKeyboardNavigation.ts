/**
 * @file
 * Keyboard navigation for `role="menu"` surfaces, following the WAI-ARIA menu pattern.
 */

import type { Attachment } from 'svelte/attachments';

/** Matches `menuitem`, `menuitemcheckbox` and `menuitemradio`. */
const ENABLED_ITEM = '[role^="menuitem"]:not(:disabled):not([aria-disabled="true"])';

/**
 * Arrow Up/Down move focus between menu items (wrapping), Home/End jump to the first/last, and typing
 * a character jumps to the next item whose text starts with it. Escape and Tab are left to the host
 * (`Menu` closes on the dialog's cancel event).
 */
export const menuKeyboardNavigation: Attachment<HTMLElement> = (surface) => {
	let typed = '';
	let typedTimer: ReturnType<typeof setTimeout> | undefined;

	function handleKeydown(event: KeyboardEvent) {
		if (event.ctrlKey || event.metaKey || event.altKey) return;
		const items = [...surface.querySelectorAll<HTMLElement>(ENABLED_ITEM)];
		if (!items.length) return;

		const current = items.indexOf(document.activeElement as HTMLElement);
		const lastIndex = items.length - 1;

		const isPrintable = event.key.length === 1 && event.key !== ' ';
		const targetIndex = isPrintable
			? findTypeaheadIndex(items, current, event.key)
			: {
					ArrowDown: current >= lastIndex ? 0 : current + 1,
					ArrowUp: current <= 0 ? lastIndex : current - 1,
					Home: 0,
					End: lastIndex
				}[event.key];

		if (targetIndex === undefined || targetIndex < 0) return;
		event.preventDefault();
		items[targetIndex].focus();
	}

	/** Matches the typed prefix, so quickly typing "se" finds "Settings" rather than "Sign out". */
	function findTypeaheadIndex(items: HTMLElement[], current: number, key: string): number {
		clearTimeout(typedTimer);
		typed += key.toLowerCase();
		typedTimer = setTimeout(() => (typed = ''), 600);

		const startsWithTyped = (item: HTMLElement) =>
			item.textContent?.trim().toLowerCase().startsWith(typed) ?? false;
		// Search from the item after the current one so repeated presses cycle through matches.
		const ordered = [...items.slice(current + 1), ...items.slice(0, current + 1)];
		const match = ordered.find(startsWithTyped);
		return match ? items.indexOf(match) : -1;
	}

	surface.addEventListener('keydown', handleKeydown);
	return () => {
		clearTimeout(typedTimer);
		surface.removeEventListener('keydown', handleKeydown);
	};
};
