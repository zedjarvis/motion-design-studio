# Glassy phone reconstruction

Status: editable 2.5D draft rendered; exact parity FAILED (364/364 frames differ).
Target: 888 × 1920, 24 fps, 364 frames. Source PTS origin 0.041667 s removed once.

## Authored structure

Frame-driven CSS/SVG phone rig, procedural wallpaper, weather/app icons,
notification and music card, camera UI, zoom/record marker, route map, and
closing brand. Pose keys have monotone cubic interpolation to avoid sudden
velocity changes at joins. The clock entrance was delayed and the notification
card turns through perspective into the music card.

The mountain photo is a single isolated static recovery with UI masked and
inpainted, recorded in `assets/PROVENANCE.json`. Occluded source pixels are not
recoverable, and this is not an exact native asset. No reference video or frame
sequence plays in production. The current official Twobase logo may differ
from the revision in the download.

## Unresolved match

This is not a native 3D reconstruction. Phone model/materials, original camera
trajectory and perspective, wallpaper, icon flight paths and extrusion, glass
refraction/blur, photo recovery, map geometry/zoom and logo revision differ.
The launcher-to-notification transition at 57–64 is the largest current error.
The initial phone's 54 one-value repeatability errors were resolved with pinned
software GL; the full export passes the sampled fresh-browser repeat check.

Music/SFX follow Brag's bundled-library method. Only confirmed reference speech
should receive generated narration; do not read UI labels as invented speech.
Full auditory and visual approval remain pending.
