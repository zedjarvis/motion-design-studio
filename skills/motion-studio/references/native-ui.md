# Actual product UI for feature guides

A viewer must recognize the same screen and controls when following the guide
inside the product. Reading source is how to discover the task; it is not a
license to design a replacement interface. Source-backed invented panels fail
this workflow.

## Capture the product

1. Inspect the owning page, components, API calls and existing browser tests.
   Find the product's runnable dev server or existing production build. Avoid
   changing product source merely to produce a guide.
2. Use a demo account/backend or browser-local fixtures based on the product's
   own tests and API contracts. Do not change UI markup/CSS. Intercept demo
   mutations locally so filming does not create real financial or customer actions.
   This validates UI behavior against fixtures, not backend transaction correctness.
3. Pin viewport, DPR, theme, locale and timezone. Wait for local fonts, images
   and finite UI animations before measuring targets and capturing stable states.
   Keep a recording for temporal transitions when their behavior is the lesson.
4. Execute the real click/tab/modal handlers. Verify the next state and route.
   Capture the entry, target record, confirmation and result. Check filters and
   tabs after an action; a success toast does not prove the row remains in place.
5. Retain original screenshots/recording under the production assets, then copy
   only the required assets to public. Record build date/ID, source and compiled
   asset hashes, route, viewport/DPR, state names, API-fixture policy, browser
   errors and actual target bounds. No generative redraw or reconstructed widget.

## Author the film around it

Use [NativeProductView](../../../studio/product/NativeProductView.tsx) for integer,
1× screenshot placement. Keep the product viewport unobscured at the evidence
sample frames. Use external instruction text, an explicitly separate cursor and
seeded annotation layer. Use [motion-cursors](../../motion-cursors/SKILL.md) for
anchored glyphs and frame-indexed press/ripple effects. Derive target positions from the capture metadata;
never guess where a recreated button would be. Do not scale different elements
independently, shorten native copy or recolor controls.

The Schoolbooks capture uses its existing Nuxt production build and the fixtures
from `apps/frontend/e2e/agent-findings.pw.ts`, completed with its settings response
shape and exact backend proposal wording. It executes Review action → actual
modal → Create follow-up task → native empty Needs attention state → History →
real Open follow-up task link. Its fictional invoice never becomes paid.

```bash
npm run capture:guide
npm run voice -- schoolbooks-feature-guide
npm run render -- SchoolbooksFeatureGuide --frames 30,120,183,195,270,399,415,450,531,540,570,633,719
npm run render -- SchoolbooksFeatureGuide
npm run test:productions
```

The capture script expects the actual app on `127.0.0.1:3214`; its header explains
the product-specific setup. For another repo, write a capture adapter for its
actual app; do not reuse the Schoolbooks screenshots or fixture responses.

## Acceptance

For guide productions, production.json requires `uiEvidence`: actual-capture
mode, provenance manifest, native placement and frame/state checks.
[verify-native-ui.mjs](../../../scripts/verify-native-ui.mjs) checks screenshot
hashes, capture provenance and actual RGB byte equality in the lossless master's
unobscured native UI region. No tolerance, offset search or element-level layout
change is allowed. Encoded delivery color conversion is separate; use the RGB
master for this check. This verifies selected UI states, not every animation
frame or a reference-film reconstruction.

Inspect the actual screenshots and encoded scenes. Confirm the viewer can find
every demonstrated control in the real product, and keep the guide narration
consistent with those observed states. Normal frame-count, sound, playback and
listening review still apply. Never mark an illustrative UI as an accepted guide.
