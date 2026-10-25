# Voltes V Strike — reference and asset audit

## References

Audited 2026-10-24. These are visual principles, not instructions to reproduce any site.

| Reference | Use | Do not copy |
| --- | --- | --- |
| [DAEMON X MACHINA](https://dxm.marv.jp/) | Image-led world/character/action chapters, oversized machine imagery, dramatic title hierarchy | Exact layouts, typography, red/yellow palette, code, logos or artwork |
| [ARMORED CORE VI](https://www.armoredcore.net/) | Cinematic scale, atmosphere, negative space and restrained supporting copy | Environments, promotional art, branding, page layouts or code |
| [OBSOLETE EXOFRAME](https://project-obsolete.com/exoframe/) | Equipment IDs, technical dossiers, image/specification relationships | Mechanical drawings, wireframe art, specifications, interface framing or code |

OBSOLETE returned HTTP 503 during direct browsing. Its indexed official EXOFRAME content and [archived screenshots](https://www.cssdesignawards.com/sites/anime-obsolete/35885/) informed this audit. Its live scroll behavior was not verified. No reference-site artwork or source code was downloaded for reuse.

## Supplied assets

- 99 files, approximately 138 MB; originals remain untouched under `public/img-assets/`.
- Five usable transparent 1254 × 1254 aircraft sprites. Display name Crewzer maps to the original `VoltCruiser.png` filename.
- Five anime portraits in `voltes character/`, selected by the user instead of the eight portraits in `pilot-cast/`.
- Existing maps are portrait 941 × 1672 environments, not gameplay screenshots. Crop them as backgrounds; never present them as captures.
- `starting.png` and `icon.png` have baked-in titles and combined-robot art. They are not separable parallax layers.
- Images under `old/` include promotional UI mockups. They are not verified gameplay.
- The supplied boss, skills and enemy sprites are reserved for the next phase.
- No APK, verified gameplay captures, confirmed version, or authoritative numerical game stats were found.

## Direction

Aircraft-led flight briefing: large Crewzer over a darkened ocean map, editorial title composition, fine technical labels, restrained gold CTAs. A red environmental transition introduces the mission; the machine showcase becomes a clean technical hangar. Approximate color balance follows the supplied 70/15/5/4/3/3 dark/text/blue/red/gold/cyan guidance.
