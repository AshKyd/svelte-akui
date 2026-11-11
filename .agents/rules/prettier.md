---
trigger: always_on
---

After changing files, always run Prettier on the files you changed: `npx prettier --write <changed files>`. Do this before committing.

- Format only the files you touched. Don't run `npm run format` across the repo, it creates unrelated diffs.
- Check with `npx prettier --check <changed files>`.
- Files with no Prettier parser (e.g. `LICENSE`) are skipped.
