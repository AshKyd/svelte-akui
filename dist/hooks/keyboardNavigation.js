/**
 * Svelte action to enable J/K keyboard navigation, Enter triggers, and configurable key combos.
 *
 * @param node - The container element wrapping the list of selectable items.
 * @param options - Configurable keyboard shortcuts and selectors.
 */
export function keyboardNavigation(node, options = {}) {
    // Track the currently hovered item to allow hotkeys (like bookmark/read state) to target it
    let hoveredEl = null;
    const handleMouseOver = (e) => {
        const target = e.target;
        const selectable = target.closest(options.selector || '[data-selectable]');
        if (selectable && node.contains(selectable)) {
            hoveredEl = selectable;
        }
        else {
            hoveredEl = null;
        }
    };
    const handleMouseLeave = () => {
        hoveredEl = null;
    };
    node.addEventListener('mouseover', handleMouseOver);
    node.addEventListener('mouseleave', handleMouseLeave);
    const getSelectableItems = () => {
        const sel = options.selector || '[data-selectable]';
        return Array.from(node.querySelectorAll(sel));
    };
    const getCurrentlySelected = (items) => {
        const active = document.activeElement;
        if (!active)
            return null;
        // The active element could be the selectable element itself, or a nested interactive element (e.g. <a> link)
        const currentEl = active.closest(options.selector || '[data-selectable]');
        if (!currentEl || !node.contains(currentEl))
            return null;
        const index = items.indexOf(currentEl);
        return index !== -1 ? { element: currentEl, index } : null;
    };
    const focusItem = (item) => {
        // If the item itself has tabindex, focus it. Otherwise find a child link.
        if (item.getAttribute('tabindex') !== null) {
            item.focus();
        }
        else {
            const link = item.querySelector('a');
            if (link) {
                link.focus();
            }
            else {
                // Fallback: make it programmatically focusable and focus it
                item.setAttribute('tabindex', '-1');
                item.focus();
            }
        }
        if (options.onSelect) {
            const id = item.getAttribute('data-id') || '';
            options.onSelect(id, item);
        }
    };
    function handleKeyDown(e) {
        const target = e.target;
        // Skip shortcuts if typing in input fields
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
            return;
        }
        // Skip shortcuts if modifier keys are pressed to avoid interfering with browser/OS shortcuts
        if (e.metaKey || e.ctrlKey || e.altKey) {
            return;
        }
        const items = getSelectableItems();
        if (items.length === 0)
            return;
        const current = getCurrentlySelected(items);
        let currentIndex = current?.index ?? -1;
        // If no item is currently focused, but we have an activeId option, resolve its index in the selectable list
        if (currentIndex === -1 && options.activeId) {
            const index = items.findIndex((item) => item.getAttribute('data-id') === options.activeId);
            if (index !== -1) {
                currentIndex = index;
            }
        }
        // J key (Next item)
        if (e.key === 'j' || e.key === 'J') {
            e.preventDefault();
            if (currentIndex === -1) {
                focusItem(items[0]);
            }
            else if (currentIndex < items.length - 1) {
                focusItem(items[currentIndex + 1]);
            }
            return;
        }
        // K key (Previous item)
        if (e.key === 'k' || e.key === 'K') {
            e.preventDefault();
            if (currentIndex === -1) {
                focusItem(items[0]);
            }
            else if (currentIndex > 0) {
                focusItem(items[currentIndex - 1]);
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
        // Custom key mappings are applied to the element in order of preference:
        // 1. Currently hovered element (enables mouse-hover hotkeys)
        // 2. Focused element (keyboard focus)
        // 3. Fallback selected element (via activeId option)
        const activeEl = hoveredEl || (current ? current.element : (currentIndex !== -1 ? items[currentIndex] : null));
        if (activeEl && options.keyMap) {
            const id = activeEl.getAttribute('data-id') || '';
            const key = e.key;
            const lowerKey = key.toLowerCase();
            if (options.keyMap[key]) {
                e.preventDefault();
                options.keyMap[key](id, activeEl);
            }
            else if (options.keyMap[lowerKey]) {
                e.preventDefault();
                options.keyMap[lowerKey](id, activeEl);
            }
        }
    }
    window.addEventListener('keydown', handleKeyDown);
    return {
        update(newOptions) {
            options = newOptions;
        },
        destroy() {
            window.removeEventListener('keydown', handleKeyDown);
            node.removeEventListener('mouseover', handleMouseOver);
            node.removeEventListener('mouseleave', handleMouseLeave);
        }
    };
}
