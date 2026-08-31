# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`svelte-akui` is a modular Svelte 5 UI library — the component kit consumed by `aknotes`. It is
unstable by design and breaks without notice. Consumers install it from GitHub, so changes here do
not reach `aknotes` until they are pushed and reinstalled.

## Commands

- `npm run dev` — Vite dev server for the demo routes
- `npm run dev:watch` — `svelte-package --watch`, for editing against a linked consumer
- `npm run storybook` — port 6006, `--ci` so it doesn't open a browser
- `npm run build` — Vite build then `prepack` (svelte-package + publint)
- `npm run check` / `check:watch` — svelte-check
- `npm run lint` — prettier --check + eslint; `npm run format` to fix

There is no test runner. Storybook stories are the verification surface.

## Layout

- `src/lib/components/Name/` — `Name.svelte`, `Name.stories.svelte`, `index.ts`; sub-components sit in
  the same folder (`Tree/TreeItem.svelte`).
- `src/lib/theme/theme.css` — HSL colour tokens, applied by `UIRoot`.
- `src/lib/hooks/` — `theme.svelte.ts` (light/dark resolution), `keyboardNavigation.ts`.
- `src/lib/index.ts` — the public entry point; every exported component must be listed here.

`UIRoot` is the required parent wrapper — it sets the base font, the CSS variables and theme state
(`mode` is the preference, `resolvedMode` is what is actually rendering).

## Style guide

These rules come from `.agents/rules/` and apply to every change in this repo.

### README index is part of the component

When creating or modifying a component, update the index in `README.md`. Write plain English, no
hyperbole. Explain what the component does and what its variations are, so an implementor can tell at
a glance what is available without opening the source.

### Flexible content pattern

Anywhere a component takes content — an icon, an image — also let the implementor pass a snippet to
render their own. For item groups, take an array of items **and** an optional snippet that overrides
how each item's icon or image renders. Never make the built-in rendering the only option.

### Storybook placeholder content: Cosy Fantasy

All Storybook placeholder text follows a **Cosy Fantasy** theme — the whimsical, low-stakes everyday
lives of magical folk: gnomes, witches, pastoral magic, community initiatives, the local council,
domestic comforts. Gentle, warm, with a touch of kind irony. Invent fresh examples each time rather
than reusing the same ones; repetition is the failure mode here.

**This is for Storybook only. Never put this content in the production app.**

### Svelte CSF stories: no nested wrappers

With `@storybook/addon-svelte-csf` v5+, omit the `component` property from `defineMeta` when you
render the component tag yourself inside the story — otherwise Storybook wraps every `<Story>` in that
component and you get illegal duplicate nesting (`<Button><Button>…</Button></Button>`).

Once `component` is omitted, Svelte 5 requires the story contents to sit inside an explicit
`{#snippet children()}` block. Markup placed directly inside `<Story>` renders nothing — a blank
screen, with no error.

```svelte
<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';

	// No `component` here: we render MyComponent ourselves below.
	const { Story } = defineMeta({
		title: 'Components/MyComponent'
	});
</script>

<script lang="ts">
	import MyComponent from './MyComponent.svelte';
</script>

<Story name="Default">
	{#snippet children()}
		<div class="custom-layout-wrapper">
			<MyComponent primary={true} />
		</div>
	{/snippet}
</Story>
```

## Conventions

- Svelte 5 runes only (`$state`, `$derived`, `$props`).
- Props use an explicit `Props` interface with a one-line JSDoc per prop, for IntelliSense.
- Australian English in names and docs (colour, centre, analyse).
- TypeScript throughout; avoid `any`.
- This is the library that *provides* the styling, so component CSS lives here — but it must be built
  from the `theme.css` tokens, not hardcoded colours, so light and dark both work.
