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

## Standing scope and subscription rules for every Work run

These rules apply to **every future Work assignment and generated handover/export**, not just the current milestone. The user's objective is a meaningful, tested result within their standard approximately €20/month ChatGPT Plus allowance.

1. **Agree and obey the scope:** state the one assigned deliverable, explicit out-of-scope work, acceptance tests and stop condition at the start. Deliver the assignment instead of starting open-ended research, extra features, additional aircraft, architectural rewrites or another project's work. Log tangent discoveries for later; do not act on them now.
2. **Budget-aware execution:** default to an economical available model at Medium reasoning; read only relevant sources and files. Prefer existing source indexes, tests and earlier research over large repeated searches. Do not load or paste huge archives, entire repositories, all screenshots or lengthy test output into the chat. The agent may not know the user's remaining allowance and must not promise a precise cost.
3. **Escalate only if it matters:** recommend High reasoning in one or two sentences only when a specific difficult scientific, historical or technical blocker warrants it. The user must select a different effort level; never auto-escalate or recommend Extra High for routine work.
4. **Keep Work sessions short:** long sessions caused size errors after roughly two assignments. Use a fresh Work run for each next substantial milestone; use current GitHub commits, PRs and documented next steps for continuity rather than a growing conversation transcript.
5. **Stop with a deliverable:** record what actually changed, before/after impact, tests actually run, PR/commit link, unresolved issues and exactly one suggested next milestone. Do not claim unrun tests passed or an unmerged branch is deployed. Stop after completing the task.
6. **Handover filenames:** use descriptive, human-readable names like `Project_Component_Milestone_Handover_YYYY-MM-DD.md`, **not `ZZZ_` prefixes** (those were a temporary file-finding trick). Future handovers should be short Markdown links to GitHub and the shared Hobby research Library, not duplicate multi-gigabyte ZIP exports unless explicitly requested.

## Chat-based research and source discovery (deliberate exception)

The strict scope, stop-condition and Plus-usage rules above govern **Work execution**, not normal **Chat** discussions or deliberately assigned document/source research in Chat. Do not transfer the Work budgeting constraints into Chat handovers.

- In Chat, when asked to research historical evidence, **actively follow relevant new leads**: footnotes, bibliographies, archival catalog references, scanned reports, citations to other original documents and meaningful contradictions. Continue expanding the search while the newly found material remains relevant and has a reasonable prospect of improving the answer or source coverage. Do not impose an arbitrary document count, search-depth cap, or requirement to stop at the first answer.
- A research trail may reveal a better primary source or a necessary related question; investigate it, explain why it matters and keep the provenance clear. Preserve original dates, variants/configurations, archival identifiers, exact report pages and evidence levels where available; distinguish verified scans from secondary transcriptions or speculation.
- **Relevant cross-aircraft branching and return:** for example, while researching Bf 109 stall speeds, if a historical report references stall speeds of other relevant fighters, follow and verify those leads too. Save *all* useful original figures, test configurations, citations/page numbers, correction status, reliability and unresolved conflicts in a durable research register and/or the shared Hobby research Library. Label side discoveries so they can be reused later. Then explicitly return to the original Bf 109 investigation and complete its findings. Do not silently import other variants' values into the Bf 109 model. For the Atlas, use `research/` source ledgers; for Physics, use `references/` registers and relevant `docs/` notes. If you cannot persist a finding, report that limitation and provide a copyable, sourced register instead.
- Chat exploration need **not** produce a GitHub code change or a Work-style milestone. Its natural stopping point is when relevant leads are reasonably exhausted, no longer productive or the user redirects the inquiry.
- Keep Work different: if source research is necessary to implement an agreed Work milestone, research only what is needed for that deliverable. Record additional promising sources and return to implementation rather than expanding into a new unassigned investigation.
