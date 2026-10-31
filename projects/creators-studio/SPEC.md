# Creators Studio reconstruction

Status: editable draft rendered; exact parity FAILED (522/522 frames differ).
Target: 556 × 314, 48 fps, 522 frames. Approved upper Original-panel crop:
(x=80, y=318, width=556, height=314). Source PTS origin 0.020833 s removed once.

## Authored structure

| Frames | Scene |
| --- | --- |
| 0–287 | Camera tumble, detached lens, searchlight |
| 288–325 | THE panel |
| 326–369 | CREATORS vertical panel transition |
| 370–405 | STUDIO horizontal panel transition |
| 406–521 | Final brand plane entering from above |

`src/motion.json` contains scalar camera poses, lens bounds, cone edge rays and
panel coverage. `scripts/track-creators.py` derives geometry, never raster
playback. The source's held-frame cadence is retained. The body-to-letter
misclassification at 200/201 was repaired from adjacent measured poses.
Panel children move with their host; the outgoing STUDIO panel drops below the
incoming brand plane instead of remaining fixed.

## Unresolved match

Exact extended font, noise/grain, glow, motion blur, detached-lens shape and
rounded corner/wrapper pixels. Current Inter stretching is a candidate, not
an identified native font. Static gradient colors and optical treatment differ.
New music/SFX follow the actual action frames. Reference speech is analyzed
separately; do not invent narration if there is no spoken reference track.
