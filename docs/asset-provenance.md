# Asset provenance and cleanup

September 22, 2026 source review:

- `DMSerifDisplay-Regular.woff2` identifies itself as DM Serif Display Regular,
  version 5.200, Colophon Foundry. Its embedded copyright identifies Adobe and
  Google and its license identifies SIL OFL 1.1. The original upload commit is
  `18dedd1`; its original download location is not established by Git history.
- Added `public/fonts/DMSerifDisplay-OFL.txt` with the embedded copyright and the
  [upstream family notice/license](https://github.com/google/fonts/blob/main/ofl/dmserifdisplay/OFL.txt).
  This restores the missing distribution notice without claiming a reproducible
  binary download history. Poppins already ships with `Poppins-OFL.txt`.
- `HeroCleaningGraphic.astro` had no importers, and its 220×230 image had no other
  references. Both unused files are removed. The current homepage hero remains
  `cleaned-living-room.webp` (1312×1199); no image was enlarged or replaced.
- The build decodes every shipped raster and generates existing AVIF/WebP variants
  without enlarging source images. CI verifies actual image loading and layout.
- All existing Lighthouse budgets are retained. Lab measurements do not establish
  field Core Web Vitals; no additional tracking was introduced.
