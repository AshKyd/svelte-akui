---
trigger: always_on
---

Write commit messages in the Conventional Commits format: `type(scope): summary`.

- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`.
- `scope` is optional. Use the component or area, e.g. `Tree`, `theme`, `icons`.
- Summary is lower case, imperative, no full stop.
- Mark a breaking change with `!` after the type or scope, and explain it in a `BREAKING CHANGE:` footer.

Examples:

- `feat(Tree): add drag to reorder`
- `fix(DetailsTable): keep selection when rows reload`
- `docs: list Slider in the README index`
- `refactor(theme): derive tokens from --akui-hue`
- `build: add publishConfig for npm`
- `feat(Icon)!: load icons from a published public folder`
