# p5.brush: capability map

Research date: 2026-10-31. Implementation pin: 3.0.0. License: MIT. This is an authored decision guide, not a copied manual. Official source links below are the authority for current signatures.

## Feature families

| Family | APIs / controls | Film use and implementation decision |
| --- | --- | --- |
| Build / target | p5 build versus standalone; main canvas, p5.Graphics, active p5.Framebuffer, HTMLCanvasElement, OffscreenCanvas | Select a supported target; framebuffers from p5.Graphics are not supported. |
| Brush selection | set, pick, stroke, strokeWeight, noStroke, box | Built-in pencils, pen, marker, spray and dry-media looks; query names rather than inventing them. |
| Custom brushes | add; default, spray, marker, custom, image | Pressure envelope, spacing, scatter, grain, opacity, rotation and marker-end buildup; await image-tip loading. |
| Watercolor | fill, noFill, fillBleed, fillTexture | Pigment edge, grain, pooling, color separation and overlapping wet fills; fills dry when a drawing pass flushes. |
| Flat color | wash, noWash | Use when watercolor simulation would add cost without communicating anything. |
| Hatching | hatch, hatchStyle, noHatch | Distance, angle, jitter, continuous and gradient settings; isolate fill state between objects. |
| Dry mass fill | mass, noMass, hatchArray, massArray | Crayon/pastel body and combined polygon gestures, including even-odd holes. |
| Geometry | line, spline, arc, rect, circle, polygon | Prefer primitives for ordinary visible drawing; arc is stroke-only, circle supports fill/hatch. |
| Pressure paths | beginStroke, move, endStroke; beginShape, vertex, endShape | Variable pressure and authored paths; choose angles explicitly. |
| Fields | field, noField, wiggle, listFields, addField, refreshField | Bend motion through named or generated angle grids; sample a field using absolute video seconds. |
| Stored geometry | Polygon, Plot, Position | Reuse geometry for intersections or array fill APIs; do not use these classes as mandatory boilerplate. |
| Boundaries | clip, noClip; push/pop | Clip stroke regions and contain state. Clip transforms are captured when configured. |
| Reproducibility | seed/noiseSeed in standalone; p5 randomSeed/noiseSeed in p5 build | Reset before a complete drawing pass. A seed alone does not reset accumulated canvas paint. |
| Export / buffers | render, clear, createCanvas, load in standalone | Explicitly flush, then read pixels; use fixed pixel density and dimensions. |

## Integration and performance

In standalone custom tip callbacks, rotation is always radians, and colors are CSS strings or numeric values rather than p5.Color objects. Normal standalone angle APIs follow angleMode. Fill opacity uses 0–255. Circle API documentation has mixed radius/diameter wording across examples: confirm the installed implementation or a measured probe before critical sizing. scaleBrushes changes registered brush sizes: configure once, not repeatedly per frame. Transparent reset plus identical seed and draw order are required for repeatable output. Limit full-canvas high-density watercolor; prefer localized, cached artwork. A p5.brush state object is shared within a module: avoid interleaving independent canvases without explicit load/state restoration.

In Remotion, derive a complete visual from absolute frame time. Await asynchronous setup and drawing, clear transient paint before redraw, pin canvas density, and clean up GPU/canvas resources. A static generated texture can be baked once and revealed with frame-driven markup; record that as build-time usage rather than pretending the library runs per frame. Keep editable text outside baked art.

## Practical verification

Run `npm run build:art` to generate and verify the painted accent; inspect its seed/provenance. The social film uses that actual library output. Test brush generation separately from Remotion seeking. Check non-empty pixels, a meaningful difference between two times, exact repeatability at the same time after a different seek order, scene cleanup, browser errors and successful audio/video export. Test representative states rather than claiming every documented feature is implemented. Consult the studio capability report and each film's REVIEW.md for actual results.

## Official sources

- [Official repository and full API](https://github.com/acamposuribe/p5.brush)
- [Standalone lifecycle and coordinate contract](https://github.com/acamposuribe/p5.brush/blob/main/docs/standalone.md)
- [Author-maintained agent reference](https://github.com/acamposuribe/p5.brush/blob/main/llms.txt)
- [Installed package source](https://www.npmjs.com/package/p5.brush/v/3.0.0)

## Working studio recipe

[scripts/build-art.mjs](../../../scripts/build-art.mjs) — Build-time marker asset; two fresh pages, fixed seeds and decoded-pixel comparison. Use this alongside [the async frame host](../../../studio/capabilities/FrameCanvas.tsx) and [the actual-library tests](../../../tests/capabilities.mjs). Adapt the scene content rather than importing an autonomous animation loop.
