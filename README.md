# European Air War Atlas (1936–May 1945)

A source-led, interactive historical atlas of WWII European airpower: aircraft and pilot strength, losses, claims, manufacturing, operations, campaigns and exploratory simulations.

**[Open Atlas](https://hound83.github.io/ww2-airwar/)** · **[Preview the developing v7.5 interface](https://hound83.github.io/ww2-airwar/?preview=7.5)** · **[Historical data notes](DATA_NOTES.md)** · **[Source audit](SOURCE_AUDIT.md)**

> **Current status (30 October 2026):** The default site remains the v7.4 presentation; the opt-in v7.5 preview is a work in progress. The aircraft simulator view embeds an independently hosted-in-this-repository **frozen research physics v2.4 page**. This is not a validated final aircraft-performance model. No v3 physics results have been integrated.

## Start here (maintainers and new chats)

- [**Project status, roadmap and outstanding work**](docs/STATUS_AND_NEXT_STEPS.md)
- [**Architecture, repository boundaries and physics integration contract**](docs/ATLAS_PHYSICS_INTEGRATION.md)
- [**Instructions for development agents**](AGENTS.md)
- [**Concise prompt for a new Chat/Work session**](docs/NEW_CHAT_START_HERE.md)
- [**Full previous README / release history (preserved verbatim)**](docs/ARCHIVE_README_BEFORE_2026-10-30_CLEANUP.md)

The website and physics solver now have **separate owners and separate GitHub repositories**:

| Responsibility | Authoritative repository |
|---|---|
| Atlas UX, historical datasets, pilot scenarios, visualizations, maps and hosting | **This repository:** [hound83/ww2-airwar](https://github.com/hound83/ww2-airwar) |
| Flight-physics equations, four-aircraft scientific validation, new model releases | [hound83/WW2-Aircraft-Physics-Simulator](https://github.com/hound83/WW2-Aircraft-Physics-Simulator) |

**Do not copy physics experiments into Atlas automatically.** The included `physics/research-model-v2.4.html` is a site-compatible snapshot until a separately validated release is deliberately integrated.

## What the Atlas covers

- Historical aircraft inventories, serviceability, front-aware strength comparisons and production.
- Fighter-pilot attrition, replacement and experience, with explicitly labeled scenario assumptions.
- Dated captured German loss returns, Allied factory acceptances, sortie records, claims and archival source trails.
- Campaign timeline, geographic map, historical research views and downloadable observations.
- A historical performance-evidence registry in the v7.5 preview, **separate from** the research physics model.
- An aircraft simulator page using the frozen four-aircraft v2.4 research interface, and a separately labeled illustrative engineering sandbox in the v7.5 lab.

Historical coverage is incomplete by design. **Unobserved does not mean zero.** Source-reported measurements, derived values, interpolation, estimates and scenarios must remain visually and structurally distinct. See [DATA_NOTES.md](DATA_NOTES.md) and [research/sources/v75-aircraft-performance.md](research/sources/v75-aircraft-performance.md).

## Architecture

This is a **static GitHub Pages site** (HTML, CSS, JavaScript; no backend/database). Avoid unnecessary framework migrations.

| Location | Purpose |
|---|---|
| `dist/index.html` | Editable modular HTML entrypoint (not the hosted root) |
| `dist/atlas*.js`, `dist/model*.js`, `dist/*.css` | Website modules, historical datasets, views and simulation code |
| `index.html` | **Generated** GitHub Pages entrypoint with reproducible asset cache keys |
| `physics/research-model-v2.4.html` | Frozen hosted research physics snapshot; do not confuse with physics repo |
| `research/transcriptions/` | Source-backed canonical research input records |
| `research/sources/` | Evidence, rights, outstanding source verification and provenance |
| `scripts/build-web.cjs` | Rebuilds performance data and hosted `index.html` |
| `tests/` | Data, build, rendering, source-coverage and interactive regression checks |

The v7.5 registry currently includes four source-transcribed test configurations, 89 research placeholders and two illustrative references. The four source-transcribed configurations are **not** independently calibrated model results.

## Develop and verify

Node.js **22+** recommended. No npm install required for standard tests.

```sh
node scripts/build-web.cjs
node tests/build.cjs
for test in tests/data.cjs tests/v6.cjs tests/v7.cjs tests/v71.cjs tests/v72.cjs tests/v73.cjs tests/v74.cjs tests/render.cjs tests/tooltips.cjs tests/v75.cjs tests/v75-model.cjs tests/v75-aircraft.cjs; do node "$test" || exit 1; done
```

Optional full browser smoke test (requires Playwright and Chromium): `node tests/v75-browser.cjs`. On Windows, run the listed Node tests individually or use a suitable shell. The automated pull-request CI runs the dependency-free checks; the existing v7.5 preview workflow covers browser interactions on its configured preview branches.

Do not edit `index.html` directly as the source of truth; edit modular assets or `dist/index.html` and rebuild. Confirm the generated `index.html` and performance data are in the reviewed diff.

## GitHub-first workflow

Keep `main` runnable. Work in small feature branches and submit focused pull requests, with a tested diff and updated [status notes](docs/STATUS_AND_NEXT_STEPS.md). Prefer **a fresh, bounded Work assignment for each coherent implementation milestone** if long Work conversations cause size errors; GitHub and committed docs carry continuity. A brief Chat conversation is sufficient for planning. Avoid uploading the massive physics research ZIP or printing multi-megabyte logs in the conversation.

## Historical research and prior releases

The complete prior README is kept [unchanged here](docs/ARCHIVE_README_BEFORE_2026-10-30_CLEANUP.md). Read [DATA_NOTES.md](DATA_NOTES.md), [SOURCE_AUDIT.md](SOURCE_AUDIT.md), the [research ledger](research/README.md) and [v7.5 integration log](research/sources/v75-integration-log.md) before treating numbers as historically established. The site may show sourced **claims**, which are not equivalent to independently verified enemy losses.

**License:** This repository currently has no project-wide software license selected. Do not assume content, code or historical-image rights beyond documented asset credits.
