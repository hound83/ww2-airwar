# Start a fresh European Air War Atlas conversation

This page is the small, always-current alternative to handing over a complete chat, a physics archive or hundreds of pasted files. **The website code and research records live in GitHub.** Read the repository at the start of each new chat.

## Preferred starting configuration

- **Chat:** discuss the next website features, priorities, historical data questions and design decisions. No giant handover upload.
- **Work:** implement a single scoped GitHub task, execute tests, inspect the UI and create a PR. **Start a fresh Work conversation for the next milestone if session size/usage becomes a problem.**
- Start with an economical supported model and Medium reasoning. Ask the user to raise effort to High only for genuinely difficult technical or historical conflicts; do not assume any specific named model is available.
- Keep all substantive knowledge in GitHub README/AGENTS/docs and all code in Git commits. User prefers results within a standard Plus subscription.

## Copy-paste prompt: website planning (Chat)

> Continue the **European Air War Atlas website** from GitHub: https://github.com/hound83/ww2-airwar. This is **not** the aircraft physics development project, which is separately managed at https://github.com/hound83/WW2-Aircraft-Physics-Simulator. Read the **latest** README.md, AGENTS.md, docs/STATUS_AND_NEXT_STEPS.md and docs/ATLAS_PHYSICS_INTEGRATION.md; inspect current main/PRs and the public v7.4 plus opt-in v7.5 preview. Preserve historical sourcing and the existing v2.4 embedded physics snapshot. I want to improve the Atlas UI, historical analyses, navigation and data independently of physics v3.0. Help me choose a coherent next improvement, with specific scope and acceptance criteria. Keep the discussion focused and economical. Do not rewrite the physics engine.

## Copy-paste prompt: single implementation milestone (Work)

> Work only in the Atlas repository https://github.com/hound83/ww2-airwar, using its **latest remote branch/PR state**. Read README.md, AGENTS.md, docs/STATUS_AND_NEXT_STEPS.md, docs/ATLAS_PHYSICS_INTEGRATION.md and relevant research documentation. Implement **[INSERT ONE COHERENT WEBSITE IMPROVEMENT]** on a feature branch. Preserve the public v7.4 default, the opt-in v7.5 preview, source confidence categories and the frozen v2.4 simulator. Do not edit the separate physics repository. Rebuild generated HTML, run the relevant Node tests and browser checks where available, open a reviewable PR and update status documentation. Deliver a concise summary of what changed, what was actually tested, the PR link and the next recommended step. Do not dump files or long logs into chat.

## What the new chat must understand

- **Two separate projects:** Atlas website vs independent physics model. The physics repo's v2.5 baseline and v3.0 scientific effort must not block Atlas UX or historical-data development.
- **Current site:** v7.4 default; v7.5 preview via `?preview=7.5`; the four-aircraft research physics v2.4 currently appears in Atlas, but remains scientifically provisional.
- **Site-specific development:** chart readability, source transparency, historical data coverage, pilot simulation, maps/campaigns, navigation, mobile/a11y, coherent user experience.
- **Historical claims:** model assumptions and missing data must not be disguised as measured values; documentation contains unresolved contradictions and provenance.
- **Versioning:** prefer feature branches, tested PRs and a stable main. Avoid handover ZIPs except occasional explicit archival backups.
- **Work size:** the user has experienced "chat too large" errors after two Work assignments. Do not upload/re-read the 120MB physics handover and don't produce huge tool-output dumps. Fresh short tasks are preferable; GitHub preserves continuity.

## Links

- Site: https://hound83.github.io/ww2-airwar/
- v7.5 preview: https://hound83.github.io/ww2-airwar/?preview=7.5
- Atlas source: https://github.com/hound83/ww2-airwar
- Physics source: https://github.com/hound83/WW2-Aircraft-Physics-Simulator
- Historical source audit: `SOURCE_AUDIT.md`
- Prior original release narrative: `docs/ARCHIVE_README_BEFORE_2026-10-30_CLEANUP.md`

The new chat should derive the **current** status from GitHub, not rely on frozen dates/commits in this document.
