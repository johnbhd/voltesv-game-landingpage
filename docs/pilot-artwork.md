# Full-body pilot artwork

## Scope

The user requested separate, standing head-to-toe illustrations with no background,
brief introductions to the anime characters, and removal of repeated pilot biographies
from Choose Your Machine. Existing portrait/name assignments remain in the machine
showcase and link to the corresponding profile below it.

The new section follows Machines, uses the current typography and navy palette, and
presents five figures on desktop with native horizontal scrolling on smaller screens.
It reuses the existing machine/pilot data rather than maintaining a second roster.

## Generation and assets

Generated with the built-in imagegen tool using the existing portraits in
`public/img-assets/voltes character/` as identity and uniform references.
Original portraits were preserved. These are website-specific fan illustrations.

- Source PNGs: `public/images/pilots/<name>-full-body.png`, 1024 × 1536, with alpha.
- Served WebP files: the same directory and names, at 800 × 1200.
- Names: `steve`, `mark`, `bigbert`, `littlejohn`, `jamie`.
- Regenerate WebP files using `npm run assets:prepare`.

## Prompt set

Shared direction: one isolated full-body standing anime pilot, completely visible
from hair to both boot soles, transparent background and margins, crisp ink outlines
and cel shading matching the portrait, no environment, floor, halo, text or watermark.
Preserve the face, hair, chest insignia and uniform palette. Relaxed upright stance,
hands visible, white belt/gloves/boots, no helmet or weapon.

- Steve: dark spiky hair, red uniform, gold V outlined in white; athletic build.
  A targeted follow-up requested removal of any surrounding haze while preserving him.
- Mark: shoulder-length brown hair, blue uniform, gold V outlined in white; slim build.
- Big Bert: short black hair, thick eyebrows and cheek marks, dark green uniform,
  red V outlined in white; broad, sturdy build.
- Little John: boyish face, brown hair, green uniform and orange V; child proportions.
- Jamie: dark ponytail and pink ribbon, pink uniform with yellow vest and red/white V;
  practical fully covered pilot outfit.

## Anime introductions

Brief original summaries use the established English character names and assignments.
Anime roles were checked against the [Voltes V character summaries](https://en.wikipedia.org/wiki/Voltes_V#Voltes_Team).
They cover Steve’s leadership, Mark’s rodeo background, Big Bert’s martial arts,
Little John’s inventiveness, and Jamie’s ninja training without long biographies.

## Verification

- New asset and section checks failed against the previous checkpoint before changes.
- All nine content/rotation tests pass, including alpha checks for all five PNG/WebP pairs.
- Build, ESLint and TypeScript pass. The full Chromium suite passes 25/25 checks,
  including biography placement, all five full-body images, keyboard scrolling,
  mobile overflow, existing machine controls, hero rotation and reduced motion.
- Desktop and mobile screenshots inspected. The PNG/WebP assets render without a
  background on the actual page; Little John uses a smaller scale in the lineup.
- Independent read-only review found no issues. Preview: http://localhost:3005/#pilots.
- The user requested committing and pushing the completed pilot roster to main.
