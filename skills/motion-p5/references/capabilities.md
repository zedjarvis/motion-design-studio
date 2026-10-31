# p5.js: capability map

Research date: 2026-10-31. Implementation pin: 2.3.4. License: LGPL-2.1. This is an authored decision guide, not a copied manual. Official source links below are the authority for current signatures.

## Feature families

| Family | APIs / controls | Film use and implementation decision |
| --- | --- | --- |
| Drawing vocabulary | line, rect, circle, ellipse, arc, polygon vertices | Build explanatory shapes and code-authored artwork. |
| Curves | beginShape, vertex, bezierVertex, curveVertex, bezier, curve | Smooth routes and custom outlines; manage open versus closed shapes. |
| Style / color | fill, stroke, colorMode, lerpColor, blendMode | Establish a controlled palette; restore state using push/pop. |
| Space | translate, rotate, scale, push/pop | 2D top-left origin versus WEBGL center origin; keep transforms local. |
| Procedural variation | randomSeed, random, randomGaussian, noiseSeed, noise, noiseDetail | Stable geometry with smoothly varying noise; re-seed a full redraw. |
| Animation / input | setup, draw, noLoop, redraw, events | Interactive apps may react to input; a film scripts that input on a deterministic timeline. |
| Typography | loadFont, text, textWidth, typography layout | Load local fonts before capture; retain important UI copy in semantic React text where practical. |
| Images / media | loadImage, image, pixels, createGraphics | Await loads, keep assets local, use frame-controlled media rather than autonomous GIF playback. |
| 3D | WEBGL, primitive geometry, camera, lights, materials | Frame a meaningful 3D object; use an explicit time for transformations. |
| Shaders | createShader, shader, uniforms; GLSL / p5.strands tutorial families | A time uniform is frame/fps, not a browser timer; check version-specific shader APIs. |
| Layering | p5.Graphics, p5.Framebuffer | Reuse offscreen results. Framebuffers share GPU context and suit WebGL passes. |
| Geometry caching | buildGeometry / model where supported | Avoid rebuilding static meshes each draw; measure before optimization. |
| Accessibility | describe, describeElement, textOutput, gridOutput | Canvas semantics help previews; video exports also need readable text, transcript/captions and a useful poster. |
| Performance | Browser profiler, pixelDensity, fewer pixel readbacks, bounded offscreen surfaces | Separate setup cost from per-frame cost; cache static geometry and media. |

## Integration and performance

p5 version 2 changes loading, text, geometry and shader behavior; do not copy a v1 global-mode example into a v2 module without checking it. Types shipped by the installed release are preferred to unrelated older @types packages. A p5.Graphics surface remains useful in 2D; use Framebuffer for appropriate WebGL multipass work. Avoid per-frame get/loadPixels transfers when a shader or cached surface fits. Do not introduce webcam, microphone, network requests or live input merely because a tutorial demonstrates them. Export accessibility descriptions do not survive as an MP4 screen-reader tree: deliver equivalent copy and caption files. Preserve the library license and notices when distributing bundled code.

In Remotion, derive a complete visual from absolute frame time. Await asynchronous setup and drawing, clear transient paint before redraw, pin canvas density, and clean up GPU/canvas resources. A static generated texture can be baked once and revealed with frame-driven markup; record that as build-time usage rather than pretending the library runs per frame. Keep editable text outside baked art.

## Practical verification

The capability check must render a seeded sketch at an arbitrary time, seek backward, and compare decoded pixels. The feature-guide film uses the p5 step-progress drawing. Check non-empty pixels, a meaningful difference between two times, exact repeatability at the same time after a different seek order, scene cleanup, browser errors and successful audio/video export. Test representative states rather than claiming every documented feature is implemented. Consult the studio capability report and each film's REVIEW.md for actual results.

## Official sources

- [Tutorial catalog and learning paths](https://p5js.org/tutorials/)
- [API categories](https://p5js.org/reference/)
- [Stopped loop](https://p5js.org/reference/p5/noLoop/)
- [Awaited redraw](https://p5js.org/reference/p5/redraw/)
- [Random seed](https://p5js.org/reference/p5/randomSeed/)
- [Noise seed](https://p5js.org/reference/p5/noiseSeed/)
- [Coordinates / transforms](https://p5js.org/tutorials/coordinates-and-transformations/)
- [Curves](https://p5js.org/tutorials/custom-shapes-and-smooth-curves/)
- [Framebuffers](https://p5js.org/tutorials/layered-rendering-with-framebuffers/)
- [WebGL performance](https://p5js.org/tutorials/optimizing-webgl-sketches/)
- [Canvas descriptions](https://p5js.org/tutorials/writing-accessible-canvas-descriptions/)

## Working studio recipe

[studio/capabilities/runtime.ts](../../../studio/capabilities/runtime.ts) — Instance-mode progress drawing with noLoop and awaited full redraw. Use this alongside [the async frame host](../../../studio/capabilities/FrameCanvas.tsx) and [the actual-library tests](../../../tests/capabilities.mjs). Adapt the scene content rather than importing an autonomous animation loop.

## Tutorial extensions and limits

p5 tutorials also demonstrate image/video processing, pixels/filters, responsive interactive sketches, data-driven drawing and sound-oriented projects. Those are creative starting points, not permission for nondeterministic capture inputs. Preload local datasets and media, script interaction and size changes, and use Remotion-controlled playback. Sound tutorials can require an additional sound library; this studio routes its soundtrack through its existing audio pipeline instead of installing a second autonomous sound clock. Code examples using webcam, microphone or machine-learning results need recorded inputs or baked results before film capture.
