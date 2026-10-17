export function createSlashMenuState(onselect) {
    // `$state` must initialise a variable, so it can't be returned directly.
    const state = $state({ items: [], selectedIndex: 0, onselect });
    return state;
}
/** DOM id of an item, referenced by the editor's `aria-activedescendant`. */
export function slashOptionId(menuId, itemId) {
    return `${menuId}-${itemId}`;
}
