# Anime.js: capability map

Research date: 2026-10-31. Implementation pin: 4.5.0. License: MIT. This is an authored decision guide, not a copied manual. Official source links below are the authority for current signatures.

## Feature families

| Family | APIs / controls | Film use and implementation decision |
| --- | --- | --- |
| Object / DOM animation | animate, numeric objects, CSS properties, attributes | Film adapter samples objects; React writes visible styles. |
| Tweens | from/to values, property keyframes, per-property settings | Explicit baselines avoid inheriting the last sampled state. |
| Timelines | createTimeline, add, sync, label, relative positions | Coordinate several actions while preserving a readable hold. |
| Seeking | seek(time, true), pause, cancel | Milliseconds unless explicitly configured otherwise; callbacks cannot trigger live actions during seek. |
| Staggers | stagger delays, ranges, direction, grids | Stage list arrivals; keep each item readable after it arrives. |
| Easing | built-in eases, cubic curves, spring eases | Avoid physical overshoot for values and legal document fields. |
| SVG | morphTo, createDrawable, createMotionPath | Normalize source paths and measure browser-dependent geometry during setup. |
| Text | splitText, scrambleText | Useful for headlines; retain accessible text and do not scramble a critical instruction. |
| Scope | createScope, root, mediaQueries, revert | Good for component cleanup in live UI; export dimensions/theme stay fixed. |
| Engine | useDefaultMainLoop, timeUnit, fps, speed, precision | Explicitly controlled adapter configuration, not the film time source. |
| WAAPI | waapi.animate | Separate backend with a smaller feature surface; not interchangeable with deterministic JS-object sampling. |
| Interactive features | draggable, events, scroll-driven behavior, layout tools | Script the gesture for a film; do not depend on real scrolling or pointer input. |

## Integration and performance

Avoid older v3 anime({...}) and easing property examples in v4 code; use the installed v4 type signatures. Muting seek callbacks prevents event duplication but does not establish deterministic target values: define from-to ranges and test arbitrary seek order. Seeking a detached plain object avoids DOM layout measurement and lets Remotion own the final CSS. Timelines with loops/alternate behavior need explicit duration/iteration tests. Scope revert restores setup state; cancel releases a film-only timeline. Frame rates are display sampling, not a reason to run the autonomous engine at a second independent fps. SVG path morphing, WAAPI, text splitting and draggable behavior are documented capabilities, not all exercised by the three pilot films.

In Remotion, derive a complete visual from absolute frame time. Await asynchronous setup and drawing, clear transient paint before redraw, pin canvas density, and clean up GPU/canvas resources. A static generated texture can be baked once and revealed with frame-driven markup; record that as build-time usage rather than pretending the library runs per frame. Keep editable text outside baked art.

## Practical verification

Sample a paused real timeline in reverse order and compare against fresh timelines. Launch and guide use actual Anime.js numeric choreography, not a renamed Remotion easing. Check non-empty pixels, a meaningful difference between two times, exact repeatability at the same time after a different seek order, scene cleanup, browser errors and successful audio/video export. Test representative states rather than claiming every documented feature is implemented. Consult the studio capability report and each film's REVIEW.md for actual results.

## Official sources

- [Official v4 documentation](https://animejs.com/documentation/)
- [Animation / targets](https://animejs.com/documentation/animation/)
- [Timeline API](https://animejs.com/documentation/timeline/)
- [Seek milliseconds and callback control](https://animejs.com/documentation/timeline/timeline-methods/seek/)
- [Engine loop control](https://animejs.com/documentation/engine/engine-properties/)
- [SVG tools](https://animejs.com/documentation/svg/)
- [Text tools](https://animejs.com/documentation/text/)
- [Scoped lifecycle](https://animejs.com/documentation/scope/)
- [Stagger tools](https://animejs.com/documentation/utilities/stagger/)

## Working studio recipe

[studio/capabilities/choreography.ts](../../../studio/capabilities/choreography.ts) — Paused explicit-value numeric timelines for entrances and cursor choreography. Use this alongside [the async frame host](../../../studio/capabilities/FrameCanvas.tsx) and [the actual-library tests](../../../tests/capabilities.mjs). Adapt the scene content rather than importing an autonomous animation loop.
