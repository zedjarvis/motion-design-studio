# Motion Design Studio

## Purpose

This workspace is a motion design studio for creating animated films, product
promos, explainers, kinetic typography, and social clips. Treat each production
as an editable creative project. A studio website or management app is a separate
deliverable and should only be built when requested.

The shared engine uses Remotion, TypeScript, React, Chrome frame capture, and
FFmpeg. Read `README.md` for commands and `docs/IMPLEMENTATION.md` for the current
implementation and acceptance status. Four supplied artworks are benchmark
targets; the Remotion guide video is inspiration. No recreation has passed yet.

## Project organization

- Keep individual productions in `projects/<short-descriptive-slug>/`.
- Give each production its own source, assets, brief, and frame-indexed audio cues.
- Keep shared registration and components under `studio/`. Register substantial
  productions as separate authored `<Composition>` nodes in `studio/Root.tsx`.
- Serve local media through `public/` and `staticFile()`. Keep source assets in
  the project and record their provenance before copying them into `public/`.
- Keep generated previews, snapshots, and exports separate from source assets.
- Introduce shared templates or components when there is a real reuse case.
- Preserve existing work and user edits. Avoid unrelated rewrites or deleting
  source material to clean up generated output.

## Starting a production

1. Read `skills/motion-studio/SKILL.md` and the relevant installed Remotion skills:
   `remotion-best-practices`, `remotion-create`, `remotion-markup`,
   `remotion-interactivity`, `remotion-studio`, and `remotion-render`. Inspect
   Brag's repo-evidence and sound-selection guidance when relevant; its
   HyperFrames implementation is not the renderer for this studio.
2. Establish the message, audience, deliverable, approximate duration, aspect
   ratio, and visual direction from the request and supplied references. Make
   reasonable assumptions when details are optional; ask only when missing
   information materially changes the result.
3. Use Remotion by default, as requested by the user. Reuse the shared engine;
   avoid reinstalling a renderer for every production.
4. Default new films to 1920 × 1080 at 30 fps unless the brief calls for a different
   format. Benchmark reconstructions preserve the reference's native dimensions,
   frame rate, and frame count. Keep timing and dimensions explicit.
5. Record the brief and, when useful, shot timings and measurable design choices
   in the production's `SPEC.md`. Follow the skill's story workflow for longer films.

Do not install a web application stack just to author a video. Pin dependencies
when adding them and keep the resulting lockfile.

### Local visual skills

For original launch/release films, feature guides and social pain-point clips,
read `skills/motion-studio/references/product-formats.md`. Local capability skills
are `skills/motion-p5-brush`, `skills/motion-p5`, `skills/motion-thinking-orbs`,
`skills/motion-roughjs`, `skills/motion-animejs`, `skills/motion-pixijs`, and
`skills/motion-cursors` for demo cursor/click feedback.
Read their `SKILL.md` only when that technique serves the film. Remotion owns
the frame clock; the libraries provide drawing or choreography.

## Creative direction

- Give every piece a clear idea, visual hierarchy, and intentional beginning and end.
- Use typography, spacing, composition, color, and pacing consistently within a film.
- Animate to communicate: entrances establish focus, transitions connect scenes,
  and holds give viewers time to read. Avoid decorating every element with motion.
- Use the Remotion skills for typography, transitions, effects, and 3D.
- Use real product screens and brand assets when available. Keep factual claims
  grounded in the supplied material.
- Keep key text readable and within safe areas. Check the intended viewing size.
- Use sound according to the brief and media skill; do not add narration or captions
  without a reason in the request or source.
- The latest brief enables voiceover using Brag's `--voice` path: local Kokoro
  synthesis, reference narration wording/timing, a separate voice track, and
  music ducking. Keep silent references free of invented narration. Follow
  Brag's licensed music/SFX cue workflow; library selection is not AI-generated audio.
- Preserve asset provenance and any license or attribution requirements.

## Product guide fidelity

- Feature/demo guides show the actual product UI, using the running app or its
  real components with original styles and layout. An invented or simplified
  source-backed UI does not pass, even if the business sequence is plausible.
- Prefer isolated fictional demo data and real product handlers. Record build,
  route, viewport/DPR, compiled assets, source hashes and captured-state provenance.
- Keep film instructions outside the product viewport. Derive cursor/highlight
  coordinates from actual DOM bounds. Preserve real navigation, tabs, dialogs,
  labels and post-action states; inspect them rather than inferring them.
- Require native UI evidence and selected unobscured RGB equality checks through
  `npm run test:productions`, alongside visual review and normal export checks.
  Follow `skills/motion-studio/references/native-ui.md`. If the actual UI cannot
  be captured or mounted, resolve access/runtime issues; do not invent a fallback.

## Animation implementation

- Make output deterministic and seekable: a given timeline time must produce the
  same frame. Avoid wall-clock time, unseeded randomness, and network dependencies
  during rendering.
- Drive animation with `useCurrentFrame()` and `interpolate()` or `spring()`.
  Use named `Sequence` or supported interactive boundaries for editable scenes.
  Do not use CSS transitions, autonomous animation loops, or `useFrame()` in 3D.
- Separate the scene hosts from scene internals and keep copy, colors, and media
  easy to edit through supported variables.
- Keep assets local to the production and use the path conventions required by
  the renderer. Declare non-bundled fonts explicitly.
- Prefer transform animation. Avoid CSS and animation code competing over the
  same transform, and follow the skill's media playback rules.

## Review and delivery

- Check tool availability before claiming a command can run. Use the installed
  skill and CLI help for current flags; report blockers plainly.
- Inspect existing source and user edits before editing. Run `npm run typecheck`
  for source changes and `npm test` when changing the engine or acceptance tools.
- Use `npm run render -- <CompositionId>` for Chrome PNG capture and MP4 encoding.
  Use `CHROME_PATH` for a different local Chrome/Chromium executable.
- Generate and inspect snapshots of every scene and relevant transition. Check
  text clipping, contrast, asset loading, timing, framing, and final-frame behavior.
- Review the full video and record findings in its `REVIEW.md`. Do not claim a
  visual or listening review when only metadata or numerical checks ran.
- Provide a working preview. Render when requested or authorized by the existing
  brief, following the skill's preview and export workflow.
- Verify exports are non-empty, have the intended dimensions, frame rate and
  duration, and inspect decoded frames. Review audio when present.
- Finish with links to the project, preview, or export and a concise account of
  what was verified and any remaining limitations. Never claim a render or visual
  check succeeded without inspecting its result.

## Reconstruction acceptance

- Follow `docs/EXACT_RECONSTRUCTION.md` for exact requests. Inventory secondary
  motion, inspect adjacent frames through each effect, and review thin elements
  at native and preview sizes. Use local motion diagnostics to expose omissions.
- Keep `frame-checks.csv` and the current export's comparison report. Exact
  acceptance requires actual RGB byte equality and rational relative PTS equality
  for every frame, with no pixel or timing tolerance. Hashes are audit records.
- The user requires 1:1 artwork parity, with new sound design. Similar-looking
  drafts, average SSIM, or successful encoding do not satisfy that requirement.
- Keep originals and extracted reference frames outside `public/` and production
  imports. Replaying a reference video or frame sequence does not count as a rebuild.
- `references/manifest.json` records the only approved crop: the Alight video's
  upper Original artwork panel. Container time origins are removed once; no
  searching for an offset, retiming, scaling, or dropping mismatched tail frames.
- Compare every decoded RGB frame of the lossless `master.rgb.mp4` with
  `npm run compare -- <project-id> <master-path>`. All four must pass `npm run parity`.
- Sound is rebuilt from local licensed assets using frame-indexed cue plans.
  Final synchronization and listening review are separate acceptance checks.
- Never lower the parity gate or label unfinished productions complete to work
  around missing assets or an environment that cannot launch a browser.

For workspace documentation changes, review the changed files; video rendering
and application tests are unnecessary.
