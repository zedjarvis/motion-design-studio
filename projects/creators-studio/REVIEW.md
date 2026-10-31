# Reconstruction review

**Not approved. Exact visual parity fails.** Full comparison is recorded in
`out/acceptance/suite.json`; no similarity threshold substitutes for pixel equality.

Preview: http://localhost:3210/CreatorsStudio
Delivery draft: `out/CreatorsStudio/sound-NI9dJh/video.mp4`. Review player: http://localhost:3211.

## Visual evidence

Sampled scene and adjacent transition frames inspected: Intro 12–108; searchlight 176–282; wipe windows 288–432; corrected panels at 324/328/370/410.

Corrected: Camera tumble/lens restored, false 113 px jump repaired, cone retained through exit, text moves with outgoing panels.

Still visibly different: Typography, grain, optical trails/blur, lens shape and panel edge pixels.

All decoded RGB frames were compared. Native dimensions/FPS/frame counts and
relative PTS pass; every frame still has different pixels. These checks are not
a claim of complete realtime playback or listening review.

## Sound

Brag's licensed music plus Kenney SFX are rebuilt and retimed. The user
explicitly chose to keep this clip music/SFX-only after the low-confidence ASR
result. No narration was generated or added. Technical meters/sample counts
pass; final listening review remains pending.

## Current correction pass

`out/CreatorsStudio/sound-NI9dJh/video.mp4`

Sascha Ende Vol. 9 bed with CC BY attribution, authored stereo transition swishes and Kenney accents. Swish RMS peaks verified at 303/342/380/418. Every video packet and PTS is unchanged in the sound-only export. No narration. The new mix requires listening review.
