/**
 * @file
 * Barrel for the svelte-akui drag and drop layer.
 *
 * - `dragSource()` / `dropTarget()` — the primitive attachment layer. Use them
 *   directly (`{@attach source.attach}`) for unstyled drag and drop.
 * - `<Draggable>` / `<DropTarget>` (in `../../components/`) — styled wrappers over
 *   those primitives.
 * - `DropManager` + context — the shared coordinator, set up once by `<UIRoot>`.
 */

export * from './types.js';
export * from './manager.svelte.js';
export * from './dragSource.svelte.js';
export * from './dropTarget.svelte.js';
