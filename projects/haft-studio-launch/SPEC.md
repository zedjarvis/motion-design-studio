# Haft Studio — original film from repository code

Purpose: demonstrate repo-only film authoring independently of the reconstruction
benchmark. Audience: architects, interior designers and prospective furniture
clients. Deliverable: 15 s, 1920 × 1080, 30 fps, 450 frames.

Inputs: adjacent `../haftstudio-website`, inspected read-only with the shared
inspector and direct source reads. `evidence.json` records grounded excerpts.
No supplied motion-video reference or reference frames were used. No inspected
repo scripts ran and no inspected files were modified.

## Source evidence

- `src/components/Homepage/AboutSection.vue`: timber, stone and papyrus reeds;
  African aesthetic. The film adapts this to “African material heritage.”
- `src/pages/products.vue`: Nairobi production, contemporary proportions,
  residential/hospitality/commercial use; actual product names and image imports.
- `src/components/Homepage/HeroSection.vue`: the original interior photography.
- `src/components/TheLogo.vue`: actual logo asset.
- `src/plugins/vuetify.ts`: brand brown #8B4513 and background #e5e7eb.
- `src/assets/styles/fonts.scss`: local Pacifico font. Its OFL is included.
- `src/composables/usePageSeo.ts`: canonical site haftstudio.ke; /products exists.

## Story and motion

| Frames | Scene | Direction |
| --- | --- | --- |
| 0–104 | African material heritage / contemporary proportions | Interior image, slow camera drift, readable type hold |
| 105–194 | Timber / stone / papyrus; Nairobi | Material photo and staggered type; panel wipe overlaps opening |
| 195–329 | Neva Chair / Invito Table / Neva Lounge | Actual product assets, restrained entry and image movement |
| 330–449 | For the spaces you shape / explore the collection | Interior photo, brand mark, collection URL and held ending |

The film is an authored promotional composition, not a recorded interactive web
session. Copy remains grounded in source; no prices, customer metrics or
functional claims were invented. Asset hashes and original paths are in
`assets/PROVENANCE.json`. Photography rights remain with original owners.
Sound: one licensed Brag library bed with restrained slide accents, plus an
original four-part narration written from this repo’s materials, origin and
product story. `SCRIPT.md` is original copy; no reference narration is reused.
Local Kokoro `af_heart` delivers it naturally, and music ducks underneath.
