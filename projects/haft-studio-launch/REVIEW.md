# Repo-only film review

Full export: `out/HaftStudioLaunch/sound-9dqGtr/video.mp4`.
Preview: http://localhost:3210/HaftStudioLaunch.

Inspected frames 0/30/104/116/150/194/208/260/329/342/390/449. Verified the
source-backed copy, logo, local font, real product images, framing, hold and
final CTA. The first product enters during the wipe; later cards are staggered.
The closing CTA remains inside safe margins with a readable final hold.

A fractional logo scale initially caused ten one-value repeatability errors.
The logo now uses an exact 2× native size. Full capture, fresh-browser sample
repeatability, standard MP4 and lossless RGB encode all pass in the current
receipt. Scene review board: `analysis/haft-film-review.jpg`.

Audio sample count/levels pass. Complete listening review remains pending.
This film demonstrates original authorship from a different repo without
reference media; it is not one of the four parity targets and confers no
reconstruction acceptance.

## Original narration

`SCRIPT.md` and `narration.json` contain original source-backed copy. The local
Kokoro route generated the four phrases. Speech stays at natural speed inside
the authored windows. Music-only ducking, separate voice/bed stems and combined
meters pass. Generated-voice ASR recovers the script; it spells the brand as
“Half Studio”, so brand pronunciation should receive a listening check.
The sound-only export retains every video packet and PTS of the passing parent
capture; its receipt records both provenances.

## Current correction pass

`out/HaftStudioLaunch/sound-9dqGtr/video.mp4`

Nearby utterances share a held music envelope, with smooth dB attack/release and no recovery into the outro fade. Encoded loudness/peak checks pass. Numerical checks are not listening approval.
