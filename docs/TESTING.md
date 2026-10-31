# Tests, coverage and acceptance

Use Node 24+, Python 3.11+, FFmpeg/ffprobe and Chrome. Dependencies are pinned in
pnpm-lock.yaml; coverage.py is pinned in scripts/test-requirements.txt.

## Unit and regression tests

```bash
npm run typecheck
npm test
npm run test:unit
npm run test:coverage
npm run audit:release
```

Python tests use synthetic media and isolated temporary directories. They cover
actual RGB byte comparisons, rational presentation times, a one-channel change
in the last frame, missing tails, crop bounds, independently encoded equality,
black equality diagnostics, hash collisions, required capture receipts, parent
receipt validation, real inventory/contact-sheet output and CLI reports.
Audio tests check rational frame/sample conversion, rejected source/gain/cue
inputs, exact mix duration, loudness, separate stem reconstruction and held
music ducking across short speech gaps. TTS is stubbed for its unit test: this
checks natural pacing and padding without claiming a real-model listening test.

The Node suite covers external repo config precedence/errors, reference-input
hash guards when originals are absent, source-reference playback rejection,
release boundaries, cursor fade/press/pulse math and actual lossless native UI
pixel comparisons. A one-channel change, missing UI evidence or resized UI fails.
The native UI unit fixture is synthetic and does not impersonate product capture.

## Measured coverage

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r scripts/test-requirements.txt
.venv/bin/python -m coverage run -m unittest discover -s tests -p '*_test.py'
.venv/bin/python -m coverage report
.venv/bin/python -m coverage json
.venv/bin/python -m coverage html
npm run test:coverage
```

Python coverage includes compare.py, parity-suite.py, references.py, audio.py and
voiceover.py, with branch measurement and an **85% combined floor**. The current
local run is **28 tests / 88.55%**. Model-dependent transcription and geometric
research scripts are outside this unit-coverage scope.

Node coverage includes local-config.mjs, render-inputs.mjs, release-audit.mjs,
verify-native-ui.mjs and studio/cursor/motion.ts. Gates are **90% lines, 90%
branches and 95% functions**. The current local run is **94.44% lines / 97.65%
branches / 100% functions**. Browser-rendered React/WebGL code is evaluated by
pixel/behavior checks rather than included in those Node percentages.

These percentages describe the named modules, not the whole repository. Do not
exclude hard-to-test branches merely to increase a number; add meaningful cases
or explain why a separate integration check is needed.

## Actual browser and render integration

```bash
npm run test:browser
```

The runner builds seeded p5.brush art, starts Studio if needed, and stops only a
Studio process it owns. An already running Studio is reused. Set TEST_STUDIO_PORT=3310 to test a
separate checkout without reusing the workspace on port 3210. It then runs:

- All nine Thinking Orbs geometry modes at 20/32/64 sizes.
- Actual p5, Orbs and Pixi canvases: visible pixels, time response and byte equality
  after backward seeking.
- Rough.js seed stability and Anime.js arbitrary-time seek behavior.
- Actual cursor SVG hotspot projection through press/tilt, visible click feedback,
  reverse-seek RGB equality and click-plan/SFX agreement.
- Complete EngineCheck and CursorProbe renders, including fresh-browser sampled
  determinism, PNG capture, H.264/RGB encodes and decoded metadata verification.

No private product repository, benchmark download or AI provider is required.
The public CI runs this workflow on Ubuntu 24.04 and preserves compact verification
reports/receipts and coverage artifacts. It does not claim subjective visual or
listening approval merely from completion.

## Optional production and reconstruction acceptance

The three Schoolbooks workflows require their actual source repository, local
product captures and generated sound. Set SCHOOLBOOKS_REPO (or ignored local
config), restore assets you have rights to use, render and run:

```bash
npm run test:productions
npm run productions
npm run test:playback
```

The production verifier requires successful frozen render receipts, current
code and imported JSON/media hashes, exact intended frame counts/dimensions/rate,
valid voice/cue windows and encoded audio levels. Feature guides additionally
require actual-app provenance and exact RGB equality in selected unobscured
native UI regions. Full muted playback verifies the files play to their end;
it is not an auditory review or backend transaction test.

The four original reconstruction targets remain **0/4 accepted**. Their strict
suite compares every decoded RGB byte and rational relative PTS. Unit fixtures
passing does not change that status. No similarity tolerance is substituted.
Reference hashes in the manifest are input-copy guards, not pixel acceptance.
The original files and reconstructed exports remain local-only.

For visible work inspect native/preview scene holds, adjacent transitions,
thin strokes, cursor geometry, clipping and final-frame behavior. Listen to audio
when present. Record the actual review scope in each production's REVIEW.md.
