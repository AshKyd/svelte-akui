#### Avoiding Nested Wrappers

When using `defineMeta` in Svelte Storybook, avoid specifying the `component` property if the stories themselves already include the component tag.

- **Problem**: Storybook automatically wraps every `<Story>` content in the specified `component`. If the story already contains that component, it results in illegal nesting (e.g., a button inside a button).
- **Solution**: Only specify `title` and `tags` in `defineMeta`. Explicitly render the component inside each `<Story>`. This gives you full control over props and layout without accidental duplication.
- **Tip**: This is especially critical for Svelte 5 components without a `children` snippet, as Storybook's wrapper will silently discard all story content.
