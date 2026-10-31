# Reconstruction review

**Not approved. Exact visual parity fails.** Full comparison is recorded in
`out/acceptance/suite.json`; no similarity threshold substitutes for pixel equality.

Preview: http://localhost:3210/GlassyPhone
Delivery draft: `out/GlassyPhone/sound-8ddprn/video.mp4`. Review player: http://localhost:3211.

## Visual evidence

Sampled scene and adjacent transition frames inspected: Poses 24/72/120/144/192/240/264/312/336; notification 48–120; worst transition 57–64.

Corrected: Pose join continuity, delayed clock, notification card turn, pinned software GL.

Still visibly different: Large launcher trajectory mismatch, wallpaper, native 3D optics/camera, map and exact assets.

All decoded RGB frames were compared. Native dimensions/FPS/frame counts and
relative PTS pass; every frame still has different pixels. These checks are not
a claim of complete realtime playback or listening review.

## Sound

Brag's licensed music plus Kenney SFX are rebuilt and retimed. The latest user
instruction enables Kokoro narration where reference speech exists, superseding
the earlier no-voice brief. Voice content/timing verification and final auditory
review remain separate. Read `public/generated/glassy-phone/audio-report.json` for
actual technical measurements and the current generated sound status.

## Generated narration pass

Brag's actual Kokoro route generated the reference script with stock `af_heart`.
Speech is on a separate Remotion audio node. Music ducks to 0.13 during
frame-indexed phrases; SFX retain their gain. Final combined meters read
approximately −18 LUFS with true peak below −2 dBTP. Exact 48 kHz sample count checks pass.
Generated-stem ASR was run; pronunciation hints were added for SaaS and Twobase.
ASR still has spelling/homophone/article variants. It is not a listening review,
and no identical speaker/intonation claim is made.

The latest voice revision also preserves natural delivery rather than slowing
phrases to fill their windows. Its audio-revision receipt verifies unchanged
picture packet bytes/PTS against a passing full Chrome capture.

## Current correction pass

`out/GlassyPhone/sound-8ddprn/video.mp4`

Nearby utterances share a held music envelope, with smooth dB attack/release and no recovery into the outro fade. Encoded loudness/peak checks pass. Numerical checks are not listening approval.
