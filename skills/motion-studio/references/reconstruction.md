# Reference reconstruction

Read `references/manifest.json`, `analysis/inventory.json`, the project's
`SPEC.md` and any previous reports. Do not change a crop, time origin or
acceptance threshold to improve a score. If artwork boundaries are ambiguous,
record the interpretation and clarify when it matters.

```bash
npm run inspect -- --sheets
npm run extract:frames -- --project minimalist-priceless
```

Each extraction has its own directory under `analysis/frames/` and an index
mapping decoded frame numbers to source timestamps and hashes. Inspect every
scene, cut and motion segment. Fit settled typography, geometry and colors
before fitting transforms, acceleration, masks, camera motion and blur. Sampled
contact sheets establish a first breakdown; they do not determine exact cuts.
Read `docs/EXACT_RECONSTRUCTION.md` in the engine. Inventory secondary motion and
unmeasured ranges; inspect adjacent frames, not only settled poses. Use
`npm run audit:motion -- <project> <master>` to expose held layers where the
reference moves. These diagnostics never confer acceptance.

Keep source components in `projects/<slug>/src/` and use separate authored scene
nodes. Obtain or recover static assets and keep their provenance. Missing native
fonts, textures or models are unresolved inputs; arbitrary substitutes cannot
be called 1:1. Keep reference frames out of production imports and `public/`.
Replaying or encoding a reference sequence into code is not an editable rebuild.

The headless engine renders authored scenes at integer frame indices, repeats
sampled frames in a fresh browser, keeps PNGs and produces an RGB lossless MP4
master plus a standard playback MP4. Compare the master:

```bash
npm run compare -- minimalist-priceless /path/to/master.rgb.mp4
```

Every decoded pixel and frame must match; dimensions, FPS and relative PTS must
match too. The gate compares actual RGB bytes and exact rational times; its
SHA-256 values are audit identifiers. Review the per-frame `frame-checks.csv`,
including tails and failed frame ranges. The first timestamp is subtracted once. No time warp,
resizing, offset search or dropped tail is permitted. SSIM/worst-frame triptychs
help locate failures but never confer acceptance. Fix source and rerun.

When each target is genuinely implemented, add its master path to
`references/candidates.json`. `npm run parity` requires all four. Sound is new
by request; finish its sync and listening review separately. If exact parity
remains unattained, report that result and the concrete mismatches rather than
lowering the gate or presenting a draft as complete.
