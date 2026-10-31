# Reconstruction review

**Not approved. Exact visual parity fails.** Full comparison is recorded in
`out/acceptance/suite.json`; no similarity threshold substitutes for pixel equality.

Preview: http://localhost:3210/AlconostLocalization
Delivery draft: `out/AlconostLocalization/capture-ABVmWe/video.mp4`. Review player: http://localhost:3211.

## Visual evidence

Sampled scene and adjacent transition frames inspected: Headers/cards, caption windows, and CTA entrance; transition diagnostics 391–398.

Corrected: Dashboard translation removed, button fade starts at 388, late supporting-line start corrected.

Still visibly different: Font and fine geometry, per-layer fades/chart behavior, analytic field residuals.

All decoded RGB frames were compared. Native dimensions/FPS/frame counts and
relative PTS pass; every frame still has different pixels. These checks are not
a claim of complete realtime playback or listening review.

## Sound

Brag's licensed music plus Kenney SFX are rebuilt and retimed. The latest user
instruction enables Kokoro narration where reference speech exists, superseding
the earlier no-voice brief. Voice content/timing verification and final auditory
review remain separate. Read `public/generated/alconost-localization/audio-report.json` for
actual technical measurements and the current generated sound status.

## Generated narration pass

Brag's actual Kokoro route generated the reference script with stock `af_heart`.
Speech is on a separate Remotion audio node. Music ducks to 0.13 during
frame-indexed phrases; SFX retain their gain. Final combined meters read
approximately −18 LUFS with true peak below −2 dBTP. Exact 48 kHz sample count checks pass.
Generated-stem ASR was run; pronunciation hints were added for SaaS and Twobase.
ASR still has spelling/homophone/article variants. It is not a listening review,
and no identical speaker/intonation claim is made.

## Current correction pass

`out/AlconostLocalization/capture-ABVmWe/video.mp4`

Nearby utterances share a held music envelope, with smooth dB attack/release and no recovery into the outro fade. Encoded loudness/peak checks pass. Numerical checks are not listening approval.
Red-card shake measured from native frames; local audit before flagged 51–99, after has no active-reference/held-candidate warnings. This diagnoses motion presence only; layout, type, fades and full-frame pixels still differ. The exit at 110–124 is not measured as exact. Final TTS input explicitly says “Alconost dot com”.
