# Voltes V Strike

A cinematic promotional site for an unofficial Android arcade action fan project. Built with Next.js 16, React 19, TypeScript and CSS Modules, using the supplied game artwork.

## Local development

~~~sh
npm install
npm run assets:prepare
npm run dev
~~~

Open http://localhost:3000. Source images in public/img-assets/ remain unchanged. The asset command creates smaller WebP copies, an asset manifest and the app icon using Next.js's installed Sharp dependency. Optimized assets are included in the working tree; regenerate only when source artwork changes.

~~~sh
npm test
npm run lint
npm run typecheck
npm run build
~~~

## Visual checkpoint

The first checkpoint includes the header, layered hero, mission transition and five-machine selector. The approved follow-up adds a full-body pilot roster. A small availability section keeps the release/gameplay anchors useful. Full gameplay, skill, enemy and boss scenes remain planned.

Machine/pilot/artwork relationships live in data/machines.ts. Navigation, environments and release state live in data/site.ts. Leave the release in preview until a real APK URL and confirmed version are supplied. The preview has no fabricated stats, gameplay captures, version or GitHub link.

The implementation environment blocks npm registry access. Motion, Superdesign, Playwright and font packages could not be installed. This checkpoint uses CSS animations, scoped pointer/scroll effects, swipe/keyboard controls and system font fallbacks. Browser verification uses an installed Chromium/Edge through its DevTools protocol, with no new dependency:

~~~sh
npm run start -- --port 3000
npm run test:browser
~~~

Screenshots and the browser report go under ignored test-results/. Set BROWSER_PATH to an installed Chromium/Edge executable or BASE_URL to change the preview URL.

Browser checks default to http://localhost:3005; pass BASE_URL=http://localhost:3000 when using the default dev port. In managed Windows sandboxes where Chromium cannot start its nested GPU sandbox, the isolated test profile supports BROWSER_NO_SANDBOX=1. Set NEXT_PUBLIC_SITE_URL to the actual site origin before public hosting; its local default is http://localhost:3000.

See [reference audit](docs/research.md) and [implementation record](docs/implementation.md).

## Machine interaction enhancements

The hero cycles through all five machines every five seconds while visible in a
foreground tab. Scrolling away or hiding the tab pauses the remaining countdown.
Reduced motion keeps the five-second image changes but disables their animation.

Choose Your Machine stays entirely manual. Its tabs, swipes, keyboard controls,
and named Previous/Next buttons update the machine, primary weapon sprite,
special ability artwork and description, and compact pilot identity together.
Details reserve enough height for every machine to prevent selection layout jumps.

The test suite includes content mapping and deterministic rotation-clock tests.
Browser checks explicitly test both normal and reduced motion, independent of the
host operating system's preference. See [enhancement notes](docs/interaction-enhancements.md).

## Pilot roster

The five pilots appear below the machine showcase with generated head-to-toe,
transparent-background artwork and short introductions to their anime roles.
The machine panel keeps the original small portrait and name, linking to the
corresponding introduction instead of repeating its biography.

The roster shows all five figures on large screens and uses a focusable horizontal
scroll region on smaller screens. Source PNGs and optimized WebP images are saved
under `public/images/pilots/`; `npm run assets:prepare` regenerates the derivatives.
See [artwork references, prompts and verification](docs/pilot-artwork.md).
