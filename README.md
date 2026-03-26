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
- **`Panel`**: A bordered container. Use `variant` (`regular`, `secondary`, `accent`) to change background colors.
- **`Padding`**: Adds consistent spacing. Use `size` (`small`, `medium`, `large`) and optional `x` or `y` flags to specify axes.
- **`Divider`**: A 1px horizontal or vertical line for visual separation.

### Input System

Components should be composed: wrap any input in a `Field` to add a label.

- **`Field`**: Adds a `label` and `hint` (helper text) to a child. Automatically links the label to the input ID.
- **`TextInput`**: One-line field. Supports standard types (`text`, `email`, `tel`, `url`, `search`, `number`, `date`, `color`). Supports `small`, `medium`, and `large` sizes.
- **`TextArea`**: Multi-line field. Supports `small`, `medium`, and `large` sizes and vertical resizing.
- **`Select`**: Drop-down menu for picking from `options`.
- **`PasswordInput`**: A text field with a toggle button to show or hide the password characters.
- **`ColourInput`**: A field with a manual hex code input and a clickable color swatch trigger.
- **`InputGroup`**: Aligns multiple inputs or buttons in a row. Use `joined` to merge their borders into a single unit. Inherits `size` to all children.
- **`Fieldset`**: Groups related fields with a `legend`. Use `isInForm` for correct ARIA role behavior in form tags.

### Actions & Navigation

- **`Button`**: Primary interactive element. Supports `regular` and `accent` colors, and `small`, `medium`, and `large` sizes. Can include an `icon` with `iconPosition` (`left`, `right`, or `only`).
- **`Tabs`**: A tabbed interface for switching between content sections. Supports a "full-featured" mode with content snippets or a navigation-only mode.
- **`Menu`**: A floating list of actions. Includes `MenuButton` (trigger), `MenuItem` (standard item), and `MenuDivider`. Supports the `useMenu()` hook for closing from custom controls.
- **`Sidebar`**: Sticky left-hand navigation. Transitions between a fixed desktop view and an overlay mobile view.
- **`Header`**: Top navigation and branding bar.

### Feedback & Overlays

- **`Loader`**: A spinning animation for background tasks.
- **`LoaderOverlay`**: Covers the parent container with a semi-transparent layer and a loader to block interaction.
- **`Modal`**: A centered dialog box for critical actions or information. Supports titles, action bars, and optional fullscreen view on mobile.

### Misc

- **`Icon`**: Renders a vector icon by name. Supports custom `size` (px).
- **`Small`**: Semantic utility for secondary or small-print text.

## Implementation Guidelines

### 1. Composition

The input system avoids monolithic components. Use the `Field` component to wrap raw inputs (`TextInput`, `Select`, etc.) to add labels and technical metadata without bloating the individual input components.

### 2. Context-based Sizing

Components support `small`, `medium` (default), and `large` sizes. When components are placed inside an `InputGroup`, they inherit the group's size using Svelte context.

### 3. ARIA Grouping

Use `Fieldset` for groups of related inputs. Setting `isInForm` correctly assigns accessibility roles for better screen reader support.

### 4. Direct Theming

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
