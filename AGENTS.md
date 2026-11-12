# Coding-agent instructions — European Air War Atlas

These instructions apply to `hound83/ww2-airwar`, the **historical website**. The aircraft physics solver is a different repository and must not be modified unless explicitly requested.

## Assignment checklist and recovery

- Before starting a new repository assignment, save a temporary Markdown task log. Turn the prompt into a `- [ ]` checklist with one item per requested outcome. Capture the constraints, acceptance checks, and delivery steps needed to reconstruct the assignment. Record the repository and starting branch or commit when known. Update the same log when the user changes the scope.
- Keep the log private and outside the Git checkout. Use a location that survives a new chat or checkout. In ChatGPT Work, use the user's Library when available. Otherwise use a persistent `codex-task-logs/` folder. Name the file `task-log--<owner>--<repo>--<UTC-timestamp>--<short-task>.md`. For cross-repository work, use `multi-repo` in the filename and list the repositories in the log. Share the link or path at the start and in the final reply. If only transient storage is available, save there and state the recovery limitation. Omit credentials and unnecessary personal details.
- Mark each item `- [x]` once its outcome is verified. Add brief evidence such as a file path, test result, commit, PR, or verified live link. Save the log at each meaningful checkpoint with the current branch, commit, or worktree location as applicable. Keep open items unchecked and record any blocker and the next concrete action.
- When resuming, open the existing log and verify the checkpoint against the current repository state. Before the final reply, reconcile the checklist with the latest request. Record `Done` when all requested outcomes are verified, or `In progress` or `Blocked` with the remaining work. Leave the log available for the user's review.

## Mission and autonomous milestones

- Work toward a historically informative, coherent and genuinely usable Atlas. For substantial implementation requests, own **one substantial end-to-end website milestone**: investigate, fix or build, integrate, test user journeys, repair problems, and document what changed. Keep explicitly small fixes narrow.
- Define the user-facing outcome, pre-change baseline, reasonable acceptance checks and non-goals. A milestone can contain several related corrections and UX/data improvements. Do not stop after a minor patch or propose obvious next steps that are already within the assigned outcome.
- Prioritize actual information value and correctness above extra controls, decorative features, version bumps or superficial event listings. If the request concerns a campaign, make the campaign understandable from context through key events, chronology, locations, participants, losses and sources, rather than merely displaying that something happened.
- Stay inside the authorized website milestone. Put unrelated findings into `docs/STATUS_AND_NEXT_STEPS.md` or the appropriate research ledger. Ask the user only for material product direction, missing authority or a true blocker.
- For standalone historical research requests, follow promising source leads, preserve their provenance and contradictions, and return to the original question. This is not authorization for unrelated code changes.

## Orientation and source-of-truth files

- Inspect current git/PR state and `README.md`. Use `docs/STATUS_AND_NEXT_STEPS.md` for active priorities, `docs/ATLAS_PHYSICS_INTEGRATION.md` for the physics boundary, and `DATA_NOTES.md`, `SOURCE_AUDIT.md` and the applicable `research/sources/` records for historical-data work. Read **relevant sections**, not every archive on every task.
- Treat release versions, preview routes and current datasets as **current repository facts**, not fixed values copied from an old chat. Check the actual deployed state when a task concerns public behavior.
- Preserve the existing static HTML/CSS/JS architecture unless a tested, compelling reason justifies changing it.

## Historical integrity

- Keep recorded, derived, interpolated, estimated, modeled and missing values distinct in data, charts, aggregates and exports. Never fill unknown months with zero or turn a source disagreement into false certainty.
- Do not mix fighter-only with all-aircraft counts, strength with serviceability, aircraft with pilot losses, country/global with theater, claims with verified losses, or data from unrelated dates and formations.
- For historical figures retain date, theater, population, exact source/page/URL and confidence. Preserve original source audits, archival records, credits and licenses. New features should improve provenance visibility, not hide difficult data.
- A battle/campaign page must answer useful historical questions and connect relevant events to evidence; do not surface isolated trivia or unrelated units/timeframes just because they exist in the database.
- **Persist research, not just implementation:** for each research task, commit the relevant findings to the existing `research/sources/` records or a suitable source audit/data note, even when no feature uses them yet. Preserve reusable extracted figures and definitions, original source IDs/links/pages, reporting scope, confidence, contradictions, useful negative findings and remaining gaps. Prefer small CSV/JSON datasets plus concise Markdown explanations; summarize lengthy investigations without discarding the evidence needed to reproduce or reuse them. Link to original archives instead of committing large scans, PDFs, downloaded pages or redundant research dumps.

## Build and verification

1. Reproduce important existing user journeys and data outcomes before changes; capture concrete broken cases and expected behavior.
2. Edit maintained files in `dist/` and rebuild the generated root entry with `node scripts/build-web.cjs`; do not hand-edit the generated root `index.html`.
3. Run `node tests/build.cjs` and the applicable test scripts documented in the current repository. For interaction/UI changes, run its browser smoke tests where available.
4. Test actual user journeys through geography → theater/campaign → timeline/events → supporting details and source views. Exercise representative filters, dates, units, aggregation levels, map zoom, pointer/touch/keyboard and mobile widths. Check both non-empty and genuinely missing-data scenarios.
5. Inspect before/after screenshots and outputs where visual or data changes warrant it. Repair in-scope problems, rerun affected tests and report untested limitations honestly. A green build alone is not historical or UX verification.

## Physics integration boundary

- `hound83/WW2-Aircraft-Physics-Simulator` owns new physical equations and validation. The Atlas's embedded physics asset is a separately pinned research snapshot, not proof of a validated solver.
- Never silently substitute experimental physics. Integration requires an explicit request, a reviewed/versioned solver artifact, documented provenance and limitations, compatibility tests and rollback as described in `docs/ATLAS_PHYSICS_INTEGRATION.md`.

## Git, autonomous publication and delivery

- Use a feature branch and reviewable PR for substantial website work; preserve `main`, any current preview and uncommitted changes. Do not force-push. Do not promote a preview to public default unless the authorized milestone explicitly covers that promotion.
- For research-only documentation/data-capture PRs, check source links, captured values, provenance and affected data schemas plus repository-required CI; do not impose website UX/deployment gates when no deployed behavior changes. Merge verified research PRs without calling them an Atlas feature release.
- **Standing owner authorization:** for an authorized website implementation milestone, **merge the tested PR and publish through the existing GitHub Pages process** once all applicable release gates are met. No separate GO is required for this ordinary completion. A preview-to-default promotion or cross-repository physics integration still requires the milestone to **explicitly target** that product change; do not infer promotion from a generic UX request.
- **Required gates:** the complete intended historical/user journey passes; source/provenance and temporal/geographical/formation consistency are verified; generated root is rebuilt; relevant Node and browser interaction checks pass; major viewports, map/filter/data states and accessibility inputs are checked; required GitHub CI checks pass on the exact revision; no unapproved source changes, blocked data integrity issues or high-severity regressions remain. Inspect the diff and know the prior deployable revision.
- Respect branch protection, required reviews, permissions and deployment approvals. If any mandatory check cannot be performed or verified, leave the PR open and report the exact blocker; never bypass the gate.
- After merge, inspect the **live public route**, including the affected campaign/chart/filter journey. Distinguish the verified default experience from any opt-in preview. If deployment or the live route fails, repair safely or explicitly report incomplete publication.
- Prefer one *substantial but bounded* milestone per execution assignment. Avoid dragging huge research archives into chat; continue via committed GitHub documentation and checkpoints if the session reaches limits. This is not an instruction to stop after the first small fix.
- Short final report: completed user-visible outcome; measured/observed before/after; tests and browser scenarios actually run; PR/merge/live links; open risks or a precise interruption checkpoint. Do not create micro-releases merely to show activity.

