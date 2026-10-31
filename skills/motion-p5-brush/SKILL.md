---
name: motion-p5-brush
description: Create seeded painted strokes, watercolor fills, dry-media textures and hatching for motion artwork with p5.brush. Use for a physical drawing treatment, not clean UI or timeline scheduling.
---

# p5.brush for motion films

Use p5.brush when the story calls for tangible, imperfect marks: an underline on a pain-point headline, pigment behind a result, or hatched diagrams. Keep product typography and UI in React.

Choose the build before coding. The default package requires p5 2.x and WEBGL; standalone uses `p5.brush/standalone`, WebGL2 and its own canvas, transform and seed APIs. Do not mix the two lifecycles. For a static stroke, generate a local PNG once with a recorded seed instead of repainting an expensive wash on every video frame. That PNG is authored artwork, never a reference-film substitute.

Read [capabilities and official references](references/capabilities.md) for API selection, traps, version scope and source links. For this studio, compose with [the motion-studio router](../motion-studio/SKILL.md), then read its [frame contract](../motion-studio/references/canvas-contract.md). The product story and acceptance criteria stay with the production brief; this skill supplies a visual technique.

The researched implementation pins `3.0.0` (MIT); do not silently upgrade or use CDN `latest` at render time. Check the installed package before using a newer API. Keep generated assets local with their source, seed, dimensions, version and hash.

Run `npm run build:art` to generate and verify the painted accent; inspect its seed/provenance. The social film uses that actual library output. Test brush generation separately from Remotion seeking.

The feature inventory records documented capabilities separately from implemented/tested examples. A successful frame probe is not a pleasing full film or a listening review. Run type checks, inspect scenes/transitions, render using the shared engine and verify the final export. Preserve the exact reconstruction gate when that separate workflow applies.
