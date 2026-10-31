# Contributing

Use Node 24+, pinned pnpm 11.22.0, Python 3.11+, FFmpeg and local Chrome. Install
with the frozen lockfile and run the checks in [docs/TESTING.md](docs/TESTING.md).
Keep dependency versions pinned and retain their license notices.

Put films in projects/<slug>/ and shared techniques in studio/. Use explicit
compositions, named scenes, local fonts/media and absolute frame time. Do not
add wall-clock loops, unseeded randomness or render-time network requests.

Feature guides use actual product UI. Record route/build/viewport, measure real
DOM targets and keep fictional data isolated. Do not submit private product
source excerpts, customer records, credentials or assets without redistribution
rights. Local reference videos, captures, models, evidence and exports stay
ignored. Add source/license provenance for new public media.

Include meaningful regressions for changed acceptance, audio or animation
logic. Inspect native and preview-size scene/transition frames for visual
changes. A numerical test cannot establish visual or listening quality. Never
relax exact RGB/PTS acceptance to accommodate a mismatch.

Use focused Conventional Commits (feat, fix, test, docs, ci). Explain behavior,
validation and any remaining limitations in a PR. Contributions to original
code are under the repository's MIT license; third-party license exceptions
remain in force. Do not include the local optional media in release archives.
