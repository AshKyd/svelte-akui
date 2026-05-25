/**
 * Options for the keyboard navigation action.
 */
export interface KeyboardNavOptions {
	/** Custom key mappings. Maps a key name (e.g., 'b') to a callback function receiving the active item ID and its element. */
	keyMap?: Record<string, (id: string, element: HTMLElement) => void>;
	/** Custom selector to identify selectable elements. Defaults to '[data-selectable]'. */
	selector?: string;
}

/**
 * Svelte action to enable J/K keyboard navigation, Enter triggers, and configurable key combos.
 *
 * @param node - The container element wrapping the list of selectable items.
 * @param options - Configurable keyboard shortcuts and selectors.
 */
export function keyboardNavigation(node: HTMLElement, options: KeyboardNavOptions = {}) {
	const getSelectableItems = (): HTMLElement[] => {
		const sel = options.selector || '[data-selectable]';
		return Array.from(node.querySelectorAll(sel));
	};

	const getCurrentlySelected = (items: HTMLElement[]): { element: HTMLElement; index: number } | null => {
		const active = document.activeElement;
		if (!active) return null;

		// The active element could be the selectable element itself, or a nested interactive element (e.g. <a> link)
		const currentEl = active.closest(options.selector || '[data-selectable]') as HTMLElement;
		if (!currentEl || !node.contains(currentEl)) return null;

		const index = items.indexOf(currentEl);
		return index !== -1 ? { element: currentEl, index } : null;
	};

	const focusItem = (item: HTMLElement) => {
		// If the item itself has tabindex, focus it. Otherwise find a child link.
		if (item.getAttribute('tabindex') !== null) {
			item.focus();
		} else {
			const link = item.querySelector('a');
			if (link) {
				link.focus();
			} else {
				// Fallback: make it programmatically focusable and focus it
				item.setAttribute('tabindex', '-1');
				item.focus();
			}
		}
	};

	function handleKeyDown(e: KeyboardEvent) {
		const target = e.target as HTMLElement;

		// Skip shortcuts if typing in input fields
		if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
			return;
		}

		const items = getSelectableItems();
		if (items.length === 0) return;

		const current = getCurrentlySelected(items);

		// J key (Next item)
		if (e.key === 'j' || e.key === 'J') {
			e.preventDefault();
			if (!current) {
				focusItem(items[0]);
			} else if (current.index < items.length - 1) {
				focusItem(items[current.index + 1]);
			}
			return;
		}

		// K key (Previous item)
		if (e.key === 'k' || e.key === 'K') {
			e.preventDefault();
			if (!current) {
				focusItem(items[0]);
			} else if (current.index > 0) {
				focusItem(items[current.index - 1]);
			}
			return;
		}

		// Enter key (Activate item)
		if (e.key === 'Enter') {
			if (current) {
				// If focus is directly on the selectable container element, trigger click.
				// If it's on a child interactive element (like a button/link), let the browser handle it.
				if (target === current.element) {
					e.preventDefault();
					current.element.click();
				}
			}
			return;
		}

		// Custom key mappings
		if (current && options.keyMap) {
			const id = current.element.getAttribute('data-id') || '';
			const key = e.key;
			const lowerKey = key.toLowerCase();

			if (options.keyMap[key]) {
				e.preventDefault();
				options.keyMap[key](id, current.element);
			} else if (options.keyMap[lowerKey]) {
				e.preventDefault();
				options.keyMap[lowerKey](id, current.element);
			}
		}
	}

	node.addEventListener('keydown', handleKeyDown);

	return {
		update(newOptions: KeyboardNavOptions) {
			options = newOptions;
		},
		destroy() {
			node.removeEventListener('keydown', handleKeyDown);
		}
	};
}
