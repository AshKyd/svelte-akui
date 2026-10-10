#### Add new components to the Kitchen Sink story

When creating a component, add it to the `Kitchen Sink` story in `src/lib/components/KitchenSink/` so themes can be checked against it.

*   Put it in the matching file in `sections/`, or add a new section file and list it in `KitchenSink.stories.svelte`.
*   Show its variants, sizes and states. Lay demos out in the wrapping `.demo-row` / `.demo-cell` flexbox classes defined in the story file.
*   Skip components with no colour or theme styling (for example layout-only ones like `Padding` and `Masonry`), and components that need data, network or routing.
*   The sections use short, generic placeholder text, not the Cosy Fantasy theme, because the page is for checking colours.
*   `Modal` and `LayoutFocusShell` are shown with their `inline` and `contained` props, since the default modes can't render in page flow.
