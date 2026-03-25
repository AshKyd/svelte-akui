# Akui Menu System

The Akui Menu system is a responsive, highly accessible menu solution built on the native HTML `<dialog>` element. It automatically handles the transition between a floating desktop menu and a mobile bottom-sheet.

## 1. Principles

- **Semantic HTML**: All menu items are contained within a `<ul>` list, ensuring screen readers correctly interpret the menu hierarchy.
- **Top Layer Rendering**: Uses `<dialog>.showModal()` to ensure the menu always appears above other content (z-index: 1000+) without manual stacking management.
- **Responsive-First**: The component detects screen size and automatically switches between a collision-aware desktop popup and a native-feeling mobile sheet.
- **Unified Styling**: Visual separators and interactive states are consistent across all platforms, providing a professional "grid" feel.

## 2. Implementation Patterns

### A. The `MenuButton` (Recommended)

`MenuButton` is a high-level trigger that handles all coordination between a button and its associated menu.

```svelte
<script>
	import { MenuButton, MenuItem, MenuDivider } from '$lib/components/Menu';
</script>

{#snippet options()}
	<MenuItem icon="person" label="Profile" onclick={() => console.log('Profile')} />
	<MenuItem icon="gear" label="Settings" />
	<MenuDivider />
	<MenuItem icon="box-arrow-right" label="Logout" />
{/snippet}

<!-- origin determines where the menu anchors to the button -->
<MenuButton label="Account" menu={options} origin="bottom-right" />
```

### B. Manual `Menu` Usage

Use the raw `Menu` component for custom triggers, such as context menus or spawning at specific coordinates.

```svelte
<script>
	import { Menu, MenuItem } from '$lib/components/Menu';
	let pos = $state({ x: 0, y: 0 });
	let visible = $state(false);

	function onContextMenu(e) {
		e.preventDefault();
		pos = { x: e.clientX, y: e.clientY };
		visible = true;
	}
</script>

<div oncontextmenu={onContextMenu}>
	Right-click me!

	{#if visible}
		<Menu x={pos.x} y={pos.y} onClose={() => (visible = false)}>
			<MenuItem label="Copy" />
			<MenuItem label="Paste" />
		</Menu>
	{/if}
</div>
```

## 3. Component Reference

### `MenuItem`

The standard action item. Wraps a button in an `<li>` with appropriate ARIA roles.

- `icon`: Optional Bootstrap icon name (e.g., "gear").
- `label`: Standard text display.
- `onclick`: Interaction handler.
- `children`: Snippet for custom internal markup (overrides label).

### `MenuContent`

A wrapper for freeform content (sliders, text blocks, form fields). Ensures the content is valid within the menu's `<ul>`.

- `size`: Padding size ('none' | 's' | 'm' | 'l').

```svelte
<MenuContent size="m">
	<div style="display: flex; flex-direction: column; gap: 4px;">
		<span style="font-size: 10px; opacity: 0.6;">VOLUME</span>
		<input type="range" />
	</div>
</MenuContent>
```

## 4. Best Practices

1. **Keep it Semantic**: Always use `MenuItem`, `MenuDivider`, or `MenuContent` as direct children of a `Menu`. This ensures the accessibility tree remains valid.
2. **Handle Closing**: Always provide an `onClose` handler (or use `MenuButton` which handles it for you) to ensure the state remains in sync when clicking outside or pressing Escape.
3. **Collision Detection**: The raw `Menu` component is collision-aware. It will reposition itself to stay within the viewport if spawned too close to an edge.
4. **Mobile Sheets**: On mobile, menus automatically transform into bottom sheets. For this reason, try to avoid excessively long menus that might exceed 90% of the screen height.
