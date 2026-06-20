#### Avoiding Nested Wrappers in Svelte CSF (v5+)

When writing Svelte 5 stories using `@storybook/addon-svelte-csf` (v5+), avoid specifying the `component` property in `defineMeta` if you are explicitly rendering the component tag yourself within the stories.

*   **Problem**: If `component` is defined in `defineMeta`, Storybook automatically wraps every `<Story>`'s content in that component. If you also render the component inside the story, it causes illegal duplicate nesting (e.g., `<Button><Button>...</Button></Button>`).
*   **Solution**: Omit `component` from `defineMeta`. Explicitly declare and configure the component inside each story.
*   **Critical Svelte 5 Requirement**: When `component` is omitted from `defineMeta`, Svelte 5 requires you to wrap the story contents inside an explicit `{#snippet children()}` block. Placing markup directly inside `<Story>` without this snippet will render nothing (blank screen).

##### Example:
```svelte
<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";

  // 1. Omit the 'component' property to prevent auto-wrapping
  const { Story } = defineMeta({
    title: "Components/MyComponent",
  });
</script>

<script lang="ts">
  import MyComponent from "./MyComponent.svelte";
</script>

<Story name="Default">
  {#snippet children()}
    <div class="custom-layout-wrapper">
      <MyComponent primary={true} />
    </div>
  {/snippet}
</Story>
```
