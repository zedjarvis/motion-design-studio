# Thinking Orbs: capability map

Research date: 2026-10-31. Implementation pin: 0.3.2. License: MIT. This is an authored decision guide, not a copied manual. Official source links below are the authority for current signatures.

## Feature families

| Family | APIs / controls | Film use and implementation decision |
| --- | --- | --- |
| working | orbits mode | Tilted particle orbits for work in progress. |
| searching | globe mode | Scan across a dotted sphere while locating information. |
| solving | rubik mode | Bands scramble and realign; distinguish analysis from completed success. |
| listening | wave mode | Wave through rings; only imply audio input when the scenario actually has it. |
| connecting | web mode | Nodes, edges and moving packets for relationships or handoff. |
| weaving | braid mode | Three plaiting strands for synthesis. |
| composing | ribbon mode | Undulating bands for drafting. |
| breathing | ring mode | Quiet generic thinking, not a fabricated microphone state. |
| shaping | morph mode | Circle, triangle and square outline changes. |
| Sizes | resolvePreset(state, size) | Separate tuned populations/speeds. Evaluate at the preset coordinate size, then vector-scale the drawing for film. |
| Frame data | `MODE_FRAMES[mode](size, seconds, opts)` | Final z-sorted dots and lines, finite positions, radii and alpha; no DOM or React required. |
| Painter | paintFrame(ctx, frame, dark) | Clear and reset transform first; lines precede nodes. Dark theme mirrors the grayscale ink convention. |
| Web component | ThinkingOrb state/size/theme/speed/paused/canvas props | Auto theme, reduced-motion representative frame, visibility pauses, aria-label and capped DPR for live app use. |
| Native / custom renderers | engine Dot, Line, OrbFrame contract | Geometry is portable; do not re-derive a different renderer and call it upstream output. |

## Integration and performance

Pin theme and output density for export; never inherit OS theme or a user media query as a film setting. The ordinary component’s browser pause/resume behavior is useful for a live site but makes it unsuitable for offline frame seeking. Speed is multiplied once: preset speed × requested seconds × explicit speed. Keep the preset object immutable because resolvePreset caches it. Honor line order, dot z-order and opacity. Published 0.3.2 supports an official tint while preserving depth shading; pass it to the painter rather than inventing a flat recolor. Repository main was 0.3.1 during research while npm published 0.3.2: the adapter uses the installed 0.3.2 engine contract and lockfile, not an assumed mutable branch version. Retain the MIT notice.

In Remotion, derive a complete visual from absolute frame time. Await asynchronous setup and drawing, clear transient paint before redraw, pin canvas density, and clean up GPU/canvas resources. A static generated texture can be baked once and revealed with frame-driven markup; record that as build-time usage rather than pretending the library runs per frame. Keep editable text outside baked art.

## Practical verification

Exercise all nine states at both tuned sizes and out-of-order times, then capture the film adapter. Launch uses connecting feedback beside real product material. Check non-empty pixels, a meaningful difference between two times, exact repeatability at the same time after a different seek order, scene cleanup, browser errors and successful audio/video export. Test representative states rather than claiming every documented feature is implemented. Consult the studio capability report and each film's REVIEW.md for actual results.

## Official sources

- [Official repo, states and web component](https://github.com/Jakubantalik/thinking-orbs)
- [Pure engine entry point](https://github.com/Jakubantalik/thinking-orbs/blob/main/src/engine/index.ts)
- [Frame data and painter](https://github.com/Jakubantalik/thinking-orbs/blob/main/src/engine/core.ts)
- [Preset tuning](https://github.com/Jakubantalik/thinking-orbs/blob/main/src/presets.ts)
- [Autonomous React lifecycle](https://github.com/Jakubantalik/thinking-orbs/blob/main/src/ThinkingOrb.tsx)

## Published 0.3.2 additions verified in package types

- `OrbSize` also accepts 32. This interpolates the 20/64 tunings in log space; it is not a separately hand-tuned preset.
- `color` and the painter’s optional RGB tint preserve the shading ramp.
- `dots` adjusts density (minimum 0.1), and `dotSize` adjusts radius without losing the depth proportions.
- `opts` overrides mode-specific options; unknown or irrelevant keys do not create new behavior.
- `frame` can provide custom pure geometry while retaining the host painter.
- `gravity` is a live-pointer raster deformation system requiring a matching pointer sprite, with reduced-motion/forced-colors/coarse-pointer/zoom safeguards. It does not move the OS pointer. A movie should script a cursor instead of activating this live observer subsystem.

Authority: published [thinking-orbs 0.3.2](https://www.npmjs.com/package/thinking-orbs/v/0.3.2), installed `dist/types.d.ts`, `dist/engine/core.d.ts` and `dist/gravity.d.ts`. These additions illustrate why a mutable repository README alone is insufficient. The pilot uses the core engine, not pointer gravity.

## Working studio recipe

[studio/capabilities/runtime.ts](../../../studio/capabilities/runtime.ts) — Pure preset/frame/painter pipeline evaluated at absolute seconds. Use this alongside [the async frame host](../../../studio/capabilities/FrameCanvas.tsx) and [the actual-library tests](../../../tests/capabilities.mjs). Adapt the scene content rather than importing an autonomous animation loop.
