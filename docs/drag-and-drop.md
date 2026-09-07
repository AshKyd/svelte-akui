# Drag and Drop

`svelte-akui` provides a pointer-based drag-and-drop system designed for desktop and touch devices. It supports card reordering, drag-to-target assignment, drag handles, and list/tree integrations.

The system is split into two layers:

1. **Components (`<Draggable>` and `<DropTarget>`)**: Pre-styled Svelte 5 components with built-in cursor follow, scale, and snap-back settle transitions.
2. **Primitives / Attachments (`dragSource()` and `dropTarget()`)**: Low-level element attachments using Svelte 5 `{@attach ...}` that manage gesture lifecycles, pointer capture, and hit testing without applying CSS styling.

---

## Getting Started

Drag and drop works out of the box with no providers, wrappers, or root components. `svelte-akui` uses a shared browser-wide `DropManager` coordinator so `<Draggable>` / `dragSource()` and `<DropTarget>` / `dropTarget()` elements automatically discover each other anywhere on the page.

### Basic Drag and Drop Example

Wrap your draggable element with `<Draggable>` and define a receiving zone with `<DropTarget>`.

```svelte
<script lang="ts">
	import { Draggable, DropTarget } from 'svelte-akui';

	let droppedItems = $state<string[]>([]);
	const item = { id: 'item-1', name: 'Almanac of Herbs' };

	function handleDrop(payload) {
		droppedItems = [...droppedItems, payload.data.name];
	}
</script>

<!-- Draggable source -->
<Draggable getPayload={() => ({ type: 'book', data: item })}>
	{#snippet children({ isDragging })}
		<div class="card" class:is-dragging={isDragging}>
			{item.name}
		</div>
	{/snippet}
</Draggable>

<!-- Drop target receiver -->
<DropTarget
	canDrop={(payload) => payload.type === 'book'}
	ondrop={handleDrop}
>
	{#snippet children({ isOver, canDrop })}
		<div class="dropzone" class:active={isOver && canDrop}>
			{#if droppedItems.length === 0}
				Drop books here
			{:else}
				<ul>
					{#each droppedItems as name}
						<li>{name}</li>
					{/each}
				</ul>
			{/if}
		</div>
	{/snippet}
</DropTarget>
```

---

## Component Guide

### `<Draggable>`

`<Draggable>` wraps any content to make it draggable across registered `<DropTarget>`s.

#### Key Features

- **Visual Feedback**: Applies transform translation (`translate3d`), scale (`dragScale`), and drop shadows while dragging.
- **Snap-back Transition**: If released over no target or an invalid target, the element smoothly transitions back to origin (`settling` state) before clearing the transform so parent layout flow resumes cleanly.
- **Touch and Mouse Gestures**:
  - **Mouse**: Requires movement exceeding `mouseThreshold` (default `4px`) before initiating a drag.
  - **Touch**: Uses a long-press delay (`longPressDelay`, default `350ms`) with touch slop detection so normal page scrolling is not interrupted.
- **Drag Handles**: Restrict the drag start area with `handleSelector` (e.g. `handleSelector=".drag-handle"`).
- **Cancellation**: Pressing `Escape` or pointer cancellation immediately aborts the drag and resets state.

#### Usage Example with Drag Handle and Scaling

```svelte
<script lang="ts">
	import { Draggable } from 'svelte-akui';

	let note = { id: 'note-42', title: 'Meeting summary' };
</script>

<Draggable
	handleSelector=".handle"
	dragScale={0.8}
	getPayload={() => ({ type: 'note', data: note })}
	ondragstart={() => console.log('Drag started')}
	ondrop={({ handledExternally }) => console.log('Dropped:', handledExternally)}
>
	{#snippet children({ isDragging, delta })}
		<div class="note-card">
			<span class="handle">⋮⋮</span>
			<h4>{note.title}</h4>
			{#if isDragging}
				<small>Moving by {delta.x}px, {delta.y}px</small>
			{/if}
		</div>
	{/snippet}
</Draggable>
```

---

### `<DropTarget>`

`<DropTarget>` defines a spatial target that accepts drops from active `<Draggable>` sources or `dragSource()` attachments.

#### Key Features

- **Payload Validation**: `canDrop(payload)` checks payload compatibility before triggering hover states.
- **Reactive State Snippet**: The `children` snippet receives `{ isOver, canDrop, isDragging, activePayload }` to conditionally style drop highlights.
- **Clean Event Handling**: `ondrop(payload, event)` is called when a valid payload is dropped onto the container.

#### Usage Example

```svelte
<script lang="ts">
	import { DropTarget } from 'svelte-akui';

	function onFolderDrop(payload) {
		console.log('Moved item:', payload.data);
	}
</script>

<DropTarget
	canDrop={(payload) => payload.type === 'note'}
	ondrop={onFolderDrop}
>
	{#snippet children({ isOver, canDrop, isDragging })}
		<div
			class="folder-target"
			class:highlight={isOver && canDrop}
			class:drag-active={isDragging}
		>
			{#if isOver && canDrop}
				Release to move note into folder
			{:else}
				Notes folder
			{/if}
		</div>
	{/snippet}
</DropTarget>
```

---

## Attachment Guide (`dragSource` & `dropTarget`)

When building unstyled components, virtualized lists, or integrating with elements that cannot use container wrappers (such as `Tree` rows or custom table cells), use the Svelte 5 attachment primitives: `dragSource()` and `dropTarget()`.

### How Attachments Work

Attachments connect to DOM elements using Svelte 5's `{@attach ...}` syntax:

```svelte
<div {@attach source.attach}>...</div>
```

Both `dragSource()` and `dropTarget()` automatically connect to the shared `DropManager`.

> [!TIP]
> To create an isolated drag session (such as in automated unit tests or an isolated modal sandbox), call `setDropManagerContext(new DropManager())` during component initialisation or call `resetDropManager()` between tests.

### Unstyled Drag Source Example

```svelte
<script lang="ts">
	import { dragSource } from 'svelte-akui';

	const source = dragSource({
		getPayload: () => ({ type: 'raw-item', data: { id: 1 } })
	});
</script>

<div
	{@attach source.attach}
	style:transform="translate3d({source.delta.x}px, {source.delta.y}px, 0)"
	style:opacity={source.isDragging ? 0.6 : 1}
>
	Drag Me Directly
</div>
```

### Composing Drag and Drop with `Tree`

The `Tree` component does not have built-in drag-and-drop assumptions. Instead, pass `itemAttributes` to attach `dragSource()` and `dropTarget()` per row:

```svelte
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { Tree, dragSource, dropTarget, getDropManager } from 'svelte-akui';

	let items = $state([
		{ id: 'folder-1', label: 'Archive', isFolder: true, children: [] },
		{ id: 'file-1', label: 'Report.pdf', icon: 'file' }
	]);

	const manager = getDropManager();
	const rows = new Map();

	function getRowAttrs(item) {
		let cached = rows.get(item.id);
		if (cached) return cached;

		const source = dragSource(
			{
				getPayload: () => ({ type: 'tree-node', data: item }),
				disabled: !!item.isFolder
			},
			manager
		);

		const target = dropTarget(
			{
				canDrop: (payload) => payload.type === 'tree-node' && !!item.isFolder,
				ondrop: (payload) => {
					console.log(`Dropped ${payload.data.label} into ${item.label}`);
				}
			},
			manager
		);

		const attrs = {
			[createAttachmentKey()]: source.attach,
			[createAttachmentKey()]: target.attach,
			get class() {
				return target.isOver && target.canDrop ? 'akui-tree-item-row-highlight' : undefined;
			}
		};

		rows.set(item.id, attrs);
		return attrs;
	}
</script>

<Tree {items} itemAttributes={getRowAttrs} />
```

---

## Reordering Patterns

### Masonry Grid Reordering

To create a sortable grid, combine `<Draggable>` with `<DropTarget>` for each item and bind to `<Masonry>` with `animate={true}`.

```svelte
<script lang="ts">
	import { Draggable, DropTarget, Masonry } from 'svelte-akui';

	let items = $state([
		{ id: '1', title: 'First' },
		{ id: '2', title: 'Second' },
		{ id: '3', title: 'Third' }
	]);

	function swapItems(draggedId: string, targetId: string) {
		const from = items.findIndex((i) => i.id === draggedId);
		const to = items.findIndex((i) => i.id === targetId);
		if (from < 0 || to < 0 || from === to) return;

		const next = [...items];
		const [moved] = next.splice(from, 1);
		next.splice(to, 0, moved);
		items = next;
	}
</script>

<Masonry items={items} animate={true} colWidth="minmax(200px, 1fr)">
	{#snippet itemSnippet(item)}
		<Draggable
			dragScale={0.6}
			getPayload={() => ({ type: 'grid-card', data: item })}
		>
			<DropTarget
				canDrop={(payload) => payload.type === 'grid-card' && payload.data.id !== item.id}
				ondrop={(payload) => swapItems(payload.data.id, item.id)}
			>
				{#snippet children({ isOver, canDrop })}
					<div class="card" class:over={isOver && canDrop}>
						{item.title}
					</div>
				{/snippet}
			</DropTarget>
		</Draggable>
	{/snippet}
</Masonry>
```

---

## API Reference

### Types & Interfaces

#### `DragPayload<T = unknown>`

Payload delivered from drag sources to drop targets.

| Property | Type | Description |
| --- | --- | --- |
| `type` | `string` | Payload classification string (e.g. `'note'`, `'card'`). |
| `data` | `T` | The underlying data object passed with the drag. |
| `source` | `string?` | Optional string identifying where the drag originated. |

#### `DragMoveDetail`

Detail object passed to `ondragmove`.

| Property | Type | Description |
| --- | --- | --- |
| `x` | `number` | Pointer client X position. |
| `y` | `number` | Pointer client Y position. |
| `dx` | `number` | Pointer X delta from initial grab point. |
| `dy` | `number` | Pointer Y delta from initial grab point. |

#### `DragCancelReason`

`'escape' | 'pointercancel' | 'detached'`

---

### `<Draggable>` Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `getPayload` | `(ctx: { element: HTMLElement }) => DragPayload` | **Required** | Factory function generating the payload for the drag. |
| `handleSelector` | `string` | `undefined` | CSS selector for a descendant element to act as the handle. |
| `disabled` | `boolean` | `false` | Blocks dragging when `true`. |
| `longPressDelay` | `number` | `350` | Touch press hold duration in ms before a drag starts. |
| `mouseThreshold` | `number` | `4` | Mouse travel in pixels required before a drag starts. |
| `dragScale` | `number` | `1` | Visual scale applied to the element while dragging. |
| `ondragstart` | `() => void` | `undefined` | Fired once when a drag begins. |
| `ondragmove` | `(detail: DragMoveDetail) => void` | `undefined` | Fired on pointer move during a drag. |
| `ondrop` | `(detail: { handledExternally: boolean; event: PointerEvent }) => void` | `undefined` | Fired when dropped. `handledExternally` is `true` if consumed by a target. |
| `oncancel` | `(reason: DragCancelReason) => void` | `undefined` | Fired when the drag is aborted. |
| `ondragend` | `() => void` | `undefined` | Fired after any drag completes or cancels. |
| `children` | `Snippet<[{ isDragging: boolean; delta: { x: number; y: number } }]>` | `undefined` | Reactive content snippet. |
| `class` | `string` | `''` | Additional CSS classes for the wrapper. |

---

### `<DropTarget>` Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `canDrop` | `(payload: DragPayload) => boolean` | `undefined` | Predicate checking if the active payload is valid for this target. |
| `ondrop` | `(payload: DragPayload, event?: PointerEvent \| DragEvent) => void` | `undefined` | Callback invoked when a payload is dropped. |
| `ondragenter` | `(payload: DragPayload) => void` | `undefined` | Callback invoked when an acceptable drag enters the target. |
| `ondragleave` | `() => void` | `undefined` | Callback invoked when a drag leaves the target. |
| `children` | `Snippet<[{ isOver: boolean; canDrop: boolean; isDragging: boolean; activePayload: DragPayload \| null }]>` | `undefined` | Reactive content snippet. |
| `class` | `string` | `''` | Additional CSS classes for the wrapper. |

---

### Attachment Functions

#### `dragSource<T>(options: DragSourceOptions<T>, manager?: DropManager): DragSourceInstance<T>`

Creates a reactive drag source instance.

**`DragSourceOptions<T>` Properties**:
- `getPayload: (ctx: { element: HTMLElement }) => DragPayload<T>` (**Required**)
- `handleSelector?: string`
- `disabled?: boolean`
- `longPressDelay?: number` (default: `350`)
- `mouseThreshold?: number` (default: `4`)
- `ondragstart?: () => void`
- `ondragmove?: (detail: DragMoveDetail) => void`
- `ondrop?: (detail: { handledExternally: boolean; event: PointerEvent }) => void`
- `oncancel?: (reason: DragCancelReason) => void`
- `ondragend?: () => void`

**`DragSourceInstance<T>` Members**:
- `attach: Attachment<HTMLElement>` — Element attachment for `{@attach source.attach}`.
- `isDragging: boolean` — Reactive boolean indicating active drag state.
- `delta: { x: number; y: number }` — Pointer offset relative to the grab position.
- `grabOffset: { x: number; y: number }` — Initial offset inside the element bounding box.
- `updateOptions(newOptions: DragSourceOptions<T>): void`

---

#### `dropTarget<T>(options?: DropTargetOptions<T>, manager?: DropManager): DropTargetInstance`

Creates a reactive drop target instance.

**`DropTargetOptions<T>` Properties**:
- `canDrop?: (payload: DragPayload) => boolean`
- `ondrop?: (payload: DragPayload, event?: PointerEvent | DragEvent) => void`
- `ondragenter?: (payload: DragPayload) => void`
- `ondragleave?: () => void`

**`DropTargetInstance` Members**:
- `attach: Attachment<HTMLElement>` — Element attachment for `{@attach target.attach}`.
- `isOver: boolean` — Reactive boolean indicating if a pointer is over this target.
- `canDrop: boolean` — Reactive boolean indicating if the active payload satisfies `canDrop`.
- `isDragging: boolean` — Reactive boolean indicating whether any drag is currently active globally.
- `activePayload: DragPayload | null` — Currently active payload.
- `updateOptions(newOptions: DropTargetOptions): void`

---

#### `getDropManager(): DropManager`

Returns the active `DropManager` coordinator from Svelte context if one was set, or the shared browser-wide coordinator by default.

#### `setDropManagerContext(manager: DropManager): void`

Sets a scoped `DropManager` in Svelte context for the current component and its children. Useful when creating isolated drag sandboxes or nested test environments.

#### `resetDropManager(): void`

Resets the browser-wide fallback `DropManager` instance, ensuring subsequent calls to `getDropManager()` instantiate a fresh coordinator (useful between unit tests).
