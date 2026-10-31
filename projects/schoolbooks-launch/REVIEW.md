# Schoolbooks launch review

Rendered for review: `out/SchoolbooksLaunch/capture-V4ARRA/video.mp4`.
Film player: http://localhost:3212. Editable Studio: http://localhost:3210/SchoolbooksLaunch.
Source: CODEIGNITE/ACCOUNTING/schoolbooks, commit 6b90d18 plus existing user edits; the product repository was not changed.

## What was verified

- TypeScript passed. The complete 690-frame Chrome capture and independent out-of-order checks at 689/0/345 passed with exact decoded RGB equality. Bundle/source audit and MP4 encoding passed.
- Export is 1920 × 1080 at 30 fps with 690 displayed frames: 23 seconds of picture. Browser reports a 23.019-second container because of AAC padding. Playback reached the end without media or page errors; the browser test was muted.
- Inspected the decoded full-timeline board (two samples/second), the decoded transition board, native adjacent transition frames and the settled poster. Fonts and media load, primary copy remains inside safe areas, scene overlaps cover the outgoing scene, the review modal appears after the click, and the closing holds through the final frame. No missing media, unintended clipping or blank tail was found in those inspections. This is sampled visual inspection, not an every-frame manual review or an audio listening review.
- Caption and visual language use current source evidence. The workspace image is the product’s existing actual Demo School capture. The specialist panel represents its real findings → review action → follow-up preview flow, using clearly marked fictional values. No financial posting or real task creation occurs.
- Original four-line narration uses Brag’s local Kokoro af_heart route at natural speed. ASR recovered the scripted words. WAV stems have exactly 1,104,000 samples at 48 kHz stereo. Encoded audio measures −17.99 LUFS and −2.52 dBTP. Grouped ducking holds the music through nearby speech gaps; effects retain their cue gains.
- The chosen poster is settled frame 620, authored as frame 0 too. The native frames are pixel-identical. The JPEG poster, share copy and licensing credits accompany the MP4.

## Repeatability corrections

Chrome’s historical rasterization changed edges of the rotated logo and the downsampled Spark icon. The final hold uses a native raster of this studio’s own settled logo/shadow artwork; the entrance remains animated and all scene text remains authored text. Spark is prepared at its native 52 px display size. Provenance records every derivation. No reference artwork or video was replayed. The final full export passed the unchanged repeatability check after these fixes.

The workspace-to-specialist transition uses an opaque directional wipe so outgoing and incoming text do not double-expose.

## Remaining review

Final listening approval is pending. Technical meters and speech transcription do not establish pronunciation, prosody, mix quality or final audiovisual listening approval.

This is an original repo-evidence film. The four reference reconstructions remain a separate, unapproved acceptance task.
