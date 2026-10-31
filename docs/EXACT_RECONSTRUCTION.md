# Exact reconstruction workflow

An exact reconstruction remains incomplete until **every decoded RGB byte of
every native frame matches**, and dimensions, frame rate, frame count and exact
relative presentation times match too. Build checks, smooth playback, SSIM,
motion-presence diagnostics and a successful encode cannot confer acceptance.
The four current benchmarks remain unapproved.

## Author and review

1. Lock the reference's native dimensions, FPS, decoded frame count and approved
   artwork crop in the manifest. Keep time origin removal fixed. Never search for
   an offset, scale, retime, skip frames or ignore the tail to improve a result.
2. Inventory scenes **and each visible layer's behavior** before calling a scene
   implemented. Include holds, small shakes, fades, line treatments, shadows,
   blur, textures, secondary motion and outgoing-panel movement. Record unknown
   fonts/assets and unmeasured ranges as unresolved.
3. Fit settled layouts, type and artwork. Then inspect adjacent native frames
   through every movement and transition, including frames between the obvious
   poses. A contact sheet is a starting map, not a complete motion review.
4. Use fixed diagnostic regions for small effects whose errors can disappear
   inside a whole-frame score. Run the region audit against the old export to
   establish the defect, then the new export to check the correction. Inspect
   line rendering at native size **and the intended preview size**.
5. Render from frozen local inputs. Inspect decoded export frames, run the full
   comparison, examine the failed ranges, and revise the source. Keep those
   ranges open. A resolved missing-motion warning proves motion exists, not that
   its amplitude, curve, blur or pixels are correct.
6. A complete exact claim requires the current export's all-frame report to pass.
   Keep draft exports, source receipts and unresolved findings reviewable while
   continuing work. Never describe an approximate draft as a completed rebuild.

## Tools and evidence

```bash
npm run compare -- alconost-localization out/AlconostLocalization/<capture>/master.rgb.mp4
npm run audit:motion -- alconost-localization out/AlconostLocalization/<capture>/master.rgb.mp4
npm run parity
```

`compare.py` streams RGB24 frames and compares their actual byte buffers. SHA-256
values are audit identifiers only; equality does not depend on a hash or score.
Decoded integer PTS multiplied by the stream's rational `time_base` determine
timing. Their relative fractions must be equal, without a floating tolerance.

Each comparison writes `frame-checks.csv`: native frame index, displayed and
rational times, source/candidate RGB digests, pixel equality, timestamp equality
and frame presence. It includes unmatched trailing frames. The JSON report
records the comparison implementation hash and first failed frame.

The suite writes individual reports under `out/acceptance/<project>/` and a
four-project `suite.json`. Missing candidates, invalid capture provenance and
pixel/timing failures all block acceptance. The review server rejects reports
for an older candidate path instead of displaying their status for a new export.

`references/regions.json` defines **diagnostic-only** regions and native frame
windows. `audit-motion.py` compares every adjacent frame in each window and
flags a candidate held still while the reference has substantial activity.
Activity thresholds never relax the full-frame pixel gate. The initial red-card
audit caught the previously omitted Alconost shake at frames 51–99.

## Audio review is separate

Retain natural speech delivery within its authored window. Test the gaps as
well as the speech: nearby utterances form one ducked music passage, with a
smooth attack/release in decibels. Avoid a volume recovery directly into the
outro fade. Review explicitly spoken domains, brand names and final consonants;
use pronunciation text such as “Alconost dot com” rather than relying on a period.

Numerical levels and transcription do not replace listening. A picture parity
pass would not establish sound approval, and a corrected soundtrack cannot
change a failing picture result.
