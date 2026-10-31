# Motion Design Studio

[![CI](https://github.com/zedjarvis/motion-design-studio/actions/workflows/ci.yml/badge.svg)](https://github.com/zedjarvis/motion-design-studio/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An editable **Remotion + React + TypeScript** studio for product launch films,
feature guides, social clips and motion artwork. Chrome captures individual
frames; FFmpeg creates playback MP4s and lossless RGB masters. Reusable agent
skills connect repository evidence, storytelling, graphics, cursors and sound.

This is a video-authoring workspace, not a hosted rendering service. An agent
inspects a product repo, authors a production and reviews its output. No
reference images or videos are required for original films.

## Quick start

Requirements: **Node.js 24+**, **Python 3.11+**, **FFmpeg/ffprobe**, **ripgrep (`rg`)**,
and a local Chrome/Chromium executable. Linux is the tested render environment.
On Ubuntu, install the media/repo tools with `sudo apt-get install ffmpeg ripgrep`.

```bash
git clone https://github.com/zedjarvis/motion-design-studio.git
cd motion-design-studio
npx --yes pnpm@11.22.0 install --frozen-lockfile --ignore-scripts
npm run studio
```

Open **http://localhost:3210/CursorProbe**. `GraphicsCapabilities` shows the six
graphics integrations; `EngineCheck` is a minimal capture diagnostic. These
compositions work without the optional product screenshots or reference videos.

The default Chrome path is `/usr/bin/google-chrome`. Override it when needed:

```bash
CHROME_PATH=/path/to/chromium npm run studio
CHROME_PATH=/path/to/chromium npm run render -- CursorProbe
```

Render outputs appear in a unique `out/<Composition>/capture-*/` directory:

- `video.mp4` — shareable H.264 delivery.
- `master.rgb.mp4` — lossless RGB picture for exact comparisons.
- `frames/` — captured PNGs.
- `receipt.json` — source, lockfile, browser, frame and export provenance.

A render also recaptures first/middle/last frames out of order in a fresh browser
and compares decoded pixels. This is a sampled determinism check, not proof that
every frame was independently repeated.

## Three production workflows

| Film | Workflow | Example source |
| --- | --- | --- |
| Launch / release | Repo evidence → hook → actual product → supported benefit → CTA | [Product brag](projects/schoolbooks-product-brag/SPEC.md) |
| Feature guide | Actual app → real controls and states → confirmed result | [Feature guide](projects/schoolbooks-feature-guide/SPEC.md) |
| Social pain point | Inferred pain → implemented feature → bounded outcome → CTA | [Portrait social](projects/schoolbooks-fee-followup-social/SPEC.md) |

A release video needs a release diff/tag range before making newly-shipped
claims. A social pain point inferred from code is not customer research or a
measured saving. Feature guides show **the actual UI**, with original typography,
layout, labels and states. A recreated panel does not satisfy that workflow.

```bash
npm run inspect:repo -- /path/to/product --out projects/my-film/evidence.json
```

Then author `projects/my-film/src/Video.tsx`, a brief, local assets/provenance,
frame-indexed sound cues and a review. Register an explicit composition in
[studio/Root.tsx](studio/Root.tsx). The [motion-studio skill](skills/motion-studio/SKILL.md)
explains the full workflow.

The Schoolbooks/Haft examples and four benchmark drafts retain editable source.
Their product imagery, downloaded references, captured private repo excerpts,
voice outputs and completed exports are **local-only**, not part of this public
repository. Restore assets you have rights to use before rendering those films.
The self-contained diagnostics above are the supported fresh-clone examples.
See [assets and licensing](docs/ASSETS.md).

## Reusable skills and graphics

Install the repo-owned skills for discovery from other Codex projects:

```bash
node scripts/install-motion-skills.mjs             # inspect the plan
node scripts/install-motion-skills.mjs --install   # preserve existing skills
```

| Skill | Purpose |
| --- | --- |
| [motion-studio](skills/motion-studio/SKILL.md) | Repo inspection, the three story formats, Remotion, sound and review |
| [motion-p5-brush](skills/motion-p5-brush/SKILL.md) | Seeded painted marks, watercolor and hatching |
| [motion-p5](skills/motion-p5/SKILL.md) | Procedural drawing, curves, noise and WebGL |
| [motion-thinking-orbs](skills/motion-thinking-orbs/SKILL.md) | Seekable dotted agent-state visuals |
| [motion-roughjs](skills/motion-roughjs/SKILL.md) | Stable sketched annotations and diagrams |
| [motion-animejs](skills/motion-animejs/SKILL.md) | Paused, explicitly seeked choreography |
| [motion-pixijs](skills/motion-pixijs/SKILL.md) | Retained GPU graphics and record flows |
| [motion-cursors](skills/motion-cursors/SKILL.md) | Anchored arrow/hand/touch glyphs and synchronized click feedback |

Read the [official-source graphics study](docs/research/GRAPHICS.md),
[cursor image references](docs/research/cursors/RESEARCH.md) and
[shared frame contract](skills/motion-studio/references/canvas-contract.md).
Documented library capabilities are distinguished from features actually tested.
All motion uses the video frame, fixed dimensions, local assets and seeded data.

## Tests and coverage

```bash
npm run typecheck
npm test                       # Python acceptance/audio/inspection regressions
npm run test:unit               # Node logic and native UI pixel-gate tests
npm run test:browser            # graphics/cursor browser checks + two full renders
npm run audit:release          # prevent private/local files entering publication
```

For Python branch coverage, use an isolated environment:

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r scripts/test-requirements.txt
.venv/bin/python -m coverage run -m unittest discover -s tests -p '*_test.py'
.venv/bin/python -m coverage report
```

`npm run test:coverage` measures the deterministic Node modules. CI runs type
checks, Python branch coverage, Node coverage, browser reverse seeking, seeded
brush repeatability and actual Chrome → PNG → MP4/RGB renders. See
[testing scope and acceptance](docs/TESTING.md) for thresholds, failure cases and
which optional workflows require external assets. Numeric coverage does not
replace scene, transition or listening review.

## Sound and actual product capture

Licensed music/SFX are selected locally and placed at integer frames. Original
scripts can use Brag's optional local Kokoro route via `hyperframes tts`; the
video renderer remains Remotion. Voice, bed and combined mix stay separate.
Ducking holds through short phrase gaps, and output loudness/duration are checked.
Install/configure the optional HyperFrames TTS helper before voice generation.
No paid voice provider or speaker cloning is configured.

```bash
npm run voice -- my-film
npm run audio -- my-film
```

Product source paths belong in environment variables or ignored local config,
not published evidence. For the optional native Schoolbooks capture, run its
own frontend build on port 3214 and set the repository location:

```bash
SCHOOLBOOKS_REPO=/path/to/schoolbooks npm run capture:guide
```

[Native UI guidance](skills/motion-studio/references/native-ui.md) explains real
handlers, isolated fictional API fixtures, actual DOM targets and native pixel
checks. `npm run test:productions` and `npm run test:playback` verify restored,
rendered production cases. `npm run productions` serves their local review player.

## Exact reference reconstruction

The four local artwork benchmarks remain **unaccepted: 0/4**. Source differences
in geometry, type, textures and materials remain. Successful encoding, average
SSIM or a similar-looking draft cannot pass the exact gate.

```bash
npm run compare -- <project-id> /path/to/master.rgb.mp4
npm run parity
```

Acceptance compares every decoded RGB byte and every rational relative PTS,
with no pixel/timing tolerance. Missing tails fail. The sole approved crop is
recorded in [references/manifest.json](references/manifest.json). Original media
is not redistributed; missing originals cannot yield a parity pass. Reference
hashes still guard against copying originals into production assets even when
the originals are absent from a fresh clone.

See [exact reconstruction](docs/EXACT_RECONSTRUCTION.md) and
[implementation status](docs/IMPLEMENTATION.md). Listening approval remains
separate from audio measurements and muted playback.

## License

Original studio code, authored diagnostic art and repo-owned skills use the
[MIT License](LICENSE). Dependencies and licensed media retain their own terms;
see [THIRD_PARTY_NOTICES.txt](THIRD_PARTY_NOTICES.txt) and [docs/ASSETS.md](docs/ASSETS.md).
Remotion's [license terms](https://www.remotion.dev/docs/license) apply separately
and may require a commercial license. This repository does not grant rights to
third-party brands, product screenshots or downloaded reference artworks.

Contributions: [CONTRIBUTING.md](CONTRIBUTING.md).
