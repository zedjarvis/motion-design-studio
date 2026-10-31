---
name: motion-roughjs
description: Create reproducible sketch-style SVG or canvas annotations, diagrams and hachure fills with Rough.js. Use for hand-drawn explanation and callouts; it does not schedule animation or generate typography.
---

# Rough.js for motion films

Draw a circle around the relevant balance, connect a source document to a follow-up, or explain a workflow with a sketched route. Keep product UI accurate; roughness is for the annotation layer.

Use a positive seed for every stable shape. Seed 0 is unseeded. Generate geometry once and reveal/transform it with Remotion; randomizing the seed each frame produces boiling lines. rough.generator().toPaths(drawable) supports React-owned SVG paths without giving another renderer ownership of the DOM.

Read [capabilities and official references](references/capabilities.md) for API selection, traps, version scope and source links. For this studio, compose with [the motion-studio router](../motion-studio/SKILL.md), then read its [frame contract](../motion-studio/references/canvas-contract.md). The product story and acceptance criteria stay with the production brief; this skill supplies a visual technique.

The researched implementation pins `4.6.6` (MIT); do not silently upgrade or use CDN `latest` at render time. Check the installed package before using a newer API. Keep generated assets local with their source, seed, dimensions, version and hash.

Check same-seed drawables match and different seeds produce different geometry. The guide uses seeded action highlights; the social clip uses a drawn balance callout.

The feature inventory records documented capabilities separately from implemented/tested examples. A successful frame probe is not a pleasing full film or a listening review. Run type checks, inspect scenes/transitions, render using the shared engine and verify the final export. Preserve the exact reconstruction gate when that separate workflow applies.
