# Svelte Akui

A modular UI library built for **Svelte 5** designed for building web apps. This is a personal project, very unstable and likely to change without notice.

## Getting Started

You can optionally wrap your application in the `UIRoot` component to configure theme preferences (`mode`, `resolvedMode`), base fonts, and design system CSS variables. Individual components and drag-and-drop features work independently with zero setup.

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

- **`UIRoot`**: Optional parent wrapper for global styling and theme management. Sets the base font, HSL colour tokens, and manages theme state. Supports bindable `mode` (the configured theme preference: `'light'`, `'dark'`, or `undefined` for system preference or a custom theme; passing it applies the theme without saving it) and bindable `resolvedMode` (the currently active resolved theme: `'light'` or `'dark'`, which takes system settings into account when `mode` is `undefined`). Takes custom themes through the `themes` prop (`AkuiTheme[]`, each with `id`, `label`, `scheme`, optional `tokens` and optional `group`). Owns a `ThemeStore`, available to descendants through `getThemeStore()`: `themes` (Light, Dark, then the custom ones), `selected`, `selectedId`, `scheme`, `tokens` and `select(theme | null)`. The chosen theme is saved to localStorage (`akui-theme`), set as `data-akui-theme` on the root, and its `tokens` are applied inline. Automatically initialises the `reducedMotion` store.
- **`SelectableItem`**: A selectable card of any content, backed by a real radio button or checkbox (`type="radio"` by default, or `"checkbox"`), so it works in normal forms and keeps native keyboard and screen-reader behaviour. Radios sharing a `name` form a group; bind the chosen `value` with `bind:group`, or a checkbox with `bind:checked`. It provides only the behaviour and feedback: hover tint, a pressed look, an inset accent glow when selected and a `:focus-visible` ring. The design inside (and any border or background) is yours; style it with `class`, and use the `data-checked` attribute for the selected state. Supports `disabled` and passes other attributes (`required`, `aria-label`) to the input.
- **`ThemePicker`**: A group of selectable cards (built from `SelectableItem`) (preview on top, label below) that sets the `UIRoot` theme. It lists System plus every theme the `UIRoot` was given (Light, Dark and its `themes` prop); it takes no theme list of its own. Hide System with `includeSystem={false}`. Options appear in the order given to `UIRoot`'s `themes`, so sort them there. Use `groupBy` to show headed groups: `'scheme'` (Light themes / Dark themes), `'group'` (the optional `group` string on each theme) or `'none'` (default); System and themes without a `group` sit first, unheaded. Use `label` for the accessible group name and `onchange` to react to a pick. Must be inside a `UIRoot`.
- **`Panel`**: A bordered container. Use `variant` (`regular`, `secondary`, `accent`) to change background colors. Use the `tag` prop (e.g. `tag="section"`) to specify a custom HTML element for better semantics. The `surface` prop (a `SurfaceStyle`) overrides `background`, `foreground`, `borderColour` and `backdropFilter`, e.g. a translucent background to show the page behind. _Note: Panels should be used sparingly, only for items that specifically require visual elevation and distinction from other content on the page (e.g. they should not wrap entire layout pages)._
- **`Padding`**: Adds consistent spacing. Use `size` (`small`, `medium`, `large`) and optional `x` or `y` flags to specify axes.
- **`Divider`**: A 1px horizontal or vertical line for visual separation.
- **`ReaderTypography`**: A wrapper for formatted reading content (such as blog posts or articles). Provides styled global overrides inside a `.reader-typography` container, adjusting margins, headings, paragraph heights, link styles with hover transitions, and embedding responsive 16:9 iframes, figures, and media with rounded corners, with subtle shadow glows applied to images, videos, iframes, and Koenig cards.
- **`Masonry`**: A lightweight grid layout component that arranges items vertically based on their heights. Supports custom columns, grid gaps, and padding. Exposes a bindable `refreshLayout` method to manually trigger layout updates for dynamic content, an optional `allowResize` prop to conditionally enable or disable layout updates during container resizing transitions, an `animate` prop (with configurable `transitionDuration` and `transitionEasing`) to transition items as they slide into place, and `bind:items` + `itemSnippet` for data-driven rendering. Layout only — it does not implement dragging. To reorder or move cards, wrap items in `<Draggable>` and add `<DropTarget>`s; on drop, update the `items` array and Masonry animates every card to its new place.
- **`LayoutAdaptivePane`**: A generic component for building Canonical Layouts (List-Detail pattern). The `surface` prop overrides the `background` and `borderColour` of the container and main pane (e.g. `'transparent'`); The `nestedBackdrop` snippet draws a page background behind the nested pane on the desktop split (window-sized and offset to line up with the page, and it slides with the pane); content inside must not paint a solid background. When stacked the nested pane stays opaque. Uses `minWidth` and Svelte's `bind:clientWidth` to automatically adapt between a split (multi-pane) view on large screens and a stacked (single-pane) view on smaller screens, driven by the `baseRouteId` vs `currentRouteId`. On desktop, panes are resizable via an integrated visual drag handler. Supports custom width parameters (`mainPaneWidth`, `minMainPaneWidth`, `maxMainPaneWidth`) and an optional `hideNestedWhenEmpty` prop to collapse the detail pane on desktop when no item is selected, expanding it smoothly when navigated. The `paneMode` prop chooses how the detail pane takes up space on desktop: `resize` (the default) narrows the main pane to make room, while `over` slides the detail pane on top of it so the content underneath keeps its width and never re-flows — useful over grid or masonry layouts that would otherwise rearrange. In `over` mode the drag handler still resizes the detail pane, with `mainPaneWidth` setting where its left edge sits; the overlay is not modal, so the uncovered part of the main pane stays visible and clickable. Pass an `onDismiss` callback to have clicks outside the overlay close it — the open state belongs to your router rather than to the component, so `onDismiss` typically navigates back to `baseRouteId`. Leave `onDismiss` off and outside clicks do nothing. Set `focusNested` to make the overlay cover the whole viewport, including a sidebar beside the container (fixed position, no divider, border or shadow); it has no effect in `resize` mode or when stacked. Set `viewTransition` when the app morphs the pane with the exported `morphTransition` helper: the pane's own enter and exit animations are then skipped whenever it is full screen (stacked or `focusNested`), and the pane carries a `data-akui-nested-pane` attribute for finding it. `morphTransition({ name, fromElement, toElement, update })` is for SvelteKit's `onNavigate`: return its promise from the callback. It morphs `fromElement` (e.g. a clicked card) into `toElement` (the pane) with the new content crossfading in, and awaits `update` (e.g. `navigation.complete`) inside the transition, not before returning. With Reduced Motion on it does a short (0.15s) crossfade of the page instead of the morph; with no View Transitions support or no `fromElement`, it resolves at once and the page just changes. The `akui-note-open` morph timing is in `theme.css`.
- **`Table`**: A responsive, sortable tabular data grid. Accepts `data` and `columns` configurations, and provides a custom `cell` snippet for template customization. Features a shiny akui-glow header and a sunken/inverse-glow body for distinct button-group vs form-field styling.
- **`DragHandler`**: A visual drag handler component supporting pointer events to handle dragging interactions, along with keyboard navigation (arrow keys) for accessibility. Offers high-quality visual feedback with modern hover, focus, and active styles. Used to build resizable interfaces such as sidebars or split pane views.
- **`NavigationBar`**: Bottom navigation container for mobile screen dimensions. Evenly spaces up to 5 `NavigationBarItem` components.
- **`NavigationBarItem`**: Destination button inside the NavigationBar. Supports `label`, `icon`, `active` states, and `href`.
- **`LayoutFocusShell`**: A responsive layout wrapper for authentication and wizard screens. On desktop viewports, it displays a centered card with a customizable background image, while on mobile devices, the card anchors to the bottom with configurable top spacing. It includes slide transitions for multi-step flows, loading overlays with a spinner, and supports custom background image configurations for light and dark modes. Set `contained` to fill its parent element instead of the viewport.
- **`LayoutContentWidth`**: A layout component that constrains the maximum width of its content on desktop viewports and centers it horizontally. Designed specifically to enforce readable line lengths ("measure") for text-heavy content or single-column forms/settings, ensuring they do not stretch awkwardly on wide monitors. It should be used for articles, settings panels, or forms, but avoided for multi-column grids or dashboard layouts like `Masonry` which are meant to scale fluidly with the viewport.
- **`ControlGroup`**: A container for rendering vertical lists of control items (e.g. `ControlItemText`, `ControlItemExpanded`, or custom content). Automatically draws dividers between `ControlItemText` and `ControlItemExpanded` children. Supports a `border` prop (default: `true`) to render a panel-like border around the group.
  - `ControlItemExpanded` also takes an `icon` snippet (leading content), a `descriptionSnippet`, `animateDescription` (slides the description open and shut) and `wrapperRole` (use `'listitem'` in a `role="list"` group). Without `onclick` or `controlType` it is a static, non-focusable row. `ProgressCheckItem` is built on it.

### Input System

Components should be composed: wrap any input in a `Field` to add a label.

- **`Field`**: Adds a `label` and `hint` (helper text) to a child. Automatically links the label to the input ID.
- **`TextInput`**: One-line field. Supports standard types (`text`, `email`, `tel`, `url`, `search`, `number`, `date`, `color`). Supports `small`, `medium`, and `large` sizes.
- **`ClearableInput`**: A text field with a one-click "X" button to reset the value. Ideal for search and filter fields.
- **`FilePicker`**: A button-styled file selector. Wraps a hidden native file input and opens a file selection dialog on click. Supports `accept`, `multiple`, and `onchange`, and matches standard `Button` variants, sizes, and icon positions.
- **`TextArea`**: Multi-line field. Supports `small`, `medium`, and `large` sizes, vertical resizing, and an optional `autosize` property for content-based height resizing.
- **`Wysiwyg`**: A rich-text WYSIWYG editor component powered by Tiptap, with markdown in and out. Opt-in "/" slash menu (`slashMenu`, extendable via `items`) and keyboard shortcuts. Loads its JavaScript bundle dynamically on-demand with a placeholder spinner during loading to enable code splitting. Fully integrated with light and dark mode. Supports custom paste hooks (`transformPastedHTML`, `transformPastedText`, `handlePaste`) for sanitisation and custom clipboard workflows. Exposes a `focus(collapseToStart?: boolean)` function to focus the editor. The "/" slash menu and block-drag-handle are opt-in via `slashMenu`: pass `true` for Crepe's defaults (headings, blockquotes, lists/checklists, images, code blocks, tables, math), or a `SlashMenuConfig` object to hide groups/items (set any entry to `null`) or extend the menu with your own commands via `buildMenu`. Set `groupCompletedTasks` to move ticked checklist items to a collapsible "completed" section at the end of their list. Set `startWithHeading` to open an empty editor on an empty H1, and `demoteLongHeadingAt` to turn a first-line H1 longer than that many characters into a paragraph (once). `focusHeadingAt(offset)` puts the cursor in the first-line heading. Unticked task items have a drag handle (on hover, on the cursor's line, and always on touch screens) to reorder them within their list.
- **`Select`**: Drop-down menu for picking from `options`.
- **`Checkbox`**: Styled native checkbox with `label` (or `children`), `bind:checked`, `indeterminate`, `disabled`, `required` and `small`/`medium`/`large` sizes. Submits and resets like a normal checkbox.
- **`CheckboxGraphic`**: The `Checkbox` look with no `<input>` behind it. Takes `checked`, `indeterminate` and `size`. Display only: it takes no pointer events and has no form value. Exposed as a read-only `role="checkbox"`.
- **`Radio`**: Styled native radio with `label` (or `children`), `value` and `bind:group`. Radios sharing a `name` form one group with native arrow-key navigation. Same sizes and states as `Checkbox`.
- **`Toggle`**: On/off switch built on a native checkbox with `role="switch"`. Same props, sizes and form behaviour as `Checkbox`, minus `indeterminate`.
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
- **`Menu`**: A floating list of actions. Includes `MenuButton` (trigger), `MenuItem` (standard item; `controlType="radio"` or `"checkbox"` with `checked` makes it a choice that keeps the menu open), and `MenuDivider`. Supports the `useMenu()` hook for closing from custom controls. `presentation` picks a popover, a bottom sheet, or `'auto'` (sheet on small screens). `MenuButton` has a bindable `open` prop. Opens with a staggered fade and slide of each item from the top or bottom (`origin`, or override with `openFrom`), while the menu surface fades in over the same span.
- **`Sidebar`**: A side navigation drawer component. The `surface` prop (a `SurfaceStyle`) overrides its `background`, `foreground`, `borderColour` and `backdropFilter`; the branding header follows it. It supports permanent, modal, and dismissible layout modes. Features a scrollable top section using the `content` snippet and a fixed bottom section using the `footer` snippet. Supports `title` and `icon` (SVG name or image URL) properties to render an optional app branding header at the top of the drawer. In dismissible mode, it transitions width smoothly without squashing child elements. In modal mode, it displays as an overlay with a clickable backdrop and includes a visually hidden, accessible close button at the top of the drawer by default to support screen reader navigation.
- **`Header`**: A Top App Bar component. It provides three layout zones using the `navigation`, `title`, and `actions` snippets. Supports a `pinned` prop to set whether the bar remains sticky at the top of the viewport or scrolls away with the page. An `onclick` prop fires when the empty background area is clicked (not the navigation, title or actions content), useful for e.g. opening a search box. The `surface` prop (a `SurfaceStyle`) overrides `background`, `foreground`, `borderColour` and `backdropFilter`, e.g. `{ background: 'transparent', backdropFilter: 'blur(12px)' }` to show a page background through it.
- **`Settings`**: A two-level settings screen. Takes a `sections` array (`id`, `label`, `icon`, `description`, `title`, and a `children` snippet with the section's content). When its own width (`bind:clientWidth`) is at least `mobileBreakpoint` (default `768`) it shows a column of `SettingsNavItem` tabs beside the open section. Below that it shows an overview of `ControlGroup` rows; choosing one slides the section in, with a back button in its header. Both layouts have a top `Header` (`title` or `titleSnippet`, `headerActions`) and a second `Header` over the section content (`detailTitle`, `detailActions`). `selectedId` is bindable, and `null` means the mobile overview (desktop shows the first section). Like `Sidebar`, it does no routing: set `selectedId` from the route and navigate in `onselect`. `onback` shows a back button on the overview. The desktop tabs use the same row metrics as `Tree`: `size` (`'small'` or `'large'`) sets their padding, gap, icon and text size, and `padding` sets the space around the list. The `surface` prop (a `SurfaceStyle`) overrides the `background`, `foreground` and `borderColour` of the component and its headers, e.g. `{ background: 'transparent' }` to show a page background through it. The mobile slide is CSS-only and respects reduced motion.
- **`HeaderSearch`**: A search bar component designed to integrate with headers. Supports `takeover` mode (which renders an animated circular clip overlay over the parent header when active) and `inline` mode. Features debounced input updates, auto-focus on activation, Escape key dismissal, and customisable `prefix` and `suffix` snippets. The `surface` prop overrides `background`, `foreground` and `borderColour` (not `backdropFilter`, which would blur only the parent header). In `takeover` mode the bar is drawn over the header's content, so with a translucent `background` hide that content while searching.
- **`FeedItemRow`**: A standard list item for RSS feeds, news, or activity streams. Supports a title, excerpt, metadata (tag/time), icons, and images. Handles truncation and focus states out of the box. Also supports stories without headings or tags (e.g., Mastodon RSS feeds), starting the excerpt text inline with the date and icon.
- **`SwipeAction`**: A touch-only gesture wrapper. Swiping left or right slides the inner component to reveal a configurable background colour and icon, scaling the icon and executing the action on release.
- **`DynamicImage`**: A smart image component that handles aspect-ratio fitting (cover/contain), loading placeholders, and fade-in transitions.
- **`Tree`**: A collapsible tree view for hierarchical lists. Supports custom icon snippets, keyboard traversal (arrows, space, Enter), and size options ('small', 'large') to match control styles. It has no drag-and-drop of its own: pass `itemAttributes` to spread your own attributes and attachments onto each row — a `dragSource()` to make rows draggable, a `dropTarget()` to make them accept payloads, or anything else. Return `class: 'akui-tree-item-row-highlight'` from `itemAttributes` to light a row up while it is the active target.
- **`DropTarget`**: A generic drop target container and element attachment (`dropTarget()`) for accepting drag-and-drop payloads anywhere in an application. Coordinates with global drags via `DropManager`. Exposes `canDrop` to filter payloads, `ondrop` to handle dropped items, and reactive hover states (`isOver`, `canDrop`, `isDragging`). Can be used via `<DropTarget>` or directly on elements with the `{@attach target.attach}` attachment. See the [Drag and Drop guide](docs/drag-and-drop.md).
- **`Draggable`**: The drag-source mirror of `DropTarget`, backed by `dragSource()`. Wrap any element to make it draggable into global `DropTarget`s via `DropManager`. Takes `getPayload` to build the drag payload, plus `handleSelector`, `disabled`, `longPressDelay`, `mouseThreshold`, `dragScale`, and `ondragstart`/`onlongpress`/`ondragmove`/`ondrop`/`oncancel`/`ondragend` callbacks. `onlongpress` fires once a touch long-press elapses without the finger having moved yet — useful for a press-and-hold "select" gesture — and the drag still promotes normally if the finger moves afterwards. Exposes reactive `isDragging` and `delta` (to its `children` snippet). Owns its own start gate (mouse travel threshold / touch long-press), pointer capture, Escape-to-cancel, trailing-click suppression, and a snap-back settle when the drag ends. Use via `<Draggable>` or directly with the `{@attach source.attach}` attachment. See the [Drag and Drop guide](docs/drag-and-drop.md).

### Media & Lists

- **`ImageMosaic`**: A flexible grid layout component for displaying images in visually pleasing, aspect-ratio-balanced rows.
  - Automatically calculates item widths based on their aspect ratio to ensure uniform row heights.
  - Groups items intelligently using a `minWidth` threshold (default 200px) when auto-balancing.
  - Supports overriding the auto-balancing algorithm by providing explicit `rows` arrays (e.g. `[2, 3, 1]`).
  - Implemented using flexbox without strict column wrappers for optimal semantic structure.
  - Allows custom rendering of each item via a `children` snippet override.

- **`MarkdownContent`**: Renders a markdown string as HTML. `checkboxes="graphic"` draws task-list checkboxes (`- [x]`) as `CheckboxGraphic` instead of the browser's disabled checkbox; `checkboxSize` sets their size.

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

- **`Tree`**: Collapsible tree navigation. Pass `onReorder` to let items be dragged into a new order among their siblings: a grip handle shows on hover and focus (it is a tab stop: Up and Down arrows move the item, with a screen reader announcement), the dragged row follows the pointer and the rows it passes slide aside. `reorderable(item)` limits which items can move; the rest stay put. The tree doesn't reorder `items` itself, so reorder your data in `onReorder`.
  - Recursively renders hierarchical nodes.
  - Supports keyboard navigation (arrows to traverse, Space to toggle, Enter to select).
  - Drag and drop is composed via `itemAttributes`: attach `dragSource()` / `dropTarget()` attachments to customize per-row drag or drop behavior without built-in assumptions.
  - Supports `size` prop (`'small'` or `'large'`) to control padding and typography (e.g. `'large'` matches standard `ControlItem` styles).

### Feedback & Overlays

- **`Loader`**: A spinning animation for background tasks. Supports an optional `delay` prop (in milliseconds) to defer visibility for smoother transitions.
- **`LoaderOverlay`**: Covers the parent container with a semi-transparent layer and a loader to block interaction.
- **`Modal`**: A centered dialog box for critical actions or information. Supports titles, action bars, custom icons via snippets, and optional fullscreen view on mobile. Set `inline` to render the card in page flow without the native dialog or backdrop.
- **`InfoBox`**: A non-intrusive notification or reminder. Supports `variant` (`info`, `warning`, `error`), custom icons or `iconSnippet`, a `title`, and an optional `action` snippet on the right side.
- **`NotificationArea`**: A stacked live region of `InfoBox` notifications. Each item takes:
  - `variant`.
  - `icon` (a Bootstrap icon name) or `iconSnippet` (custom content, such as a `Loader`).
  - `timeout`: auto-dismiss, minimum 5 s, `0` = sticky. Shows a countdown bar.
  - `onClick`: makes the whole card a button (hover, active and focus states). Dismisses after it runs.
  - `actionLabel` and `onAction`: an optional action button.

  Timers and bars pause while the list is hovered or focused. New items are announced through a matching `aria-live` region. `position` places it in a fixed corner or `inline`.
- **`Avatar`**: A user picture. Shows `src`, falling back to `initials` (the first two letters, in capitals) if there is no image or it fails to load, then to a person icon. `shape` is `rounded` (default, a square with rounded corners) or `round`. `size` takes any CSS length. It has the standard akui `Glow` edge.
- **`Thread`, `ThreadItem`, `Message`**: Threaded messages with Reddit-style thread lines.
  - `Thread` wraps the top-level `ThreadItem`s. `size` is `small` (compact), `medium` (default, airy like Slack) or `large` (roomy like WordPress comments). It scales the avatar, spacing, dots, line width and text. `avatarSize` and `gap` override the size's values.
  - `ThreadItem` holds a `Message` (as `children`), an optional `avatar` (props or a snippet) and nested `ThreadItem`s (as `replies`). With no `avatar` it shows a dot.
  - `indent={false}` puts a reply directly below with a straight line through the dots. `indent` offsets it with an L-shaped line. Indented siblings branch off one trunk line. Both can be mixed and nested without limit.
  - Collapsing is off by default: the lines are plain decoration with no buttons, hover or focus states, and `collapsed` is ignored. Set `collapsible` on `Thread` to turn it on, or on a single `ThreadItem` to override it.
  - Each reply owns the line running up from its avatar or dot to the avatar above it (the previous sibling, or the parent for a first reply). Nothing is drawn below an avatar. Clicking or pressing that line collapses just that reply. A collapsed item keeps only the first row of its `Message` (name, username, date), centred beside a small circle with a `+` that expands it, and hides the contents, controls and replies. Each line is a button with `aria-expanded` and an `aria-label` ("Collapse thread"), which `lineLabel` can name (e.g. "reply from Mabel"). With keyboard focus it turns into a dashed line in the accent colour. Top-level items have no line, so collapse them with the bindable `collapsed` prop. Use `Thread` as the outer wrapper.
  - Each line's reach is measured in the browser (`ResizeObserver`), so lines between siblings appear after the first client render. `collapsed` is bindable, and the expand circle is labelled "Show N replies" (`replyCount`) or `collapsedLabel`.
  - `Message` is a grid of name, username, date (`RelativeTime`) and a `headerControls` snippet, then the contents, then a `controls` snippet. `header` trims the row: `full` (default), `date` (date only, for a same-author follow-up) or `none` (no row, contents start level with the dot).
  - `ThreadItem` takes `Avatar` props (or a snippet) as `avatar`. The collapsed `+` circle and dots stay round.
- **`ProgressChecks`**: A `ControlGroup` list of steps for multi-stage jobs such as imports. Each step has a `status` (`pending`, `active`, `done`, `warning`, `error`) that sets the icon and its colour (spinner while active, check when done). Use `warning` for a step that finished but skipped or failed some items. Optional `value`/`max` adds a "value / max" label on the right (there is no progress bar: the spinner and the count are enough); `detail` overrides that text. `skipped`, `failed` and `message` add a note line under the label, e.g. "22 skipped · 3 failed · Owl unavailable". Each step is one line until it has a note (`message`, `skipped` or `failed`), then a second line slides open and shuts again when the note clears. Pass a `note` snippet to render your own second line, or `reserveNote` to keep every step two lines tall. Pass an `icon` snippet to replace the icons. `ProgressCheckItem` renders one row on its own.
- **`ProgressBar`**: Visualizes the completion of a task. Supports `small`, `medium`, and `large` sizes, and multiple semantic colors (`accent`, `blue`, `green`, etc.). Fills use the `--akui-color-<name>-solid` tokens, which are the same in light and dark. Features 3D depth with sunken tracks and glowing fills.
- **`DrawingFreehand`**: Drawing canvas with a pen and an eraser (`tool`: `'pen' | 'erase'`, bindable). Choosing the pen opens a second row of brush sizes (`penSize`, bindable; `penSizes` sets the choices) and colour swatches (ink, red, yellow, green, blue and a rainbow custom picker; `penColour`, bindable hex, undefined is the theme ink). Strokes are pressure-aware strokes from perfect-freehand, and an infinite canvas: two-finger pan and pinch zoom, wheel to pan, ctrl+wheel or trackpad pinch to zoom, Space+drag to pan. Pass `svg` to load a saved drawing, or any other SVG: its shapes (paths, rects, circles and so on, with nested transforms and attribute paint) load as erasable outlines. CSS styles, text and images are not read and call `getSvg()` for a standalone SVG (plain `<path>` elements). `onchange` fires after each committed change; `undo()`, `redo()`, `clear()`, `resetView()` and `isEmpty()` are available through `bind:this`. The eraser removes whole strokes. Holding Alt while pressing erases with any tool selected. Keys `1` and `2` pick the pen and eraser, and Cmd/Ctrl+Z undoes.
- **`ProgressXmasTree`**: A progress visualization component displaying a grid of status boxes copyfitted to fill the available space. Incomplete boxes remain dark, while completed boxes light up with an akui glow using either a theme color (the `--akui-color-<name>-solid` tokens) or custom item-specific colors. Useful for displaying progress of batch processes like feed updates.
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

- **`reducedMotion`**: Reactive store tracking `prefers-reduced-motion`. Defaults to the system OS preference, with optional user overrides persisted to `localStorage` (`akui-reduced-motion`). All akui components follow it, including the override:
  - `UIRoot` writes the effective value to `<html data-reduced-motion>`, and while it is `true` stops all CSS transitions and keyframe animations (loaders keep a slow spin). Style your own reduced-motion rules with `html[data-reduced-motion='true']` rather than `@media (prefers-reduced-motion)`, which can't see the override.
  - `motion(params)`: wrap Svelte transition params so they become instant when reduced motion is on, e.g. `transition:fade={motion({ duration: 200 })}`. Svelte transitions don't go through CSS, so the `UIRoot` rule can't stop them.
  - `reducedMotion.value`: Boolean indicating whether reduced motion is active (returns the override if set, otherwise the system preference).
  - `reducedMotion.systemPrefers`: Live OS-level `prefers-reduced-motion` value.
  - `reducedMotion.override`: User override (`true`, `false`, or `null` when following system settings).
  - `reducedMotion.isOverridden`: Boolean indicating whether an explicit override is stored.
  - `reducedMotion.set(next: boolean)`: Explicitly sets or clears the override (clears override if matching system preference).
  - `reducedMotion.toggle()`: Toggles the effective preference.

  ```svelte
  <script>
  	import { reducedMotion } from 'svelte-akui';
  </script>

  {#if !reducedMotion.value}
  	<AnimatedBackground />
  {/if}

  <button onclick={() => reducedMotion.toggle()}>
  	Reduced Motion: {reducedMotion.value ? 'On' : 'Off'}
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

### DOM & Event Attachments

- **`clickOutside`**: A Svelte 5 attachment (`Attachment<HTMLElement>`) that invokes a callback when a pointer press occurs outside the attached element. Listens on `pointerdown` in the capture phase using `on()` from `svelte/events`, ensuring dismissal triggers before target click handlers run without racing event delegation.

  ```svelte
  <script>
  	import { clickOutside } from 'svelte-akui';

  	let selected = $state(false);
  </script>

  <div {@attach selected ? clickOutside(() => (selected = false)) : undefined}>
  	Card content
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

- [LayoutAdaptivePane Story](src/lib/components/LayoutAdaptivePane/LayoutAdaptivePane.stories.svelte)
- [Sidebar Story](src/lib/components/Sidebar/Sidebar.stories.svelte)
- [Header Story](src/lib/components/Header/Header.stories.svelte)
- [Draggable Story](src/lib/components/Draggable/Draggable.stories.svelte)
- [DropTarget Story](src/lib/components/DropTarget/DropTarget.stories.svelte)

## Implementation Guidelines

### 1. Composition

The input system avoids monolithic components. Use the `Field` component to wrap raw inputs (`TextInput`, `Select`, etc.) to add labels and technical metadata without bloating the individual input components.

### 2. Context-based Sizing

Components support `small`, `medium` (default), and `large` sizes. When components are placed inside an `InputGroup`, they inherit the group's size using Svelte context.

### 3. ARIA Grouping

Use `Fieldset` for groups of related inputs. Setting `isInForm` correctly assigns accessibility roles for better screen reader support.

### 4. Theme & Dark Mode

`svelte-akui` supports automatic dark mode switching based on browser preference. By default, `UIRoot` will detect the system preference if no `mode` is provided.

To let users choose, pass custom themes to `UIRoot` with `themes` and render `ThemePicker` inside it. Custom themes are plain objects (`id`, `label`, `scheme`, optional `tokens`); `scheme` decides which built-in light or dark rules apply, and `tokens` override `--akui-*` variables on top. The choice is saved in localStorage under `akui-theme`.

Surfaces are opaque by default. For translucent ones, each background token has a 25% alpha variant: `--akui-{bg,bg-secondary,bg-input,bg-button,bg-accent}-alpha`, e.g. `--akui-bg-alpha`. Pass one to a component's `surface` prop (`{ background: 'var(--akui-bg-alpha)' }`) or use it in your own CSS. A theme that overrides a background token should override its `-alpha` variable too.

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

Forms and other interactive elements inside a `Menu` will not close the menu by default because click events are stopped at the menu container level. Only explicit calls to `menu.close()` or clicking a `MenuItem` will trigger a closure (a `MenuItem` with `controlType` is the exception: it keeps the menu open).

### 6. Sidebar Composition & ARIA

The `Sidebar` component provides two primary snippets: `content` and `footer`.
To set up standard lists of items, wrap your `ControlItemText`, `ControlItemExpanded` or custom content elements inside a `ControlGroup` component inside the `content` snippet.

```svelte
<Sidebar title="Cosy Reader" icon="book">
	{#snippet content()}
		<ControlGroup>
			<ControlItemText label="Dashboard" icon="house" href="/" />
			<ControlItemExpanded
				label="Library Capacity"
				extra="45%"
				description="Physical shelves filled."
			>
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

The `Masonry` component is used to arrange elements in columns of equal width, packing them tightly by placing each item into the currently shortest column. Visual placements are updated using absolute positioning to maintain a correct DOM tab-focus order. With `animate`, items glide to their new slots using the View Transitions API (instant where it is unsupported, with Reduced Motion on, on resize, and on the first layout). `transitionDuration` and `transitionEasing` set the timing. All standard HTML attributes (such as `class`, `role`, or `aria-label`) are forwarded directly to the container element.

It supports an optional `allowResize` boolean prop (defaulting to `true`). Setting this to `false` temporarily pauses layout calculations during layout transition animations (e.g. sidebar sliding, pane resizing) to prevent layout thrashing and maintain 60fps animations. When toggled back to `true`, the grid automatically snaps to the final target width.

An `animate` boolean prop (defaulting to `false`) can be enabled to smoothly slide grid items into place when their positions change. You can customize the animation behaviour using `transitionDuration` (defaults to `'0.3s'`) and `transitionEasing` (defaults to `'ease-in-out'`).

`Masonry` is layout only. To make cards draggable — to reorder within the grid, or move one onto something else — wrap each item in `<Draggable>` and give it (or a target elsewhere) a `<DropTarget>`. On a reorder drop, splice the `items` array; with `animate` on, every card glides to its new slot. See the "Reorder via Draggable" story.

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
