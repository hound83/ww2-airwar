# Atlas development guidance for ChatGPT Work and coding agents

This file applies to **hound83/ww2-airwar (website)**, not to the separate physics solver.

## First minute in every assignment

1. Check the GitHub repository, branch and latest commits/PRs. Do not assume that an earlier chat's snapshot is current.
2. Read `README.md`, `docs/STATUS_AND_NEXT_STEPS.md`, `docs/ATLAS_PHYSICS_INTEGRATION.md` and, for historical data tasks, `DATA_NOTES.md`, `SOURCE_AUDIT.md` and applicable `research/sources/` files.
3. Identify the smallest coherent website deliverable. Avoid taking on the parallel physics v3.0 research program.
4. Create an appropriate feature branch, preserve local uncommitted work and keep `main` runnable.

## Development boundary

- **May modify:** website/UX/CSS/navigation, historical datasets and source metadata, pilot scenarios, maps/timelines, front-aware analysis, responsive charts, accessibility and website tests.
- **Must not modify without explicit request:** `hound83/WW2-Aircraft-Physics-Simulator` source, its scientific assumptions or its experimental results.
- The Atlas `physics/research-model-v2.4.html` is an existing **frozen research snapshot**; do not present it as a validated v3 engine or swap it based on unreviewed physics branch changes.
- For actual integration read `docs/ATLAS_PHYSICS_INTEGRATION.md`. Version pinning, source labels and rollback are mandatory.

## Source integrity

- Recorded, derived, interpolated, estimated, modeled and missing values have distinct meanings. Retain them throughout display, aggregations, CSV and APIs.
- Do not fill missing months with zero, or mix fighter-only with all-aircraft, strength with serviceability, pilot with airframe losses, worldwide with theater-specific data, or credited claims with verified losses.
- For external research preserve original URLs, reporting population, coverage, dated source and verification status. Consult relevant original scans where the task requires verification.
- Do not remove historical evidence, archives, photo credits or font license documents as “clutter.” The old full README is archived under `docs/`.

## Site engineering

- Keep the current static HTML/CSS/JS architecture unless there is a compelling, tested reason to change.
- Edit `dist/index.html` or individual `dist/` modules, **then run** `node scripts/build-web.cjs`. The root `index.html` is generated.
- Run `node tests/build.cjs` and the dependency-free tests under `tests/` listed in the README. Browser/interaction changes also need Playwright + Chromium validation where available.
- Review all generated changes and do not include screenshots, test-output files or huge archives in normal commits.
- The default published route is v7.4 and `?preview=7.5` is opt-in. Do not promote preview without explicit user instruction.
- Preserve mobile, pointer, touch and keyboard interactions, responsive chart viewports and direct source readouts.

## GitHub-first, Plus-efficient execution

- Prefer **one short, bounded Work run per implementation milestone**. Long Work conversations have caused chat-size errors after only a few assignments; continuing them indefinitely is not a requirement.
- Use ordinary Chat for planning/decision making and Work for code execution, repository edits and browser QA. Always finish with tested commits and a reviewable PR.
- At the end provide at most: summary of user-visible changes, test pass/fail, GitHub PR/commit URL, remaining blockers, next milestone. Do not paste complete logs, full source files or large data tables into the chat.
- Store ongoing decisions, test status and next work in `docs/STATUS_AND_NEXT_STEPS.md`, and scientific/provenance detail in existing research docs. These Git files replace repeated 100+ MB handover ZIPs.
- Reasoning default: use an economical supported model/Medium effort for routine work. Recommend High only if deeper analysis is likely to resolve a material blocker. The user changes settings, not the agent.
- Never claim a CI, browser test or deployment succeeded without the corresponding evidence. Do not force-push or merge risky work automatically.
