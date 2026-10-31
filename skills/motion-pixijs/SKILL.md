---
name: motion-pixijs
description: Render GPU-accelerated 2D scenes, record flows, particles, sprites and composited graphics with PixiJS v8. Use for dense retained scenes; keep frame timing, audio and export under Remotion.
---

# PixiJS for motion films

Use PixiJS for a compact visual that benefits from GPU batching: records converging on an agent, a controlled particle field or a layered illustration. Small DOM cards do not automatically need a GPU renderer.

In v8, construct Application then await init. Set fixed width/height/resolution and a pinned WebGL backend. Disable automatic/private/shared ticker activity for this adapter; set all positions/alpha from absolute frame time, then render once. Wait for initialization/draw using the Remotion render handle, and destroy the application on unmount.

Read [capabilities and official references](references/capabilities.md) for API selection, traps, version scope and source links. For this studio, compose with [the motion-studio router](../motion-studio/SKILL.md), then read its [frame contract](../motion-studio/references/canvas-contract.md). The product story and acceptance criteria stay with the production brief; this skill supplies a visual technique.

The researched implementation pins `8.22.0` (MIT); do not silently upgrade or use CDN `latest` at render time. Check the installed package before using a newer API. Keep generated assets local with their source, seed, dimensions, version and hash.

The real stopped-ticker adapter must render at arbitrary times and return identical pixels after backwards seeking. Launch/social use GPU record flow; do not count an import as an integration test.

The feature inventory records documented capabilities separately from implemented/tested examples. A successful frame probe is not a pleasing full film or a listening review. Run type checks, inspect scenes/transitions, render using the shared engine and verify the final export. Preserve the exact reconstruction gate when that separate workflow applies.
