/**
 * @file
 * Barrel for the svelte-akui drag and drop layer.
 *
 * - `dragSource()` / `dropTarget()` — the primitive attachment layer. Use them
 *   directly (`{@attach source.attach}`) for unstyled drag and drop.
 * - `<Draggable>` / `<DropTarget>` (in `../../components/`) — styled wrappers over
 *   those primitives.
 * - `DropManager` — the shared coordinator. Works with no setup (a browser-wide
 *   fallback backs `getDropManager()`); `<UIRoot>` or `setDropManagerContext`
 *   only need to provide one when you want an isolated drag scope.
 */
export * from './types.js';
export * from './manager.svelte.js';
export * from './dragSource.svelte.js';
export * from './dropTarget.svelte.js';
