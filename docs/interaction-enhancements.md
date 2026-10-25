# Hero rotation and machine details enhancement

Approved scope: preserve the checkpoint; add independent five-second hero rotation,
manual named showcase navigation, weapon and skill artwork, and concise descriptions.

## Decisions and progress

- Work in the existing feature checkout: the checkpoint and original artwork are uncommitted here.
- Keep native CSS motion, system fonts, and existing dependencies.
- Reduced motion keeps hero rotation on its five-second clock, using instant image
  changes without fade, slide, or scale (revised at the user's explicit request).
- Pause the five-second clock offscreen or in a hidden tab; preserve remaining foreground time.
- Hero transitions: 600ms, 20px. Manual transitions: 360ms, 30px, reversed backward.
- Use the existing five skill icons and corresponding primary projectile sprites.
- Keep showcase and hero state independent; the existing showcase timer only cleans outgoing art.
- Preserve release preview state; do not add unverified numerical stats.

## Verification ledger

- Added content mapping and rotation lifecycle tests before implementation.
- Confirmed content tests fail on missing primary weapon data, then all 8 content/clock tests pass.
- Generated 22 derivatives including ten supporting sprites; originals remain unchanged.
- Browser regressions detected missing artwork panels and unnamed arrow controls before UI changes.
- Initial browser run: 18/21 passed. Diagnostics showed host reduced motion enabled by default;
  tests now explicitly select normal motion and separately test reduced motion.
- Native Enter/Space CDP events require text/character payloads; complete events pass.
- Focused hero roster, offscreen/hidden pause, and keyboard control checks: 3/3 passed.
- Independent review found destination names missing from accessible navigation labels.
  Regression reproduced before updating labels to include each destination machine.
- Pilot copy uses existing machine assignments and broad character roles, informed by
  the [official character profiles](https://voltes-v-legacy.jp/character/).
- Final production build, ESLint, TypeScript, and 8/8 content/rotation tests passed.
- Full Chromium suite: 23/23 passed, including normal/reduced motion, five-machine
  rotation, independent manual selection, timing pauses, cyclic named controls,
  keyboard/swipe interaction, all sprite mappings, missing image fallbacks, stable
  layouts at five viewport widths, and no-JavaScript readability.
- Additional console-error sweep: 3/3 passed while the hero completed its full roster
  and every machine detail was selected. No uncaught runtime or console errors.
- Fresh desktop/mobile detail screenshots inspected; preview responds HTTP 200 at
  http://localhost:3005. Build and image-cache operations use the normal account
  because the sandbox account cannot update older generated files.
- Independent final review and accessibility-fix recheck: no unresolved findings.
- Work remains uncommitted on the existing feature branch; no push or deployment.

## Reduced-motion rotation revision

- The user requested five-second image changes even when reduced motion is enabled.
- Reproduced both failures before the fix: initial reduced-motion load stayed on
  Crewzer, and enabling reduced motion during rotation held Bomber.
- The visibility clock now runs independently of motion preference. Reduced motion
  skips outgoing artwork and all animated transitions; normal motion keeps its
  existing cinematic transition. Offscreen and hidden-tab pauses are preserved.
- Browser checks assert the actual image source as well as the active machine,
  zero running animations, and disabled parallax under reduced motion.
- Browser-profile extension files created during diagnosis exposed a missing lint
  exclusion. ESLint now ignores generated `.cache/` and `test-results/` artifacts.
- Fresh build, lint, TypeScript, and all eight content/clock tests passed.
- Independent focused review found no issues with the revised timing or cleanup.
- Final full browser verification: 23/23 passed, including both initial and runtime
  reduced-motion image changes, hidden/offscreen pauses, and no runtime/console errors.
- Updated production preview is serving HTTP 200 at http://localhost:3005.
