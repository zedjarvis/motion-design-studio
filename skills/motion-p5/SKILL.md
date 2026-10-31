---
name: motion-p5
description: Author procedural 2D drawing, generative diagrams, curves, noise, shaders and framebuffers with p5.js. Use when canvas geometry communicates the story; keep application text and interaction controls in React.
---

# p5.js for motion films

Use a p5 sketch for a procedural visual that is easier to express as drawing commands: diagram ticks, source-to-result connections, a data metaphor or an authored environment. Read the relevant official tutorial family, not the entire tutorial catalog for every job.

Use instance mode, a fixed canvas and pixelDensity(1). Call noLoop in setup. Remotion provides the requested time; draw a complete scene from that time and fixed seeds, then await redraw. Never use p.frameCount, millis, mouse position, ambient randomness or repeated x += velocity updates as the export clock. Dispose with remove when the scene unmounts.

Read [capabilities and official references](references/capabilities.md) for API selection, traps, version scope and source links. For this studio, compose with [the motion-studio router](../motion-studio/SKILL.md), then read its [frame contract](../motion-studio/references/canvas-contract.md). The product story and acceptance criteria stay with the production brief; this skill supplies a visual technique.

The researched implementation pins `2.3.4` (LGPL-2.1); do not silently upgrade or use CDN `latest` at render time. Check the installed package before using a newer API. Keep generated assets local with their source, seed, dimensions, version and hash.

The capability check must render a seeded sketch at an arbitrary time, seek backward, and compare decoded pixels. The feature-guide film uses the p5 step-progress drawing.

The feature inventory records documented capabilities separately from implemented/tested examples. A successful frame probe is not a pleasing full film or a listening review. Run type checks, inspect scenes/transitions, render using the shared engine and verify the final export. Preserve the exact reconstruction gate when that separate workflow applies.
