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

- **`UIRoot`**: Required parent wrapper. Sets the base font, HSL color tokens, and manages theme state. Supports bindable `mode` (the configured theme preference: `'light'`, `'dark'`, or `undefined` for system preference) and bindable `resolvedMode` (the currently active resolved theme: `'light'` or `'dark'`, which takes system settings into account when `mode` is `undefined`).
- **`Panel`**: A bordered container. Use `variant` (`regular`, `secondary`, `accent`) to change background colors. Use the `tag` prop (e.g. `tag="section"`) to specify a custom HTML element for better semantics. *Note: Panels should be used sparingly, only for items that specifically require visual elevation and distinction from other content on the page (e.g. they should not wrap entire layout pages).*
- **`Padding`**: Adds consistent spacing. Use `size` (`small`, `medium`, `large`) and optional `x` or `y` flags to specify axes.
- **`Divider`**: A 1px horizontal or vertical line for visual separation.
- **`ReaderTypography`**: A wrapper for formatted reading content (such as blog posts or articles). Provides styled global overrides inside a `.reader-typography` container, adjusting margins, headings, paragraph heights, link styles with hover transitions, and embedding responsive 16:9 iframes, figures, and media with rounded corners, with subtle shadow glows applied to images, videos, iframes, and Koenig cards.
- **`Masonry`**: A lightweight grid layout component that arranges items vertically based on their heights. Supports custom columns, grid gaps, and padding. Exposes a bindable `refreshLayout` method to manually trigger layout updates for dynamic content, an optional `allowResize` prop to conditionally enable or disable layout updates during container resizing transitions, and an `animate` prop (with configurable `transitionDuration` and `transitionEasing`) to transition items as they slide into place.
- **`LayoutAdaptivePane`**: A generic component for building Canonical Layouts (List-Detail pattern). Uses `minWidth` and Svelte's `bind:clientWidth` to automatically adapt between a split (multi-pane) view on large screens and a stacked (single-pane) view on smaller screens, driven by the `baseRouteId` vs `currentRouteId`. On desktop, panes are resizable via an integrated visual drag handler. Supports custom width parameters (`mainPaneWidth`, `minMainPaneWidth`, `maxMainPaneWidth`) and an optional `hideNestedWhenEmpty` prop to collapse the detail pane on desktop when no item is selected, expanding it smoothly when navigated. The `paneMode` prop chooses how the detail pane takes up space on desktop: `resize` (the default) narrows the main pane to make room, while `over` slides the detail pane on top of it so the content underneath keeps its width and never re-flows — useful over grid or masonry layouts that would otherwise rearrange. In `over` mode the drag handler still resizes the detail pane, with `mainPaneWidth` setting where its left edge sits; the overlay is not modal, so the uncovered part of the main pane stays visible and clickable. Pass an `onDismiss` callback to have clicks outside the overlay close it — the open state belongs to your router rather than to the component, so `onDismiss` typically navigates back to `baseRouteId`. Leave `onDismiss` off and outside clicks do nothing.
- **`Table`**: A responsive, sortable tabular data grid. Accepts `data` and `columns` configurations, and provides a custom `cell` snippet for template customization. Features a shiny akui-glow header and a sunken/inverse-glow body for distinct button-group vs form-field styling.
- **`DragHandler`**: A visual drag handler component supporting pointer events to handle dragging interactions, along with keyboard navigation (arrow keys) for accessibility. Offers high-quality visual feedback with modern hover, focus, and active styles. Used to build resizable interfaces such as sidebars or split pane views.
- **`NavigationBar`**: Bottom navigation container for mobile screen dimensions. Evenly spaces up to 5 `NavigationBarItem` components.
- **`NavigationBarItem`**: Destination button inside the NavigationBar. Supports `label`, `icon`, `active` states, and `href`.
- **`LayoutFocusShell`**: A responsive layout wrapper for authentication and wizard screens. On desktop viewports, it displays a centered card with a customizable background image, while on mobile devices, the card anchors to the bottom with configurable top spacing. It includes slide transitions for multi-step flows, loading overlays with a spinner, and supports custom background image configurations for light and dark modes.
- **`LayoutContentWidth`**: A layout component that constrains the maximum width of its content on desktop viewports and centers it horizontally. Designed specifically to enforce readable line lengths ("measure") for text-heavy content or single-column forms/settings, ensuring they do not stretch awkwardly on wide monitors. It should be used for articles, settings panels, or forms, but avoided for multi-column grids or dashboard layouts like `Masonry` which are meant to scale fluidly with the viewport.
- **`ControlGroup`**: A container for rendering vertical lists of control items (e.g. `ControlItemText`, `ControlItemExpanded`, or custom content). Automatically draws dividers between children. Supports a `border` prop (default: `true`) to render a panel-like border around the group.

### Input System

Components should be composed: wrap any input in a `Field` to add a label.

- **`Field`**: Adds a `label` and `hint` (helper text) to a child. Automatically links the label to the input ID.
- **`TextInput`**: One-line field. Supports standard types (`text`, `email`, `tel`, `url`, `search`, `number`, `date`, `color`). Supports `small`, `medium`, and `large` sizes.
- **`ClearableInput`**: A text field with a one-click "X" button to reset the value. Ideal for search and filter fields.
- **`FilePicker`**: A button-styled file selector. Wraps a hidden native file input and opens a file selection dialog on click. Supports `accept`, `multiple`, and `onchange`, and matches standard `Button` variants, sizes, and icon positions.
- **`TextArea`**: Multi-line field. Supports `small`, `medium`, and `large` sizes, vertical resizing, and an optional `autosize` property for content-based height resizing.
- **`Wysiwyg`**: A rich-text WYSIWYG editor component powered by `@milkdown/crepe`. Loads its JavaScript bundle dynamically on-demand with a placeholder spinner during loading to enable code splitting. Fully integrated with light and dark mode. Exposes a `focus(collapseToStart?: boolean)` function to focus the editor.
- **`Select`**: Drop-down menu for picking from `options`.
- **`Typeahead`**: An input field that supports suggestions and multi-selection via badges. Can be configured for "tagging" mode using `allowFreetext`, where commas or Enter create new items. Supports `regular` and `ghost` variants (where `ghost` has transparent borders/background by default and reveals them on hover/focus). Expands downward as content grows.
- **`PasswordInput`**: A text field with a toggle button to show or hide the password characters.
- **`InputWithIcon`**: A layout utility that wraps an input and handles the positioning and spacing for left or right icons/actions.
- **`ColourInput`**: A field with a manual hex code input and a clickable color swatch trigger.
- **`InputGroup`**: Aligns multiple inputs or buttons in a row. Use `joined` to merge their borders into a single unit. Inherits `size` to all children.
- **`Fieldset`**: Groups related fields with a `legend`. Use `isInForm` for correct ARIA role behavior in form tags.

### Actions & Navigation

- **`Button`**: Primary interactive element. Supports `regular`, `accent`, and `ghost` variants, and `small`, `medium`, and `large` sizes. The `ghost` variant has a transparent background and no border until hover. Can include an `icon` with `iconPosition` (`left`, `right`, or `only`).
- **`FeedbackButton`**: A button wrapper that manages loading, success, and error feedback states automatically. When an asynchronous click handler (`onclick` returning a `Promise`) is triggered, the button transitions to a loading state with a spinner, followed by a temporary success/error state with custom icons and labels, before reverting back to the idle state. Includes an accessible live region for screen readers.
- **`Badge`**: Informative label or tag. Supports `regular` and `accent` variants, backdrop blur, and text glows. Can be used as a link by providing an `href`.
- **`Tabs`**: A tabbed interface for switching between content sections. Supports a "full-featured" mode with content snippets or a navigation-only mode.
- **`Menu`**: A floating list of actions. Includes `MenuButton` (trigger), `MenuItem` (standard item), and `MenuDivider`. Supports the `useMenu()` hook for closing from custom controls.
- **`Sidebar`**: A side navigation drawer component. It supports permanent, modal, and dismissible layout modes. Features a scrollable top section using the `content` snippet and a fixed bottom section using the `footer` snippet. Supports `title` and `icon` (SVG name or image URL) properties to render an optional app branding header at the top of the drawer. In dismissible mode, it transitions width smoothly without squashing child elements. In modal mode, it displays as an overlay with a clickable backdrop and includes a visually hidden, accessible close button at the top of the drawer by default to support screen reader navigation.
- **`Header`**: A Top App Bar component. It provides three layout zones using the `navigation`, `title`, and `actions` snippets. Supports a `pinned` prop to set whether the bar remains sticky at the top of the viewport or scrolls away with the page.
- **`FeedItemRow`**: A standard list item for RSS feeds, news, or activity streams. Supports a title, excerpt, metadata (tag/time), icons, and images. Handles truncation and focus states out of the box. Also supports stories without headings or tags (e.g., Mastodon RSS feeds), starting the excerpt text inline with the date and icon.
- **`SwipeAction`**: A touch-only gesture wrapper. Swiping left or right slides the inner component to reveal a configurable background colour and icon, scaling the icon and executing the action on release.
- **`DynamicImage`**: A smart image component that handles aspect-ratio fitting (cover/contain), loading placeholders, and fade-in transitions.
- **`Tree`**: A collapsible tree view for hierarchical lists. Supports custom icon snippets, keyboard traversal (arrows, space, Enter), HTML5 drag-and-drop moves with built-in validation, and size options ('small', 'large') to match control styles.

### Media & Lists

- **`ImageMosaic`**: A flexible grid layout component for displaying images in visually pleasing, aspect-ratio-balanced rows.
  - Automatically calculates item widths based on their aspect ratio to ensure uniform row heights.
  - Groups items intelligently using a `minWidth` threshold (default 200px) when auto-balancing.
  - Supports overriding the auto-balancing algorithm by providing explicit `rows` arrays (e.g. `[2, 3, 1]`).
  - Implemented using flexbox without strict column wrappers for optimal semantic structure.
  - Allows custom rendering of each item via a `children` snippet override.

- **`MarkdownContent`**: Renders a markdown string as HTML.

- **`FeedItemRow`**: A flexible grid-based item for list views.
  - Supports optional `title` and `excerpt` with customizable line clamping via `titleClamp` and `excerptClamp` (both default to 2; set to `'none'` to disable).
  - Supports content-only stories without headings or tags (e.g., Mastodon RSS feeds), aligning the excerpt inline with the date and icon.
  - Optional `icon` (left) and `image` (right).
  - Metadata row (`tag` and `time`) with custom alignment.
  - Semantic `<a>` tag wrapper with `active` and `focus` states.
  - Supports `layout="hero"` for top-aligned large thumbnails.

- **`DynamicImage`**: Smart image handling with smooth transitions.
  - Automatic `object-fit` selection based on container ratio.
  - Solid color loading placeholders.
  - Built-in opacity fade-in.

- **`Tree`**: Collapsible tree navigation.
  - Recursively renders hierarchical nodes.
  - Supports keyboard navigation (arrows to traverse, Space to toggle, Enter to select).
  - Supports `draggable` prop with `onDragOver` (drop validation) and `onDrop` callbacks for custom move/reorder logic.
  - Supports `size` prop (`'small'` or `'large'`) to control padding and typography (e.g. `'large'` matches standard `ControlItem` styles).

### Feedback & Overlays

- **`Loader`**: A spinning animation for background tasks. Supports an optional `delay` prop (in milliseconds) to defer visibility for smoother transitions.
- **`LoaderOverlay`**: Covers the parent container with a semi-transparent layer and a loader to block interaction.
- **`Modal`**: A centered dialog box for critical actions or information. Supports titles, action bars, custom icons via snippets, and optional fullscreen view on mobile.
- **`InfoBox`**: A non-intrusive notification or reminder. Supports `variant` (`info`, `warning`, `error`), custom icons or `iconSnippet`, a `title`, and an optional `action` snippet on the right side.
- **`ProgressBar`**: Visualizes the completion of a task. Supports `small`, `medium`, and `large` sizes, and multiple semantic colors (`accent`, `blue`, `green`, etc.). Features 3D depth with sunken tracks and glowing fills.
- **`ProgressXmasTree`**: A progress visualization component displaying a grid of status boxes copyfitted to fill the available space. Incomplete boxes remain dark, while completed boxes light up with an akui glow using either a theme color or custom item-specific colors. Useful for displaying progress of batch processes like feed updates.
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
- **`RelativeTime`**: Renders a relative time string (e.g., "just now", "3 hours ago", "2 Jun"). Displays an accessible tooltip showing the full local date and time on hover/focus. Accepts a configurable `thresholdDays` parameter before reverting to a short date (defaults to 7). Also exports the underlying `formatRelativeTime` formatting function for utility use.

### Accessibility Utilities

- **`.sr-only`**: CSS class for elements that should be hidden visually but remain accessible to screen readers. Use this for descriptive labels on icon-only buttons or additional context in lists.

  ```html
  <button aria-label="Close">
  	<Icon name="x" />
  	<span class="sr-only">Close dialog</span>
  </button>
  ```

### Keyboard Utilities

- **`keyboardNavigation`**: A Svelte action to enable list keyboard navigation.
  - Supports **J** and **K** keys for next/previous item focus navigation.
  - Supports **Enter** key to trigger click event handlers on the selected item.
  - Supports custom key mapping shortcuts via the `keyMap` option.
  - Scans for nested elements marked with `data-selectable` and reads their ID from `data-id`.
  - Supports `onSelect` callback option, fired immediately when navigation changes the focused item.

  ```svelte
  <script>
  	import { keyboardNavigation } from 'svelte-akui';

  	function handleBookmark(id) {
  		// Custom logic
  	}
  </script>

  <div
  	use:keyboardNavigation={{
  		keyMap: {
  			b: (id) => handleBookmark(id)
  		}
  	}}
  >
  	<div data-selectable data-id="item-1">Item 1</div>
  	<div data-selectable data-id="item-2">Item 2</div>
  </div>
  ```

## Application Shell & Layout

To build a responsive application shell, position the `Sidebar` alongside the main content area in a flex container or grid layout. Coordinate the shell's components by following this checklist:

- **Track Viewport Width**: Bind the window's inner width to track the viewport size.
- **Determine Mobile State**: Check if the width is less than the `LayoutAdaptivePane` `minWidth` threshold (defaults to `768px`).
- **Share Layout State**: Expose the mobile state and a sidebar toggle method to child pages using Svelte context.
- **Configure Sidebar Mode**: Set the `Sidebar` `mode` dynamically to `'modal'` on mobile and `'dismissible'` on desktop.
- **Coordinate Sidebar Visibility**: Automatically close the sidebar when entering mobile view, and open it when returning to desktop view.
- **Show Hamburger Trigger**: In page headers, check the layout context and render a hamburger `Button` in the navigation snippet on mobile to open the sidebar.
- **Optional Split Views**: Wrap any layout blocks in `LayoutAdaptivePane` to present them side-by-side on desktop and stacked on mobile. This component is optional and accommodates any content layout.
  - _Tip: Bind `currentRouteId` reactively to SvelteKit optional routing parameters (e.g. `[[articleId]]`) to support deep linking and browser history navigation._

For complete implementation templates, see the Storybook stories:

- [LayoutAdaptivePane Story](file:///Users/ash/Web/svelte-akui/src/lib/components/LayoutAdaptivePane/LayoutAdaptivePane.stories.svelte)
- [Sidebar Story](file:///Users/ash/Web/svelte-akui/src/lib/components/Sidebar/Sidebar.stories.svelte)
- [Header Story](file:///Users/ash/Web/svelte-akui/src/lib/components/Header/Header.stories.svelte)

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

### 5. Skeuomorphic Depth & Affordance

Maintain a consistent visual language of depth to communicate interactivity:

- **Elevated (Convex)**: Use light top and dark bottom inner shadows for buttons and actionable triggers to make them appear raised.
- **Recessed (Concave)**: Use dark top and light bottom inner shadows for `TextInput`, `TextArea`, and `Typeahead` to signify they are "hollow" containers for data.
- **Smoothness**: Use the `Glow` component to add soft, neumorphic transitions that enhance these effects without harsh borders.

### 6. Advanced Menu Usage

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

The `Sidebar` component provides two primary snippets: `content` and `footer`.
To set up standard lists of items, wrap your `ControlItemText`, `ControlItemExpanded` or custom content elements inside a `ControlGroup` component inside the `content` snippet.

```svelte
<Sidebar title="Cosy Reader" icon="book">
	{#snippet content()}
		<ControlGroup>
			<ControlItemText label="Dashboard" icon="house" href="/" />
			<ControlItemExpanded label="Library Capacity" extra="45%" description="Physical shelves filled.">
				<progress value="45" max="100" style="width: 100%; margin-top: 0.5rem;"></progress>
			</ControlItemExpanded>
			<ControlItemText label="Profile" icon="person" href="/profile" />
		</ControlGroup>
	{/snippet}

	{#snippet footer()}
		<Padding size="m">
			<Small>v1.0.4</Small>
		</Padding>
	{/snippet}
</Sidebar>
```

**Accessibility & ARIA Notes**:

- The component supports an `inert` attribute automatically when closed in `modal` or `dismissible` modes to prevent keyboard focus of offscreen elements.
- When `mode="modal"` and the drawer is open, keyboard navigation traps focus and the Escape key can be used to dismiss the drawer.

### 7. Masonry Layout

The `Masonry` component is used to arrange elements in columns of equal width, packing them tightly by placing each item into the currently shortest column. Visual placements are updated using absolute positioning to maintain a correct DOM tab-focus order. All standard HTML attributes (such as `class`, `role`, or `aria-label`) are forwarded directly to the container element.

It supports an optional `allowResize` boolean prop (defaulting to `true`). Setting this to `false` temporarily pauses layout calculations during layout transition animations (e.g. sidebar sliding, pane resizing) to prevent layout thrashing and maintain 60fps animations. When toggled back to `true`, the grid automatically snaps to the final target width.

An `animate` boolean prop (defaulting to `false`) can be enabled to smoothly slide grid items into place when their positions change. You can customize the animation behaviour using `transitionDuration` (defaults to `'0.3s'`) and `transitionEasing` (defaults to `'ease-in-out'`).

When your grid contains dynamic or asynchronous content (such as images that change size after loading), you should bind to the `refreshLayout` prop and trigger it when the content size changes:

```svelte
<script>
	import { Masonry } from 'svelte-akui';
	let refresh;
</script>

<Masonry bind:refreshLayout={refresh}>
	<div class="card">
		<img src="magic-garden.jpg" alt="Night-lilac garden" onload={refresh} />
		<p>Glowing night-lilac seeds shared by elves.</p>
	</div>
	<!-- More items -->
</Masonry>
```

### 8. Settings Page Layout

To lay out settings panels or dashboard configurations consistently across application screens, follow this structure:

- **Constraint & Spacing**: Wrap the settings form elements in `<Padding size="l" y>` and `<LayoutContentWidth size="medium">`. This ensures that fields do not stretch awkwardly on wide viewports and remain centered.
- **Sectioning**: Group related settings into logical groups using the `<ControlSection>` component. Provide a clear `title` and an illustrative `icon`.
- **Grouping**: Nested within each `<ControlSection>`, wrap your control items inside a `<ControlGroup>` component. The `ControlGroup` automatically handles visual boundaries and draws dividers between items.
- **Item Presentation**: Use `<ControlItemExpanded>` for individual settings items:
  - Provide a concise `label` and a clear, plain-English `description`.
  - For simple binary options, use a checkbox layout by setting `layout="horizontal"` and `controlType="checkbox"`, and binding `checked`.
  - For complex controls (e.g. dropdowns, buttons, custom inputs, or list pickers), place them inside the default slot (children) of the component.
- **Navigation**: Place a `<Header>` at the top of the settings viewport with a navigation action (e.g., a "Close" or "Back" arrow button) to allow users to navigate back to the main application context.

