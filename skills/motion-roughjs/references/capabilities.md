# Rough.js: capability map

Research date: 2026-10-31. Implementation pin: 4.6.6. License: MIT. This is an authored decision guide, not a copied manual. Official source links below are the authority for current signatures.

## Feature families

| Family | APIs / controls | Film use and implementation decision |
| --- | --- | --- |
| Targets | rough.canvas, rough.svg, rough.generator | Immediate canvas, SVG nodes or reusable drawables/path data. |
| Primitives | line, rectangle, ellipse, circle | Circle accepts diameter; rectangle starts at top-left, ellipse at center. |
| Routes | linearPath, curve | Open multi-point segments versus smooth curves. |
| Regions | polygon, arc | Arc angles are radians, not degrees; closed arcs can be filled. |
| SVG artwork | path(d, options) | Parse vector paths; simplify carefully when exact shape geometry matters. |
| Reproducible shape | seed | Positive integer; stable identifiers per shape and stable generation order. |
| Sketch character | roughness, bowing, strokeWidth | Choose legible stroke weight rather than using excessive roughness. |
| Fills | solid, hachure, cross-hatch, zigzag, dots, dashed, zigzag-line | Pick fill for explanatory meaning, not a different texture on every card. |
| Fill tuning | fillWeight, hachureAngle, hachureGap | Density and orientation; degrees here differ from arc radians. |
| Dashes | strokeLineDash, strokeLineDashOffset, fillLineDash, fillLineDashOffset | Separate outline dashes from texture dashes. |
| Fidelity | curveStepCount, curveFitting, simplification, preserveVertices | Keep endpoints attached to their targets and avoid distorting source UI. |
| Stroke economy | disableMultiStroke, disableMultiStrokeFill | Single-line cues for restrained UI overlays. |
| Reusing geometry | Drawable, generator, toPaths | Reuse one seeded result; animate path reveal rather than regenerating a new sketch. |
| Compositing | SVG clip, opacity, stroke-dashoffset in host | Host owns timing, masks and layering; Rough.js is the geometry generator. |

## Integration and performance

RoughCanvas and RoughSVG share drawing semantics but return different presentation objects. A generator is useful without a browser DOM; retain SVG fill/stroke and even-odd behavior when converting paths. Do not animate DOM nodes from RoughSVG while React also owns those nodes. Make arrow endpoints and highlight bounds follow measured product geometry. Use thick enough lines to survive portrait preview downscaling. Arbitrary source SVG geometry can become complex after roughening: simplify deliberately and check holes. Keep organic jitter static through an entrance; changing only reveal progress makes a drawing feel authored rather than noisy. The website and wiki contain historical fill-style variations: use the installed 4.6.6 types/implementation for the accepted set.

In Remotion, derive a complete visual from absolute frame time. Await asynchronous setup and drawing, clear transient paint before redraw, pin canvas density, and clean up GPU/canvas resources. A static generated texture can be baked once and revealed with frame-driven markup; record that as build-time usage rather than pretending the library runs per frame. Keep editable text outside baked art.

## Practical verification

Check same-seed drawables match and different seeds produce different geometry. The guide uses seeded action highlights; the social clip uses a drawn balance callout. Check non-empty pixels, a meaningful difference between two times, exact repeatability at the same time after a different seek order, scene cleanup, browser errors and successful audio/video export. Test representative states rather than claiming every documented feature is implemented. Consult the studio capability report and each film's REVIEW.md for actual results.

## Official sources

- [Official site](https://roughjs.com/)
- [Full options, geometry and seeding](https://github.com/rough-stuff/rough/wiki)
- [Generator API](https://github.com/rough-stuff/rough/wiki/RoughGenerator)
- [Installed source](https://github.com/rough-stuff/rough)

## Working studio recipe

[studio/capabilities/Sketch.tsx](../../../studio/capabilities/Sketch.tsx) — Seeded generator paths rendered as React SVG with a frame-driven reveal. Use this alongside [the async frame host](../../../studio/capabilities/FrameCanvas.tsx) and [the actual-library tests](../../../tests/capabilities.mjs). Adapt the scene content rather than importing an autonomous animation loop.
