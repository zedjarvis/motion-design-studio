# Reconstruction review

**Not approved. Exact visual parity fails.** Full comparison is recorded in
`out/acceptance/suite.json`; no similarity threshold substitutes for pixel equality.

Preview: http://localhost:3210/MinimalistPriceless
Delivery draft: `out/MinimalistPriceless/capture-dKQ4Io/video.mp4`. Review player: http://localhost:3211.

## Visual evidence

Sampled scene and adjacent transition frames inspected: Coin/point 30/90/150, face 190–210, pendulum 274–300/345/380–387, globe 420/480.

Corrected: Face contour recovery now avoids the 12-frame dropout.

Still visibly different: Coin/face/globe artwork, fonts, stable five-ball identities and pendulum blur.

All decoded RGB frames were compared. Native dimensions/FPS/frame counts and
relative PTS pass; every frame still has different pixels. These checks are not
a claim of complete realtime playback or listening review.

## Sound

Brag's licensed music plus Kenney SFX are rebuilt and retimed. The latest user
instruction enables Kokoro narration where reference speech exists, superseding
the earlier no-voice brief. Voice content/timing verification and final auditory
review remain separate. Read `public/generated/minimalist-priceless/audio-report.json` for
actual technical measurements and the current generated sound status.

## Generated narration pass

Brag's actual Kokoro route generated the reference script with stock `af_heart`.
Speech is on a separate Remotion audio node. Music ducks to 0.13 during
frame-indexed phrases; SFX retain their gain. Final combined meters read
approximately −18 LUFS with true peak below −2 dBTP. Exact 48 kHz sample count checks pass.
Generated-stem ASR was run; pronunciation hints were added for SaaS and Twobase.
ASR still has spelling/homophone/article variants. It is not a listening review,
and no identical speaker/intonation claim is made.

## Ending revision

User feedback: the narration sounded strange near the end. Removed forced
slowdown of short utterances; normal Kokoro delivery now finishes naturally,
with silence in spare phrase time. The final generated-stem ASR recovers the
canonical words without the earlier extra article. Full render, fresh-browser
repeat check and encode pass. Its static signature uses a raster of our own
authored SVG after the entrance, avoiding history-dependent SVG edge rounding;
no reference pixels are used. Listening approval remains pending.

## Current correction pass

`out/MinimalistPriceless/capture-dKQ4Io/video.mp4`

Nearby utterances share a held music envelope, with smooth dB attack/release and no recovery into the outro fade. Encoded loudness/peak checks pass. Numerical checks are not listening approval.
Angled strings have a brighter anti-aliased core/soft halo, top anchors and circle-surface attachments. Native and one-third-size samples inspected. The prior thin stroke had broken-looking coverage at preview scale. Full pixel parity remains unapproved.
