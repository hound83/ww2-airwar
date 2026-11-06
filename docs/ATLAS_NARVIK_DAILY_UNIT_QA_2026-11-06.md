# Narvik daily-unit evidence QA, 6 November 2026

## Before/after, against prior reviewed operational-evidence branch

| Measure | Before | This milestone |
|---|---:|---:|
| Campaigns and operational phases | 20 / 55 | 20 / 55 |
| Existing campaign-wide source-scoped numbers | 65 | 65 (unchanged, deliberately not double-counted) |
| Researched single-event dossiers | 78 | 78 (unchanged) |
| Narvik dates with individually browseable daily RAF source comparison | 0 | **18** |
| Days with AHB area sorties + combats + RAF own losses all documented | 0 | **13** |
| Daily AHB table entries | 0 | **16** |
| Unit-diary-specific sortie quantities (includes qualified figures and reported zeroes) | 0 | **9** |
| Original-source day conflicts explicitly surfaced | 0 | **2** (25, 26 May) |
| Distinct linked Narvik unit-return research sources | 0 | **2** (AHB and AIR 27/1547 transcription) |

Counts represent **new structured daily research coverage**, not 18 new missions or confirmed German losses. One AHB datum may cover area fighter activity while the squadron observation is only No. 263; they are compared, not summed. The two original documents are NOT both direct digitized Form 541 scans.

## Acceptance and limits

- `node scripts/build-web.cjs` and `node tests/build.cjs`: verify the generated route, 20 campaigns, 55 phases, 65 legacy facts, 78 legacy detailed events, 540 search/month/filter combinations, interactive source paths, and 18 Narvik date entries.
- New numeric invariants validate 16 AHB date rows, 13 complete triplet rows, AHB's 594 precise sorties plus about 50 separately, 25/26 May discrepancies, 3–5 June No. 263 grounded while area flying continued, and non-equivalence of **Nil**, blank and absent days.
- Browser Chromium desktop **1440×900** and mobile **390×844**: should inspect all 18 selectable records, date click detail, contradictory dates, direct source links, no overflow and no data carryover when switching campaigns. Generate screenshots for inspection; attach test results only when actually run.

**Local execution status:** Node/static/controller suites passed. Local Playwright installed but browser executable unavailable; GitHub Actions Chromium status pending. Original manuscript facsimile, matching German daily return and independent aircraft-loss reconciliation remain incomplete and are not certified by code tests.
