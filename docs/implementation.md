# Voltes V Strike — implementation record

## Approved plan

Build a cinematic Next.js promotional journey using the supplied artwork. The user chose an aircraft-led hero, the five anime pilots, and an honest staged preview with no fabricated APK, captures, version or stats.

1. Foundation: palette, fonts, metadata, typed data, optimized derivative assets.
2. Visual checkpoint: header, hero, mission transition, interactive five-machine showcase. Verify desktop/mobile locally and obtain visual approval before expanding.
3. After that checkpoint: full pilots, gameplay, skills, tactical enemies, Skull Fortress, download and footer sections.
4. Performance, accessibility, motion and cross-browser verification.

Architecture: thin server-composed `app/page.tsx`; `components/layout`, `ui`, `sections`, `effects`; CSS Modules; typed machine and release data. Hero-only image preload, lazy below-fold imagery, reduced-motion support, no Three.js or autoplay.

## Progress

- Baseline: tracked starter files clean; supplied `public/img-assets/` is untracked user content and must be preserved. Baseline lint passed during planning.
- Working on branch `codex/cinematic-flight-briefing`, in the supplied checkout so the untracked source art remains available. No changes made to master.
- Ruling: build the explicit local visual checkpoint before asking for feedback; do not expand the remaining scenes until it is accepted.
- Environment limitation: npm registry requests fail with sandbox EACCES. Superdesign CLI, Motion, font packages and Playwright cannot be downloaded. Do not imply that a canvas draft or Playwright run exists.
- Ruling: use CSS/native browser animation for this checkpoint, with the same timing, depth and reduced-motion behavior. Keep animation code isolated for a later Motion replacement. Use system font fallbacks until licensed Oxanium/Inter files can be bundled.
- Ruling: use the installed Chromium through its DevTools protocol for real-browser verification rather than leaving the preview untested because Playwright is unavailable.
- No public deployment, push or automatic commit is part of this checkpoint.
- Asset preparation: 12 WebP derivatives total approximately 1.4 MB, excluding the social image. Original source images were not changed. Content/release tests passed 4/4 after first failing on missing data modules.
- Browser diagnosis: the starter Tailwind rule renamed all `.module.css` files to plain `.css`, so module imports returned no class mappings. Narrowed the rule to `app/globals.css`; the browser regression first failed with “Display typography was not applied”.
- Chromium's nested sandbox failed to launch its GPU process under the managed Windows token. Browser smoke tests use a fresh isolated profile with `BROWSER_NO_SANDBOX=1`; the outer workspace sandbox remains in effect.
- Independent code review identified mobile document scrolling during machine selection and mobile menu focus skipping its links. Both browser regressions were observed failing before fixes. Selector scrolling now adjusts only the horizontal container; opening navigation focuses its first link and Escape restores the toggle.
- Visual review also increased main body copy to 16px, with larger technical labels and lighter machine-label accents. The 16px typography regression was observed failing before correction.

## Visual checkpoint handoff

- Implemented: responsive header/disclosure navigation; layered aircraft hero; mission/environment transition; five-machine selector with anime pilot, weapon and skill information; compact release/gameplay availability endcap and footer.
- Fresh verification: production build passed; ESLint passed; TypeScript passed; content tests 4/4; Chromium/CDP browser checks 15/15. The browser checks exercise rendered CSS Modules, typography, valid anchors, preview state, selection, rapid switching, keyboard wrap/Home/End, widths 360/390/768/1024/1440, menu focus/Escape, horizontal and vertical touch gestures, offscreen selector controls, failed artwork, reduced motion, no-JavaScript readability and uncaught runtime exceptions.
- Independent read-only review found two Important issues; both were reproduced and fixed with passing browser regressions. No Critical or additional Minor findings remained from that review.
- Browser screenshots/report: ignored `test-results/`. Local production preview: http://localhost:3005.
- Limits: no Playwright, WebKit, Lighthouse or field Core Web Vitals claim. Motion, Superdesign canvas and bundled Oxanium/Inter remain unavailable due blocked package downloads; native motion and system fallbacks are visible in this checkpoint.
- Remaining planned work: after visual approval, add the full pilots, gameplay, skills, tactical enemies and Skull Fortress scenes, then extend the final conversion section. Real gameplay captures, an APK URL and a confirmed version are still needed for release availability.

## Approved interaction enhancement pass

- Preserved the approved hero and machine showcase composition.
- Hero now rotates all five machines on a foreground-visible five-second clock;
  offscreen/hidden states pause it, and reduced motion uses instant image changes.
- Showcase remains manual, with named cyclic controls, directional transitions,
  matching weapon/skill images, ability copy, and short anime pilot descriptions.
- Grid-stacked detail panels reserve the tallest content height at each viewport.
- Production build, lint, TypeScript, 8 content/clock tests, and 23 browser checks pass.
  A further 3-check sweep observed no runtime or console errors during roster changes.
- Fresh desktop/mobile screenshots reviewed and independent code review completed.
  Preview remains http://localhost:3005; no source asset, release availability,
  dependency, commit, push, or deployment changes were introduced by this pass.
- See [enhancement decisions and verification](interaction-enhancements.md).

## Full-body pilot roster

- At the user's request, generated five standing head-to-toe transparent character
  illustrations from the existing anime portraits using built-in imagegen.
- Added the Pilots section directly after Machines, with brief anime introductions,
  machine assignments, a desktop lineup and a native mobile horizontal scroll region.
- Removed repeated pilot descriptions from machine details. Small original portraits
  and names remain and link to the corresponding pilot introduction.
- Source PNGs and optimized WebP assets live in `public/images/pilots/` and are
  included in the existing asset-preparation command; source game art remains intact.
- Build, lint, TypeScript, nine content/clock tests and 25 Chromium checks pass.
  Desktop/mobile screenshots and an independent code review are complete.
- Developed on main; the user requested committing and pushing this completed section.
- See [artwork prompts, sources and verification](pilot-artwork.md).

## Enemy Forces and Skull Fortress

- Added a manual seven-enemy scanner after Pilots using every supplied enemy
  sprite, with direct selectors, named cyclic controls and stable transitions.
- Kept the presentation factual: names and original artwork only, with no
  invented HP, damage or threat ratings.
- Added the Skull Fortress final encounter using the supplied transparent boss
  artwork, restrained red lighting and a one-time reveal that respects reduced
  motion and remains readable without JavaScript.
- Extended the image pipeline with eight optimized WebP assets and retained all
  original source images.
- Build, lint, TypeScript, eleven content/clock tests and thirty-two Chromium checks
  pass. Desktop and mobile screenshots confirm contained artwork and no overflow.
- See [hostile encounter decisions and verification](hostile-encounters.md).
