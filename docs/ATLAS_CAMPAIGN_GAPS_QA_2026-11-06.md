# Atlas campaign gaps: implementation and release verification, 6 Nov 2026

## Measured content changes

| Checkpoint | Previous parent branch | This branch | Change |
|---|---:|---:|---:|
| Mapped campaigns | 20 | 20 | 0 |
| Campaigns with phased histories | 12 | 18 | +6 |
| Operational phases | 37 | 55 | +18 |
| Dated events (researched and fully detailed) | 57 (50 detailed) | 76 (all 76 detailed) | +19 total, +26 detailed |
| Numerical source-bound facts | 42 | 56 | +14 |
| Campaigns with zero numeric fact | 6 | 0 | −6 |
| Single-day campaigns intentionally without subdivisions | 2 | 2 | unchanged |

The new dataset does **not** mean all 20 campaigns have complete numerical coverage. A source-scoped observation can be only a single rounded inventory, a non-comparable monthly return or a single day. The UI must state that qualification next to the number.

## Automated regression scope

- **Dependency-free build and data audit:** `node tests/build.cjs`: validates consistent cached output; 20 IDs, all 55 non-overlapping source-backed phase periods, one detailed dated event within every phase; source URLs, coordinates, date constraints, nonnegative quantities and source types.
- **Explicit non-additivity:** Stalingrad 300/500 **requirements** versus 117.6 **observed average**; Reich 389+95+178=662 and 580+83+177=840 all-cause monthly returns; Kursk 3,000 vs 2,000 approximate force commitments; Cassino 173+262=435 subset reconciliation and local town tons; Bagration force table 5,300/1,400; Berlin 7,500 rounded assembled force with disputed 2,738 aircraft/crews excluded.
- **Navigation and unrelated-data isolation:** `tests/grand-air-war-v80-interactions.cjs`: six new phased campaign-to-event-to-source drilldowns, 540 theatre/search/month/visibility intersections, nine map zoom values, Fit action, 12 loss-command/outcome/year charts, 36 Allied comparison combinations. Checks zero-result state and keeps existing 30 German month-command reports, 80 ETO/MTO USAAF rows, 5 Soviet snapshots and 68 American factory months unchanged.
- **Real Chromium:** `tests/grand-air-war-v80-browser.cjs`: desktop 1440×900 and mobile 390×844, rendered phase card and event text/source clicks for all 18 phased campaigns, all 20 dossier states, six new numerical/source journeys, search terms, zoom/fit/land polygons, no horizontal overflow or browser exceptions, independent research panel. Screenshots generated of full page, map and Italian Cassino guide at both viewport sizes.

## Test status and limitations

- `node tests/build.cjs`: **PASS locally** on 6 November 2026 (all seven reported suites, including 540 combinations and 9 map zooms).
- **Real Chromium discovered an in-scope UI defect** on the first PR run **42211793479 (failed)**: typing `Poland` in the campaign search selected *Bagration*, because the previous incrementally selected campaign happened to mention Poland in its phase narrative. The campaign picker now prioritizes an exact/leading/contained **campaign name** over a broad contextual reference; the controller suite adds incremental `P → ... → Poland` and `Berlin` regression checks. A fresh Chromium run against this fix is required.
- **Reporting-period QA:** the Stalingrad 117.6 tons/day estimate previously had an arbitrary `15 January` display anchor despite being a *seven-week average*. It now has a machine-checkable campaign-period start and a visible seven-week reporting-window label, with an explicit "not a single-day reading" warning; future multi-period facts may use the same optional `period` field rather than inventing a precise day.
- Playwright module resolves locally but **Chromium executable is not installed** in the workspace: running `node tests/grand-air-war-v80-browser.cjs` locally therefore produced an **environment blocker**, not a successful real-browser test. Browser test execution through GitHub Actions is required before marking this gate passed.
- Source research: the 435 Cassino bomber composition, 5,300/1,400 Bagration table, ≈3,000/≈2,000 Kursk force estimates, the 117.6 Stalingrad average, the 7,500 Berlin force estimate and Spaatz's 16 April order were independently checked against accessible institutional or publisher texts. **Not** all historical original scan pages were re-transcribed this turn. Existing German March and April RAF AHB figures rely on the previously documented image audit in `SOURCE_AUDIT.md`.
- GitHub workflow run, PR preview URL, mobile screenshots and post-publication review: **pending** and must be updated if obtained. A draft feature branch is not the published default Atlas.

## Known, not masked

- Berlin 16th Air Army source discrepancy: a US Air Force study cites 2,738 *aircraft*, whereas an annotated Soviet air-army reference gives 3,033 *aircraft* and 2,738 *experienced crews*. We explicitly omit that competing number rather than silently promote a likely unit-classification error.
- No complete two-sided aircraft losses, day-by-day Stalingrad airlift cargo, or equivalent dated fighter-serviceability record has been validated for the six campaigns. These absences are not zeros.
- Browser/CDN geography rendering must be judged with actual Chromium CI screenshots, not inferred from dependency-free tests.
