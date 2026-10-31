# Native Schoolbooks feature guide — revised review

The earlier authored approximation is rejected. The replacement uses actual
unmodified Schoolbooks production UI, with isolated fictional API fixtures.
No product UI controls, typography, layout or styles are recreated.

Inspected actual overview, finding, modal, post-confirmation and History shots,
and revised Chrome scene/transition frames 0,30,59,60,120,183,194,195,270,399,
414,415,450,531,539,540,570,633,719. The cursor/callouts use real DOM bounds.
The real post-action row leaves Needs attention and is found in History.
Narration now includes that tab. The final link destination is verified in the
actual DOM. The video ends at the link and does not invent a task-detail screen.

All five unobscured native UI regions in the scene snapshots match the actual
app screenshots byte-for-byte (4,320,000 RGB bytes per state). The stricter guide
export gate repeats this against the lossless master. New native UI gate
regressions cover missing evidence, resizing and a one-channel pixel difference.

Current delivery paths are recorded in [delivery.json](delivery.json).
Full capture, fresh-browser sampled repeatability and both encodes passed.
All five native UI checks also pass against the lossless master, with no RGB
byte difference. The decoded export board was inspected across every scene;
no missing assets or clipping was observed in the samples. The real History tab,
Actioned state, unchanged balance and actual follow-up link remain visible.

The export verifier confirms 1920 × 1080, 30 fps, 720 picture frames and encoded
sound at −18.02 LUFS. Poster, captions, credits, share copy and provenance are
retained. The shared 19 engine regressions, seven capability checks and four
new native UI gate tests pass. Full muted playback is recorded separately in
[playback.json](../../analysis/productions/playback.json).

Listening remains pending; generated/encoded sound measurements and muted
playback are separate from subjective auditory approval. This is the actual
product UI running against isolated fixtures, not a test of its backend. Product
source remains untouched. The native checks cover selected unobscured UI states,
not every animation frame or the separate four reference reconstructions.

## Cursor and click feedback revision

The replacement uses the motion-cursors skill, with official visual research
and source-image provenance in docs/research/cursors. The production vectors
are authored locally. Native-size crops were inspected at frames 181,185,191,
401,533,633; adjacent snapshots cover 162,165,181,183,185,188,191,194,197,397,
399,401,405,413,529,531,533,539,540,619,625,633,650,664.

The arrow now has dark fill, a light keyline and shadow. The hand is complete
and appears only over the real final link. The active hotspot is used for
position, tilt and press scaling. Cursor targets favor the measured control
padding, keeping the body below the labels. Fade windows remove idle cursors.
Click press/recovery and fixed-point ripples are synchronized to existing SFX
at frames 183,399,531 and end at the next native shot. The final link arrival
is a hover, with no invented click. The path uses those same event-plan frames.

Five cursor checks cover SFX agreement, press/ripple lifetime, frame-plan path
arrivals, actual browser hotspot projection through press/tilt and reverse-seek
pixel equality. TypeScript, all 19 engine regressions and four native UI gate
regressions pass. The shared evidence samples still require exact actual-UI RGB
checks on the new lossless export. Revised export/playback results follow below.


The current cursor export is `out/SchoolbooksFeatureGuide/capture-9mn0bX/video.mp4`.
Full capture, fresh-browser sampled repeatability, MP4/RGB encodes and export
checks pass. All five native product UI states remain byte-identical in their
unobscured master samples. Decoded delivery crops at the review/confirm/history
clicks and final link were inspected at native and half size: the glyphs remain
complete, labels remain readable, and the click pulse stays at the event point.
See [decoded details](../../analysis/cursors/decoded-detail.png) and
[cursor test results](../../analysis/cursors/report.json). Playback is checked
separately by the muted browser suite. Original narration, music and click SFX
are retained; no new subjective auditory approval is claimed.

The final three-film browser suite completed full muted playback without page
errors. Current guide delivery: 1920 × 1080, 30 fps, 720 frames. The cursor
revision passes its five checks, the existing native UI RGB checks and export
checks. Subjective listening remains a separate pending review.
