# PixiJS: capability map

Research date: 2026-10-31. Implementation pin: 8.22.0. License: MIT. This is an authored decision guide, not a copied manual. Official source links below are the authority for current signatures.

## Feature families

| Family | APIs / controls | Film use and implementation decision |
| --- | --- | --- |
| Application | new Application; await app.init; app.canvas | v8 asynchronous setup differs from constructor-options v7 examples. |
| Rendering | WebGL/WebGPU renderers, explicit render | Pin a backend for capture; preserve the drawing buffer when readback requires it. |
| Scene graph | Container, hierarchy, zIndex, layers/groups | Assign local transforms and stable draw order; do not accumulate deltas. |
| Sprites | Sprite, Texture, spritesheets, TilingSprite, NineSliceSprite | Reuse textures and batch similar display objects. |
| Graphics | rect, roundRect, circle, ellipse, arc, curves, polygons, stars | Build geometry, then fill/stroke; avoid rebuilding large shapes every frame. |
| Shared shapes | GraphicsContext | Reuse shape geometry. Destroying a shared context affects all owners. |
| Assets | Assets.init/load, bundles, manifests, cache, unload | Local preloaded assets only during capture; make ownership/lifetime explicit. |
| Text | Text, BitmapText, HTMLText as supported | Load fonts before generating textures; avoid per-frame text texture regeneration. |
| Particles | ParticleContainer, Particle, dynamicProperties | High throughput but reduced object features; check v8 experimental API stability. |
| Masks / blending | rectangle, graphics, sprite masks; blend modes | Use bounded mask/filter areas and respect batch order. |
| Effects / mesh | filters, Mesh, geometry, uniforms | An explicit time uniform replaces a ticker; measure rather than guessing performance. |
| Interaction | events, hitArea, eventMode, accessibility | Live product tools can use input; a film uses a scripted visible gesture. |
| Lifecycle / GC | destroy, texture/context ownership, ticker stop | Do not destroy shared resources belonging to another scene. |
| Optimization | sprite ordering, culling, stable Graphics, texture reuse | Culling can hurt CPU-bound scenes; repeated filters and text texture uploads are expensive. |

## Integration and performance

autoStart:false alone does not stop a shared ticker that is already running. Use a private stopped ticker and explicit renders. Prefer the typed v8 render signature and Graphics fill/stroke sequence rather than pasting legacy beginFill/endFill examples. Avoid devicePixelRatio-dependent backing sizes; the authored output resolution is fixed. Global Assets cache and shared GraphicsContext require clear ownership at cleanup. Keep masks rectangular where possible and bound expensive filter areas. Pinned WebGL + software capture does not promise identical pixels on unrelated GPUs or browsers. The docs describe broad mesh/filter/particle features; only the actual retained-record-flow adapter is claimed as exercised in the pilot films.

In Remotion, derive a complete visual from absolute frame time. Await asynchronous setup and drawing, clear transient paint before redraw, pin canvas density, and clean up GPU/canvas resources. A static generated texture can be baked once and revealed with frame-driven markup; record that as build-time usage rather than pretending the library runs per frame. Keep editable text outside baked art.

## Practical verification

The real stopped-ticker adapter must render at arbitrary times and return identical pixels after backwards seeking. Launch/social use GPU record flow; do not count an import as an integration test. Check non-empty pixels, a meaningful difference between two times, exact repeatability at the same time after a different seek order, scene cleanup, browser errors and successful audio/video export. Test representative states rather than claiming every documented feature is implemented. Consult the studio capability report and each film's REVIEW.md for actual results.

## Official sources

- [Official v8 introduction](https://pixijs.com/8.x/guides/getting-started/intro)
- [Async Application and options](https://pixijs.com/8.x/guides/components/application)
- [Render loop / ticker contract](https://pixijs.com/8.x/guides/concepts/render-loop)
- [Scene graph](https://pixijs.com/8.x/guides/concepts/scene-graph)
- [Graphics and context ownership](https://pixijs.com/8.x/guides/components/scene-objects/graphics)
- [Assets](https://pixijs.com/8.x/guides/components/assets)
- [Particles](https://pixijs.com/8.x/guides/components/scene-objects/particle-container)
- [Official performance guidance](https://pixijs.com/8.x/guides/concepts/performance-tips)

## Working studio recipe

[studio/capabilities/runtime.ts](../../../studio/capabilities/runtime.ts) — Retained Graphics on a private stopped ticker, with explicit render and disposal. Use this alongside [the async frame host](../../../studio/capabilities/FrameCanvas.tsx) and [the actual-library tests](../../../tests/capabilities.mjs). Adapt the scene content rather than importing an autonomous animation loop.
