### Visual Foundation

#### Borders & Radii

- **Base Radius**: Most items use `--akui-radius-m` (8px) as their default corner radius.
- **Nested Radii**: To maintain visual harmony, internal items (e.g., buttons inside cards) should use a smaller radius than their container.
  - Rule: `inner_radius = outer_radius - padding`.
  - Tokens: `--akui-radius-s` (4px), `--akui-radius-m` (8px), `--akui-radius-l` (12px).
- **Small Borders**: Borders should be thin (1px) and use semi-transparent colors to blend with the background.

#### Colors & Harmonisation

AKUI uses a consistent naming convention for background and foreground colors:

- **Regular**: `--akui-bg`, `--akui-fg` (Default surface)
- **Secondary**: `--akui-bg-secondary`, `--akui-fg-secondary` (Subtle alternative)
- **Accent**: `--akui-bg-accent`, `--akui-fg-accent` (Brand/Action color)
- **Button**: `--akui-bg-button`, `--akui-fg-button` (Interactive elements)

#### 3D Effects

- **Inner Borders**: Interactive elements and panels use a "3D glow" effect.
- **Gradient Implementation**: This is achieved using a transparent inner border (or `box-shadow`) that goes from a lighter highlight at the top to a darker shade at the bottom.
- **Inheritance**: The effect should inherit the background color of the element to remain subtle and cohesive.

### Storybook Guidelines

#### Avoiding Nested Wrappers

When using `defineMeta` in Svelte Storybook, avoid specifying the `component` property if the stories themselves already include the component tag.

- **Problem**: Storybook automatically wraps every `<Story>` content in the specified `component`. If the story already contains that component, it results in illegal nesting (e.g., a button inside a button).
- **Solution**: Only specify `title` and `tags` in `defineMeta`. Explicitly render the component inside each `<Story>`. This gives you full control over props and layout without accidental duplication.
- **Tip**: This is especially critical for Svelte 5 components without a `children` snippet, as Storybook's wrapper will silently discard all story content.

#### Button

The primary interactive element.

- **Variants**: `regular` (standard grey) and `accent` (brand blue).
- **Sizes**: `small`, `medium`, and `large`.
- **Glow**: Implements the 3D glow effect using the `--akui-glow-top/bottom` tokens.

#### Panel

A versatile container for grouping content.

- **Colours**: Supports `regular`, `secondary`, and `accent`.
- **Glow**: Implements the 3D glow effect using the `--akui-glow-top/bottom` tokens.

#### Button Groups

- Adjacent buttons collapse their shared borders.
- Uses internal dividers (1px) instead of shared borders to maintain a clean look.
