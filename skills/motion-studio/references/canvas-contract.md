# One video clock, several drawing tools

The host remains Remotion. A backend receives absolute seconds from
`useCurrentFrame() / fps`; it must produce the complete image for that instant.
Repeated or backward seeks cannot depend on the previously drawn frame.

Use the shared adapters in `studio/capabilities/`. Their role is initialization,
fixed-size drawing, readiness and disposal, not writing product copy. Read the
specific capability skill before adding a new backend operation.

| Tool | Setup and frame ownership | Appropriate use |
| --- | --- | --- |
| p5.brush | Build a seeded local asset; standalone needs explicit clear/render and WebGL2 | Painted strokes, watercolor, hatch texture |
| p5 | Instance mode, noLoop, seeded complete draw, awaited redraw | Procedural diagrams and progress artwork |
| Thinking Orbs | Pure engine resolves geometry at a supplied time; explicit theme | Truthful agent status beside actual evidence |
| Rough.js | Seeded generator creates SVG paths once; Remotion reveals them | Instructional highlights and hand-drawn routes |
| Anime.js | Paused timeline, disabled default loop, absolute seek in ms | Coordinated object/card/cursor choreography |
| PixiJS | Await init; stopped private ticker; absolute transforms; explicit render | Retained GPU scene and record-flow illustration |

Pin dimensions, resolution, fonts, random seeds and renderer/backend. Do not
inherit wall-clock time, OS theme, live pointer state or device pixel ratio.
Use local assets. A seed does not clear previous paint: reset the drawing state
and surface, or regenerate a bounded simulation from a known initial state.

Every asynchronous initialization/draw must hold a Remotion render handle until
the requested frame is ready, and release it on cancellation/error. Serialize
draw jobs when a backend returns a promise. Dispose application-owned canvases,
textures, timelines and listeners; do not destroy another scene's shared assets.

Keep text and editable UI in React. A painted static accent can be cached as an
authored asset, with source code, library version, seed and hash. A native-size
asset can also stabilize a settled filter/rotation pose. This never authorizes
replaying benchmark references. Document build-time versus runtime library use.

Verify actual pixels: meaningful non-empty regions, different authored times,
same-time equality after backward seeks and in a fresh browser. Also inspect
the complete exported film, timing/readability, native and preview-size lines,
and sound. The three-point export repeat check is a sample, not proof of every
library capability or every possible GPU/browser combination.

Primary contracts: [Remotion readiness](https://www.remotion.dev/docs/delay-render),
[p5 redraw](https://p5js.org/reference/p5/redraw/),
[Orbs engine](https://github.com/Jakubantalik/thinking-orbs/blob/main/src/engine/index.ts),
[Anime seek](https://animejs.com/documentation/timeline/timeline-methods/seek/),
[Pixi Application](https://pixijs.com/8.x/guides/components/application).
