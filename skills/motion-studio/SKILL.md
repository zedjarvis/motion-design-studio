---
name: motion-studio
description: Author editable Remotion product films from repository evidence, or reconstruct supplied motion artwork with strict frame comparisons. Use this studio's local capture, sound and review tools; do not treat a similar-looking draft as an exact rebuild.
---

# Motion Studio

Use the engine workspace identified by its `package.json` name,
`motion-design-studio`. When this skill is read in another repo, use the supplied
engine path or locate it from this skill's repository; create the production in
that engine's `projects/<slug>/`. Do not modify the inspected product repo just
to produce its film. The skill is orchestration guidance, not an unattended LLM
service or a claim that a reconstruction has already passed.

Choose the workflow from the user's request:

- **New film from code:** read [repo-film.md](references/repo-film.md). Reference
  images and videos are optional, not prerequisites. Ground product claims and
  visual identity in the repo's actual source.
- **Launch/release, feature guide or social pain-point film:** read
  [product-formats.md](references/product-formats.md), then select only the visual
  skills that serve the story. [canvas-contract.md](references/canvas-contract.md)
  defines the shared frame clock and backend lifecycle. Feature guides must use
  [actual product UI](references/native-ui.md), never a redesigned approximation.
- **Rebuild supplied artwork:** read [reconstruction.md](references/reconstruction.md).
  Preserve the reference's frame rate, dimensions and frame count, and retain
  its acceptance requirement. Never substitute reference playback for authoring.
- **Cursor and click feedback for demos:** read
  [motion-cursors](../motion-cursors/SKILL.md). Preserve real target positions and
  synchronize visual clicks with their event/SFX frames.
- **Sound in either workflow:** read [audio.md](references/audio.md).

Compose the available installed skills rather than duplicating their manuals:
`remotion-best-practices` routes creation; `remotion-create` handles composition
setup; `remotion-markup` and `remotion-interactivity` own editable frame-driven
structure; `remotion-studio` owns preview; `remotion-render` owns export. Load
only the relevant sub-guides for 3D, effects, text, audio or captions. If these
skills are unavailable, use the engine's pinned package APIs and official
Remotion documentation, and report any missing capability.

Read the engine's `README.md` and current production source before changing it.
Use named scene boundaries and explicit composition registrations. Keep assets
local, fonts pinned, randomness seeded and all motion driven by the frame.
No CSS animation timers or independent Three.js animation loop.

Open Studio as soon as the project runs. The user may already have authorized
exports; honor that authorization without another permission loop. A failed
browser launch is a blocker to capture, not a successful render. A command that
bundles successfully has not proved visual correctness.

Use `npm run typecheck` for source changes and the engine tests when changing
capture/acceptance tools. Inspect scene frames and final playback, and listen
to the sound. Deliver source, preview/export links and the actual validation
status. Do not claim reviews or parity that were not completed.
