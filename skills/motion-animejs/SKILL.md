---
name: motion-animejs
description: Author seekable Anime.js timelines, staggered choreography, numeric-object tweens and SVG motion for films. Use when coordinated timing benefits from a timeline; Remotion remains the export clock.
---

# Anime.js for motion films

Use Anime.js for a coordinated cursor move, staggered row reveal or an SVG path drawing whose choreography is clearer as a timeline. Prefer plain numeric targets for React-rendered film styles.

Use v4 named imports, autoplay:false and explicit starting values. Disable engine.useDefaultMainLoop for this film adapter, seek to absolute milliseconds with muted callbacks, and cancel the timeline on disposal. Avoid two owners writing the same DOM transform. The test must seek backward and forward, not just play from zero.

Read [capabilities and official references](references/capabilities.md) for API selection, traps, version scope and source links. For this studio, compose with [the motion-studio router](../motion-studio/SKILL.md), then read its [frame contract](../motion-studio/references/canvas-contract.md). The product story and acceptance criteria stay with the production brief; this skill supplies a visual technique.

The researched implementation pins `4.5.0` (MIT); do not silently upgrade or use CDN `latest` at render time. Check the installed package before using a newer API. Keep generated assets local with their source, seed, dimensions, version and hash.

Sample a paused real timeline in reverse order and compare against fresh timelines. Launch and guide use actual Anime.js numeric choreography, not a renamed Remotion easing.

The feature inventory records documented capabilities separately from implemented/tested examples. A successful frame probe is not a pleasing full film or a listening review. Run type checks, inspect scenes/transitions, render using the shared engine and verify the final export. Preserve the exact reconstruction gate when that separate workflow applies.
