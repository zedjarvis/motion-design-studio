# Cursor research — original visual evidence

Studied 2026-10-31. The linked images below are original publisher material,
not AI-generated recreations. Their URLs, hashes and video frame timestamps are
in [evidence.json](evidence.json). Local research copies remain ignored and are not redistributed or used as production media.

## Screen Studio

[Official cursor guide](https://screen.studio/guide/cursor) and
[animation guide](https://screen.studio/guide/animations).
The original settings screenshot makes size, type and idle visibility explicit.
Its advanced settings cover motion rotation and shake reduction. This supports
using a coherent pointer style and restrained, readable movement rather than
a decorative follower effect. Those are design references, not claims that
this studio runs Screen Studio's proprietary engine.

![Screen Studio's original cursor settings image](https://cdn.sanity.io/images/2ltoq22u/production/37270bb1487303ccd53eecc48dde8ce2ecc0a0fa-2560x1920.png?w=1280)

Publisher: Screen Studio / Adam Pietrasiak. Research reference only.
[Original image](https://cdn.sanity.io/images/2ltoq22u/production/37270bb1487303ccd53eecc48dde8ce2ecc0a0fa-2560x1920.png).
The separate [advanced-controls image](https://cdn.sanity.io/images/2ltoq22u/production/46387891b6c0ed6fcd818d7631ad91fcfeeff37d-2560x1920.png?w=1280) is also saved.

## Tella

[Official animated cursor article](https://www.tella.com/blog/animated-cursors-for-screen-recordings)
and [screen-effects page](https://www.tella.com/screen-effects).
Tella describes drawing the cursor separately from recorded pointer/click data,
with style, size, smoothing, tilt, press and ripple controls. Its editor image
shows these as independent choices. A guide can use click emphasis without
making every movement conspicuous. The studio implementation below selects its
own numeric tuning; it is not copying vendor defaults or vector assets.

![Original Tella cursor editor illustration](https://www.tella.com/marketing-site/animated-cursors-screen-recording.png)

Publisher: Tella HQ Inc. [Original image](https://www.tella.com/marketing-site/animated-cursors-screen-recording.png).

The official page also supplies actual style examples:
[arrow](https://www.tella.com/assets/cursors/mac-goldengate/preview.svg), [pointing hand](https://www.tella.com/marketing-site/screen-effects/cursors/mac-pointinghand.svg), and
[touch](https://www.tella.com/assets/cursors/touch/touch.svg). These are visual references only.

### Actual published demo frames

These are stills from Tella's own
[screen-effects demonstration video](https://www.tella.com/marketing-site/media/screen-effects-hero.mp4),
not screenshots of our implementation. The source is 16.267 seconds; frame
positions below are seconds into that source, distinct from the editor's own
visible timeline. Video source hash and JPEG derivation hashes are recorded.
The material illustrates the actual editor and its surrounding demo context;
the original SVG examples above are the clearest evidence of glyph silhouettes.
Do not infer a complete animation curve or exact pulse duration from a still.

[2-second demo example](https://www.tella.com/marketing-site/media/screen-effects-hero.mp4#t=2)

[8-second demo example](https://www.tella.com/marketing-site/media/screen-effects-hero.mp4#t=8)

An additional [5-second still](https://www.tella.com/marketing-site/media/screen-effects-hero.mp4#t=5) is retained. Publisher:
Tella HQ Inc. Images are saved only for this local research and are not included
in the Schoolbooks export, its public directory or the cursor renderer.

## Camtasia

[Official custom cursor effects](https://www.techsmith.com/camtasia/features/custom-cursor/)
describe motion blur, momentum and an elevated cursor layer. This informs the
layering decision: the pointer stays above explanatory annotations. We did not
reproduce Camtasia's images or implement its full effect catalog. Its page was
read through the web tool; direct page download returned 403, so no fabricated
local screenshot is presented as Camtasia evidence.

## Implementation chosen for this studio

The [motion-cursors skill](../../../skills/motion-cursors/SKILL.md) turns these
references into an editable technique. [DemoCursor](../../../studio/cursor/DemoCursor.tsx)
uses locally authored arrow/hand/touch paths. The active hotspot is the origin
for position, scale and tilt; SVG overflow preserves the complete silhouette.
It uses a dark arrow with a light keyline and shadow, and a light hand with a
dark outline. Clicks create a restrained concentric pulse at a fixed event point.

The Schoolbooks guide uses a 34px SVG viewport, up to 5° movement tilt, a short
press/recovery and a ripple with a maximum 28px radius. Effects trim at the next
native UI shot. The pointer fades through holds. These are our measured creative
choices, not extracted vendor values. Actual DOM bounds supply the target; the
pointer favors padding to preserve the control's text. The last link changes to
a hand only while its hotspot is actually over the link bounds in that shot.
No click is invented for that final hover.

The previous cursor had a 44×50 box, a long white silhouette that read poorly
on white UI, no separate click pulse, and a nonzero SVG tip offset added to its
target coordinates. The replacement anchors the active tip instead of the image
corner and keeps the cursor above the callout layer. Actual browser tests cover
the press/tilt hotspot projection, visible click feedback and reverse seeking.

See [cursor checks](../../../analysis/cursors/report.json),
[probe image](../../../analysis/cursors/probe.png), and the guide's REVIEW.md
for implementation and review coverage. A transform test alone does not prove
visual quality; the native and preview-size real-UI crops must be inspected.
