---
name: motion-cursors
description: Add polished, hotspot-anchored cursors, pointing hands, touch indicators and synchronized click effects to product demos and feature guides. Use for cursor motion and interaction feedback over actual UI; it does not redraw the product or invent actions.
---

# Product demo cursors

Make the next action easy to follow while keeping the actual product readable.
Read [design, evidence and implementation](references/design.md) when choosing a
style or adapting the renderer. It links official Screen Studio, Tella and
Camtasia guidance plus saved original images and demo-video stills. Vendor
images are research references, never production cursor assets.

Treat a cursor position as its **active hotspot**, not an image's top-left.
Anchor movement, tilt and press scaling at that point. Keep the whole glyph
and shadow drawable; a tight SVG viewport can truncate the tail or fingers.
Use a coherent arrow, hand, I-beam or touch vocabulary appropriate to the action.
A hand appears over a real link/clickable target, not while crossing empty space.

For this studio, use [DemoCursor](../../studio/cursor/DemoCursor.tsx) and its
[frame helpers](../../studio/cursor/motion.ts). The component supplies original
arrow/hand/touch vectors, a press response and an expanding click ripple.
Choose its size and effect strength for the output viewing size. Keep the tip
inside measured DOM bounds and favor control padding so the glyph does not
obscure the label. Use a short arrival/read/click hold and fade during idle holds.

Clicks have their own immutable frame and hotspot coordinates. The ripple stays
at that click location; it must not follow the cursor after the event. Synchronize
visual feedback and optional SFX from the same event plan. A hover is not a click,
and a drag is not a repeated series of clicks. Trim effects at a shot boundary
when they would otherwise float over a different screen.

Remotion owns time. Sample absolute frames; no CSS transition, RAF loop, live
mouse listener or accumulated smoothing. Apply film annotations over
[actual product UI](../motion-studio/references/native-ui.md), preserving its
layout and state. Respect an exact reconstruction brief's separate acceptance.

Inspect the silhouette on light/dark UI at native and intended preview size,
then inspect adjacent click frames. Run `npm run test:cursors`, scene captures
and normal export checks. A correct transform matrix does not prove a pleasing
glyph: inspect the pixels. Keep the actual review scope in the production review.
