/**
 * Options for the keyboard navigation action.
 */
export interface KeyboardNavOptions {
    /** Custom key mappings. Maps a key name (e.g., 'b') to a callback function receiving the active item ID and its element. */
    keyMap?: Record<string, (id: string, element: HTMLElement) => void>;
    /** Custom selector to identify selectable elements. Defaults to '[data-selectable]'. */
    selector?: string;
    /** Callback when the selected item changes via J/K keyboard navigation. */
    onSelect?: (id: string, element: HTMLElement) => void;
    /** The ID of the currently active/selected item. Allows J/K navigation to continue from here if focus was moved away. */
    activeId?: string;
}
/**
 * Svelte action to enable J/K keyboard navigation, Enter triggers, and configurable key combos.
 *
 * @param node - The container element wrapping the list of selectable items.
 * @param options - Configurable keyboard shortcuts and selectors.
 */
export declare function keyboardNavigation(node: HTMLElement, options?: KeyboardNavOptions): {
    update(newOptions: KeyboardNavOptions): void;
    destroy(): void;
};
