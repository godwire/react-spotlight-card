# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
While the major version is `0`, the public API may change in a minor release.

## [Unreleased]

## [0.1.1] - 2026-09-12

### Changed

- `homepage` now points at the live playground instead of the GitHub readme,
  so the link on the npm page opens something you can actually try.
- Widened `keywords` for npm search: `spotlight-card`, `glow-card`,
  `hover-card`, `cursor-tracking`.
- Development now runs against React 19. `peerDependencies` is unchanged at
  `>=17.0.0`, so React 17 and 18 remain supported.

### Fixed

- The readme published to npm now carries the screenshot, the badges and the
  demo link. The 0.1.0 page had none of them.

## [0.1.0] - 2026-09-12

First public release.

### Added

- `SpotlightCard`, a cursor-tracking radial glow with an optional glowing
  border, in about 1 kB gzipped with nothing in `dependencies`.
- Props: `spotlightColor`, `spotlightSize`, `borderGlow`,
  `transitionDuration`, `radius`, `leaveBehavior`, `enableTouch`, `disabled`.
- `leaveBehavior` controls what the glow does once the cursor leaves the card:
  hold its position and fade (`fade`), cut out immediately (`instant`), or keep
  following the cursor outside the card (`follow`).
- Every other `<div>` prop is forwarded, and `ref` exposes the outer element,
  so the card can be clickable, labelled or carry data attributes.
- Respects `prefers-reduced-motion`.
- ESM, CJS and TypeScript declarations; `SpotlightCardProps` and
  `LeaveBehavior` are exported.

[Unreleased]: https://github.com/godwire/react-spotlight-card/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/godwire/react-spotlight-card/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/godwire/react-spotlight-card/releases/tag/v0.1.0