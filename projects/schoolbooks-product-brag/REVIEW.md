# Your records. A working team. — review

Reviewed 2026-10-31. Original source-backed product film; not a reconstruction
or an exact reference-parity claim.

## Source and visual review

The opening connects retained record marks with the dotted connecting state. The actual Demo School workspace screenshot is framed clearly; its entrance resolves before the reading hold. Closing copy and URL remain readable. Frame 0 is the selected closing poster state, following Brag’s delivery convention. The screenshot is a repo asset, not a live-session recording.

Inspected native scene/transition captures at frames 0, 45, 149, 150, 170, 270, 374, 375, 450, 539,
then the decoded delivery board sampled every two seconds. Checked hierarchy,
framing, clipping, local font/asset loads, transition states and final hold.
No clipping or missing assets was observed in those samples. This is a sampled
visual review, not a statement that every decoded frame was manually inspected.

The shared capability tests exercise actual library output, nonblank pixels,
time-dependent differences and same-frame equality after reverse seeking.
The full render also passes selected first/middle/last frame equality in a fresh
Chrome process. These sampled checks are not a cross-GPU equality guarantee.

## Picture and sound export

Full Chrome PNG capture, fresh-browser repeat checks and both MP4 encodes passed.
The production verifier checks current source/media hashes, intended dimensions,
30 fps, exact picture frame count, audio streams and narration/cue bounds.
See [delivery.json](delivery.json) and the [decoded board](../../analysis/productions/schoolbooks-product-brag-decoded.jpg).
The player test result is recorded separately in
[playback.json](../../analysis/productions/playback.json).

The original script is synthesized locally with Kokoro af_heart through Brag’s
HyperFrames TTS route. Licensed music/SFX and a separate voice stem are retained.
Music ducking holds through short speech gaps; effects retain their cue gain.
Both the source mix and encoded AAC pass loudness/true-peak/duration checks.
Credits, share copy, poster, phrase-window captions and script accompany the MP4.

**Subjective listening remains pending.** No pronunciation, music balance or
complete auditory review is claimed from meters or muted browser playback.
Caption windows follow authored phrase windows, not word-level forced alignment.

## Scope

This case demonstrates the launch production path from repo evidence to a
playable authored export. Additional library features listed in skills are
researched options; this film does not test every upstream API. The inspected
product repository was not modified. The four reference reconstruction gates
remain separate and unchanged.
