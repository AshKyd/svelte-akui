## Releasing

Releases run locally with `release-it`. Commits must follow Conventional Commits (see `.agents/rules/commits.md`).

- Run from a clean working tree on `main` with `gh` logged in (`gh auth login`).
- `npm run release:dry` shows what would happen and changes nothing.
- `npm run release` runs lint and `npm run check`, picks the next version from the commits (`fix` is a patch, `feat` is a minor, `!` is a major), updates `CHANGELOG.md`, commits, tags `vX.Y.Z`, pushes, creates the GitHub release with the changelog as its notes, and publishes to npm.
- Pass a version to override the bump, e.g. `npm run release -- 0.1.0`.
- Push, tag and release are confirmed automatically. `npm publish` asks for your 2FA code.
