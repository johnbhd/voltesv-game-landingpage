# Hostile encounters implementation record

## Approved design

Add an interactive Hostile Database after Pilots, followed by a cinematic Skull
Fortress reveal and the existing release section. Preserve the approved page.
Use all seven supplied enemy sprites and the supplied fortress artwork. Start
on Scout Drone; selection is manual and previous/next navigation wraps.

Desktop uses large artwork beside a compact numbered selector. Mobile uses a
centered image followed by horizontally scrolling thumbnails. Use 350ms selection
transitions, reserved layout space, accessible buttons and a polite selection
announcement. The boss reveals once over approximately 900ms, with restrained
red lighting. Reduced motion and no JavaScript keep content visible.

No new dependencies, generated artwork, unverified statistics or release claims.
Extend the existing image pipeline and Chromium checks. Review desktop/mobile.

## Tasks

- [x] Typed hostile content and optimized transparent assets.
- [x] Manual scanner, cinematic boss, page order and Hostiles navigation anchor.
- [x] Browser, build, lint, TypeScript and content verification.

## Decisions and evidence

- Baseline: clean main tracking origin/main; nine existing tests pass.
- Ruling: work in the existing checkout on main, following the user's earlier
  explicit branch preference. This pass does not require a commit or push.
- Ruling: reuse Artwork metadata and CSS/native motion; there are no authoritative
  game statistics. Variant 02 is an editorial label for the second scout sprite.
- Ruling: retain misspelled source filenames while normalizing display names.
- Interfaces: hostile content supplies Artwork to the asset pipeline and both
  sections. Scanner state is independent of hero and machine state.
- Next.js: read the installed next/image guide before implementation.
- Verification: production build, ESLint and TypeScript pass; eleven content and
  clock tests pass; thirty-two Chromium checks pass without console errors. The new
  checks cover all selectors, idle state, wrapping, keyboard input, rapid changes,
  layout stability, mobile scrolling, image fallback, boss containment, reduced
  motion, disabled JavaScript and boss artwork failure.
- Final review found a missing boss artwork fallback and a reveal assertion that
  inspected the inner content instead of its animated wrapper. Both were corrected
  and verified with focused failing-then-passing browser checks before the full run.

## Full-silhouette correction

- Renamed the visible section from Hostile Database to Enemy Forces and aligned
  the header link with the shorter Enemies label.
- Changed the enemy artwork stack to participate in responsive layout while
  keeping every sprite layered in the same grid cell with safe internal padding.
- Changed the boss artwork from absolute positioning to normal flow, preserving
  the cinematic overlap through margins and leaving a clear boundary before the
  release section.
- Browser geometry checks cover every enemy and the boss at 360, 390, 768, 1024
  and 1440 pixels, including complete silhouettes, safe padding and section bounds.
