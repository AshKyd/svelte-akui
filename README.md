# Svelte Akui

A modular UI library built for **Svelte 5** designed for building web apps. This is a personal project, very unstable and likely to change without notice.

## Getting Started

Wrap your application in the `UIRoot` component to set up the design system's CSS variables and global styles.

```svelte
<script>
	import { UIRoot } from 'svelte-akui';
</script>

<UIRoot>
	<!-- Your application content here -->
</UIRoot>
```

## Component Index

### Layout & Foundation

- **`UIRoot`**: Required parent wrapper. Sets the base font, HSL color tokens, and manages theme state.
- **`Panel`**: A bordered container. Use `variant` (`regular`, `secondary`, `accent`) to change background colors. Use the `tag` prop (e.g. `tag="section"`) to specify a custom HTML element for better semantics.
- **`Padding`**: Adds consistent spacing. Use `size` (`small`, `medium`, `large`) and optional `x` or `y` flags to specify axes.
- **`Divider`**: A 1px horizontal or vertical line for visual separation.

### Input System

Components should be composed: wrap any input in a `Field` to add a label.

- **`Field`**: Adds a `label` and `hint` (helper text) to a child. Automatically links the label to the input ID.
- **`TextInput`**: One-line field. Supports standard types (`text`, `email`, `tel`, `url`, `search`, `number`, `date`, `color`). Supports `small`, `medium`, and `large` sizes.
- **`ClearableInput`**: A text field with a one-click "X" button to reset the value. Ideal for search and filter fields.
- **`TextArea`**: Multi-line field. Supports `small`, `medium`, and `large` sizes and vertical resizing.
- **`Select`**: Drop-down menu for picking from `options`.
- **`PasswordInput`**: A text field with a toggle button to show or hide the password characters.
- **`InputWithIcon`**: A layout utility that wraps an input and handles the positioning and spacing for left or right icons/actions.
- **`ColourInput`**: A field with a manual hex code input and a clickable color swatch trigger.
- **`InputGroup`**: Aligns multiple inputs or buttons in a row. Use `joined` to merge their borders into a single unit. Inherits `size` to all children.
- **`Fieldset`**: Groups related fields with a `legend`. Use `isInForm` for correct ARIA role behavior in form tags.

### Actions & Navigation

- **`Button`**: Primary interactive element. Supports `regular`, `accent`, and `ghost` variants, and `small`, `medium`, and `large` sizes. The `ghost` variant has a transparent background and no border until hover. Can include an `icon` with `iconPosition` (`left`, `right`, or `only`).
- **`Badge`**: Informative label or tag. Supports `regular` and `accent` variants, backdrop blur, and text glows. Can be used as a link by providing an `href`.
- **`Tabs`**: A tabbed interface for switching between content sections. Supports a "full-featured" mode with content snippets or a navigation-only mode.
- **`Menu`**: A floating list of actions. Includes `MenuButton` (trigger), `MenuItem` (standard item), and `MenuDivider`. Supports the `useMenu()` hook for closing from custom controls.
- **`Sidebar`**: Sticky left-hand navigation. Transitions between a fixed desktop view and an overlay mobile view. The `sidebar` snippet is automatically wrapped in a `ControlGroup` for consistent styling.
- **`Header`**: Top navigation and branding bar. Includes a hamburger menu toggle for the sidebar on mobile.

### Feedback & Overlays

- **`Loader`**: A spinning animation for background tasks.
- **`LoaderOverlay`**: Covers the parent container with a semi-transparent layer and a loader to block interaction.
- **`Modal`**: A centered dialog box for critical actions or information. Supports titles, action bars, custom icons via snippets, and optional fullscreen view on mobile.
- **`InfoBox`**: A non-intrusive notification or reminder. Supports `variant` (`info`, `warning`, `error`), custom icons or `iconSnippet`, a `title`, and an optional `action` snippet on the right side.
- **`Tooltip`**: A floating label that appears on hover or touch. Use the `createTooltip` construct to manage state and position. Supports glassmorphism, automatic positioning based on screen edges, and customizable `radius` (defaults to `'s'`).

  ```svelte
  <script>
  	import { createTooltip, Tooltip, Button, Padding } from 'svelte-akui';
  	const tooltip = createTooltip({ position: 'top' });
  </script>

  <Button {...tooltip.handlers}>Hover me</Button>
  <Tooltip
  	visible={tooltip.visible}
  	x={tooltip.x}
  	y={tooltip.y}
  	position={tooltip.position}
  	radius="m"
  >
  	<Padding size="s">Tooltip Content</Padding>
  </Tooltip>
  ```

### Misc

- **`Icon`**: Renders a vector icon by name. Supports custom `size` (px).
- **`Small`**: Semantic utility for secondary or small-print text.

### Accessibility Utilities

- **`.sr-only`**: CSS class for elements that should be hidden visually but remain accessible to screen readers. Use this for descriptive labels on icon-only buttons or additional context in lists.

  ```html
  <button aria-label="Close">
  	<Icon name="x" />
  	<span class="sr-only">Close dialog</span>
  </button>
  ```

## Implementation Guidelines

### 1. Composition

The input system avoids monolithic components. Use the `Field` component to wrap raw inputs (`TextInput`, `Select`, etc.) to add labels and technical metadata without bloating the individual input components.

### 2. Context-based Sizing

Components support `small`, `medium` (default), and `large` sizes. When components are placed inside an `InputGroup`, they inherit the group's size using Svelte context.

### 3. ARIA Grouping

Use `Fieldset` for groups of related inputs. Setting `isInForm` correctly assigns accessibility roles for better screen reader support.

### 4. Theme & Dark Mode

`svelte-akui` supports automatic dark mode switching based on browser preference. By default, `UIRoot` will detect the system preference if no `mode` is provided.

For the best experience in a new project:

- **Global `color-scheme`**: Set `color-scheme: light dark` in your global CSS to ensure native elements like scrollbars match the theme on page load before akui takes over.

### 5. Advanced Menu Usage

Any custom component nested inside a `Menu` can trigger it to close using the `useMenu` hook. This is useful for interactive content or custom actions that aren't using the standard `MenuItem`.

```svelte
<script>
	import { useMenu } from 'svelte-akui';
	const menu = useMenu();
</script>

<button onclick={() => menu?.close()}> Clicking this will close the menu </button>
```

Forms and other interactive elements inside a `Menu` will not close the menu by default because click events are stopped at the menu container level. Only explicit calls to `menu.close()` or clicking a `MenuItem` will trigger a closure.

### 6. Sidebar Composition & ARIA

The `Sidebar` component's `sidebar` snippet is rendered inside a `ControlGroup` (`<ul>`) with `role="navigation"`. This ensures consistent spacing and dividers between items.

To maintain valid HTML, children within the `sidebar` snippet should be `ControlItem`, `ControlDivider`, or `ControlContent` (which wrap their content in `<li>`).

```svelte
<Sidebar>
	{#snippet sidebar()}
		<!-- Standard nav items -->
		<ControlItem label="Dashboard" icon="house" href="/" />
		<ControlDivider />

		<!-- Non-nav content still benefits from the layout -->
		<ControlContent>
			<div class="user-profile">
				<img src="..." alt="" />
				<span>User Name</span>
			</div>
		</ControlContent>
	{/snippet}
</Sidebar>
```

**ARIA Notes**:

- The hamburger button in the `Header` component automatically links to the sidebar via `aria-controls="akui-sidebar-navigation"`.
- If you have multiple distinct navigation groups in the sidebar, you can use `ControlGroup` manually _within_ a `ControlContent` if needed, but be mindful of nesting `<ul>` tags inappropriately.
