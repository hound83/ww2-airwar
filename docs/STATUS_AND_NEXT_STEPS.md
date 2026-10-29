# Atlas status and next work

**Review date:** 30 October 2026. This document is a website work queue, not the physics research roadmap. Refresh it whenever an Atlas milestone is accepted. Read `README.md` first.

## Verified repository baseline

- Main before this documentation cleanup: commit `b771212b986f4326e1202016d68f8da08b9103b6` (29 October 2026).
- Default GitHub Pages experience: v7.4. v7.5 is opt-in through `?preview=7.5`.
- Current Atlas aircraft simulator embeds `physics/research-model-v2.4.html`. Both default and preview use that research snapshot, despite separate v7.5 source-evidence/illustrative lab controls.
- Historical source-backed v7.5 performance registry: **4** transcribed test configurations, **89** placeholders, **2** illustrative reference models, **55** speed/climb points. Original-scan independent verification remains incomplete.
- The related physics repo `hound83/WW2-Aircraft-Physics-Simulator` imports v2.5 and is preparing v3.0. The Atlas does not contain its current development source; its results cannot be assumed validated.
- Existing v7.5 browser test exercises mouse, touch, keyboard graph interactions and 390px layouts; standard test suite includes 12 dependency-free Node test scripts plus build reproducibility.

## Suggested Atlas roadmap (proposals, not approved scope)

### Priority 1 — clean, usable site, independent of physics

1. Evaluate v7.5 homepage/navigation usability against default v7.4; fix conspicuous mobile and desktop problems with screenshots and actual browser checks.
2. Audit typography, chart readability, accessible labels, responsive widths, tooltips and discoverability across the primary historical tabs.
3. Remove accidental duplicated UI/wording, not source-backed data or source attribution. Preserve the missing-data display and provenance distinctions.
4. Keep v7.4 functioning until the user explicitly chooses to promote v7.5.

### Priority 2 — historical substance

1. Improve search and presentation of the Research Centre, including direct source visibility and uncertainty language.
2. Extend documented RAF, Luftwaffe, USAAF and VVS coverage where original sources establish actual reporting populations and dates; never fill unavailable months with zero or silent interpolation.
3. Reconcile the historical data backlog in `research/sources/v75-research-ledger.md`, `SOURCE_AUDIT.md` and `DATA_NOTES.md`; do not repeat completed archival work.
4. Improve campaigns/map only when it materially helps navigation and geographic comparability; existing map is an offline Natural Earth-based locator, not verified unit-level positions.

### Priority 3 — intentional physics integration (when released)

1. Wait for an explicitly labeled, source-audited and tested physics release.
2. Verify named aircraft variants, engine rating, weight, airspeed units and test conditions; do not reinterpret the model's uncertainty.
3. Pin a physics release tag or exact commit, copy/export a compatible static asset only after reviewing license/size/API and preserve the v2.4 fallback.
4. Test root default, v7.5 preview, standalone model and mobile interaction. Document released model version and evidence/validation limits in the UI.

## Known issues and intentional limitations

- **Not a finished historical flight-physics model:** current embedded v2.4 retains unresolved turn, propeller and Mustang climb uncertainty. Physics v3.0 development belongs to the other repository.
- **The performance registry is evidence, not an aerodynamic solver:** four transcribed configurations are useful historical comparison points but aren't independently calibrated in the Atlas.
- **Historically sparse datasets:** fighter-only vs all-aircraft, serviceable vs on-strength, operational vs total strength, and worldwide vs European reporting scopes must not be conflated.
- **Conflicting archival/secondary figures:** retain alternative readings and explicit reporting boundaries, including historical corrections recorded in `SOURCE_AUDIT.md`.
- **Navigation and preview:** v7.5 remains opt-in. Do not silently change the default public experience.
- **Photo licensing:** preserve `research/sources/visual-credits.md` and local font license documents.
- **Browser test setup:** dependency-free Node suites alone do not prove interactive/browser functionality. Playwright + Chromium are separate optional/preview CI checks.

## Development rhythm to prevent huge Work conversations

- **Chat** for specifying UX decisions and reviewing small screenshot-based comparisons.
- **Work** for one bounded implementation task, e.g. "Improve v7.5 navigation/accessibility without modifying physics or the default site." End after tests, PR and a 5–10 line summary.
- Start another **short Work task** for the next independently verifiable change. GitHub carries the knowledge; no giant handover ZIP after every task.
- On each assignment: inspect latest `main`, PRs and docs. Avoid importing the 120 MB physics archive or dumping full source and test logs into the chat.
