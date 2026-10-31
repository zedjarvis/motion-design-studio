# Turn a finding into a follow-up task

Feature guide. 1920 × 1080, 30 fps, 720 frames / 24 seconds.
Audience: Schoolbooks school finance/operations users.

The product viewport is captured from the actual unmodified Schoolbooks Nuxt
production frontend (build 2026-10-25), served locally with isolated demo API
fixtures based on its existing accounting-findings E2E test. No panel, control,
modal, spacing, font or color is reimplemented in Remotion. Source repo remains
unchanged. The original simplified-panel draft is rejected as a product guide.

## Actual journey

| Frames | Product capture | Instruction/action |
| --- | --- | --- |
| 0–59 | Accounting specialist overview | Orient on the real page |
| 60–194 | Native Findings / Needs attention | Read finding, click real Review action |
| 195–414 | Native Review follow-up task modal | Read proposal, click real Create follow-up task |
| 415–539 | Native Needs attention after confirmation | Real success toast; actioned row leaves the tab |
| 540–719 | Native History | Find the actual Open follow-up task link |

The final link destination `/tasks/follow-up-task` is verified in the actual
DOM. The film ends at that link; it does not invent a destination screen. The
invoice's recorded outstanding balance stays 24,000. The values and account are
fictional demo fixtures, clearly labeled outside the product image. No real
financial writes or collection actions occur.

## Presentation and sound

A complete 1600 × 900 product viewport sits at integer position (160,108), 1×,
inside the 1920 × 1080 film. Instruction text and p5 progress sit outside it.
Rough.js callouts and an Anime.js cursor use actual measured DOM coordinates.
There is no cinematic camera scaling or replacement application chrome.
Screenshot sources, compiled asset hashes and state/target metadata remain in
assets/native-ui/PROVENANCE.json. Remotion uses local copied PNGs deterministically.

Kokoro af_heart narration uses the original script in SCRIPT.md. The final line
explicitly instructs History before Open follow-up task. Licensed music/SFX use
frame cues, held ducking and natural phrase timing. Listening approval is separate.

## Acceptance

Inspect actual native screenshots, target/cursor alignment, scene/transition
frames and decoded export. Require capture provenance and **exact RGB equality**
for five unobscured native UI regions in the RGB master (overview, finding,
modal, post-confirmation, History). Normal type checks, engine tests, repeat
captures, export metadata/audio and browser playback must also pass. Native UI
checks do not prove backend correctness or the four artwork benchmark targets.


Cursor treatment: motion-cursors supplies a locally authored, high-contrast arrow
and a hand while the hotspot is over the real final link. All transforms pivot
on the active hotspot. Position targets favor measured control padding, keeping
labels readable. A short press/recovery and fixed-position ripple mark clicks
at frames 183,399,531, matching existing click SFX. Pulses end at native shot
boundaries. No click is invented for the final link hover. SVG overflow and a
separate cursor layer preserve the whole glyph above annotations. The cursor
plan retains frame windows, height and tilt limits. Official research images
remain outside public and are not production assets.
