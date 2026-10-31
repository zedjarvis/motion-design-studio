# Cursor design and evidence

Research: 2026-10-31. These are product-demo interaction techniques, not website
follower-cursor decorations. Vendor capabilities inform the choices; the studio's
sizes, easing and vectors below are authored implementation decisions.

## Official visual references

- [Screen Studio cursor guide](https://screen.studio/guide/cursor): size/type,
  idle visibility and movement controls. Original settings and advanced-control
  images are saved in the [evidence collection](../../../docs/research/cursors/RESEARCH.md).
- [Tella animated cursor guide](https://www.tella.com/blog/animated-cursors-for-screen-recordings):
  editable cursor data, OS/touch styles, smoothing, press and ripple controls.
  Its actual editor image and original arrow/hand/touch illustrations are saved.
- [Tella screen effects](https://www.tella.com/screen-effects): original visual
  cursor assets and published demo footage. The evidence collection records
  exact frame timestamps, source URLs and hashes for the saved stills.
- [Camtasia custom cursors](https://www.techsmith.com/camtasia/features/custom-cursor/):
  motion blur, momentum and cursor elevation. Elevation is useful when callouts
  would otherwise paint over a cursor. No Camtasia art is used in the renderer.

Keep the distinction between observed imagery and inferred recommendations.
The research images remain outside `public/` and production assets. A familiar
pointer form is useful; copying proprietary OS/vendor vectors is unnecessary.
The studio glyphs are locally authored and are not claimed to be native OS assets.

## Choose the treatment

| Purpose | Useful treatment | Avoid |
| --- | --- | --- |
| Feature instruction | Clear arrow, hand over a link, modest press/ripple, idle fade | Obscuring the label, decorative trails, excessive tilt |
| Launch/demo highlight | Slightly larger arrow, small movement tilt, crisp click accent | Unmotivated click rings and constant bouncing |
| Touch walkthrough | Neutral contact dot and tap ripple | A mouse arrow implying an interaction unavailable on the device |
| Typing | Actual caret/I-beam behavior if teaching text selection | Showing a hand while editing text |
| Drag/selection | Faithful contact and release path | Turning every movement sample into another click |

At 1080p, the Schoolbooks example uses a 34px-high SVG viewport, with a compact
visible glyph, movement tilt capped at 5°, and a half-second ripple capped at a
28px radius. Press scale goes 1 → 0.86 → 1.03 → 1. These are tunable art direction,
not universal standards or vendor defaults. Set `accent` and `ringColor` from
the inspected product palette; the default teal is only a useful starting point. At a tight zoom, reduce glyph size;
at a phone preview, check visibility before increasing it. Reserve strong pulse,
spotlight or burst effects for a clear communicative reason.

## Geometry and clocks

The SVG viewBox starts at the authored hotspot; the position/press/rotation
container has a zero origin exactly at the target. `preserveAspectRatio="none"`
avoids subpixel letterboxing shifting the hotspot. SVG and cursor hosts use
visible overflow so the keyline/shadow do not clip. Use one coherent closed
silhouette, restrained stroke joins and a shadow that separates it from both
light and dark UI. Inspect the hand's finger joints as well as its outer shape.

Use measured control bounds from actual-app capture metadata. An inner-padding
click point often keeps the body below a button's label. For a text link, its
text bounds and element hit bounds differ; never guess an external clickable
area. Transition to a hand only while the hotspot is inside the captured link
bounds in the matching UI state.

Time is an absolute video frame. If using an Anime.js path, keep it paused with
explicit endpoints and seek its absolute time. A velocity-based tilt may sample
frame n−1 and n, then restore n; it must not depend on previously visited frames.
Use the click event's fixed x/y for the ripple. Scale around the active hotspot,
not the center of the glyph. Keep one cursor layer above annotations and ensure
the source recording does not contain a second baked cursor.

## Working example and review

[Schoolbooks cursor plan](../../../projects/schoolbooks-feature-guide/src/cursor-plan.json)
contains the three real click frames, shot limits and visibility windows.
[Guide source](../../../projects/schoolbooks-feature-guide/src/Video.tsx) derives
positions from actual DOM bounds and uses Anime.js choreography. The last link
is a hover/arrival; it gets no invented click or click sound.

[Browser tests](../../../tests/cursors.mjs) check actual SVG hotspot projection
through tilt/press, visible click feedback, reverse-seek pixel equality and click
SFX timing. [CursorProbe](../../../projects/cursor-lab/src/Video.tsx) exercises the
three glyphs over light/dark surfaces. Capture it at frames 0,30,32,36,41,48.
Then inspect the real guide near frames 183,399,531 and the link arrival around633.
Tests do not replace looking at the cursor at 100% and the intended viewing size.
The native product UI parity samples must still pass when overlays are hidden.
