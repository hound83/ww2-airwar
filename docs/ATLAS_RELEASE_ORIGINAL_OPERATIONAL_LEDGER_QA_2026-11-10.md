# Atlas new live-release gate and original-operational-ledger before/after
Date: 10 November 2026. Scope includes public default-route promotion and research from immediately preceding PR #18.

## What changed
| Metric | Before (PR #18) | Release candidate | Net |
|---|---:|---:|---:|
| Historical campaigns | 20 | 20 | 0 |
| Operational campaign phases | 55 | 55 | 0 |
| Source-scoped numerical observations | 108 | **127** | **+19** |
| Detailed dated events | 80 | **82** | **+2** |
| Original German archival source series directly catalogued | previously diffuse pointers | **3 focused quartermaster series** (west June 1944, east Sep–Dec 1943, entire Luftwaffe serviceability 1938–45), plus June Luftflotte 3 situation reports | authoritative research trail |
| Bagration Soviet 16th Air Army serviceable/category/crew/daily evidence | 0 unit-day observations | **13 unit-scoped observations** | +13 |
| Normandy Luftflotte 3 additional dated sortie-category observations | 0 for this original-report window | **6** | +6 |

Source register: research/sources/atlas-german-soviet-original-operational-ledgers-2026-11-10.md.

## User-visible behavior
- Root public page `/` now redirects to the current **Grand Air War campaign explorer** (with map, phase navigation, source-based fact cards and separate research library), not the old standalone pilot attrition presentation.
- The original pilot/aircraft interface is **not deleted**: `/?legacy=1` preserves it. The ongoing v7.5 preview remains available at `/?preview=7.5`. The live campaign page links back to the legacy lab.
- Main Atlas source evidence is unchanged in scope except the 19 new facts; original historic data remain attached to the right campaign, army and date.
- No change to the frozen aircraft flight-physics snapshot or the separate simulator repository.

## Tests executed / proof
- **PASS**, GitHub Atlas Core Checks run https://github.com/hound83/ww2-airwar/actions/runs/42719067762, commit a7d5338bf6b7ecc7cc125702487d81d9541433d9. Reproducible build, source integrity, original vs derived counts, no duplicated missing losses, 20 dossiers and 540 filter intersections, nine map zoom levels, German/Soviet arithmetic and chronology.
- **PASS**, GitHub Chromium desktop/mobile browser suite https://github.com/hound83/ww2-airwar/actions/runs/42719067743, same code commit, testing 1440x900 and 390x844, **root new default and legacy route**, original Poland, Germany, Norway, Bagration, Sicily, Normandy event and source navigation, dashboard filter and map checks and overflow guards.
- Prior in-progress CI failure fixed: the old Bagration two-figure test was updated to validate its pre-existing order-of-battle estimate separately from the new Soviet unit-day series.
- No raw PDF visual render of several RAF German tables was completed (web screenshot backend failed), so the archival URLs are recorded but ambiguous OCR cells were **not** imported.

## Publication checklist
1. Confirm mergeable with current `main` and new CI green.
2. Merge vetted PR #19 into `main` preserving main history; do not force-push.
3. Verify that the public GitHub Pages URL uses the new default and actually contains the campaign explorer. If that cannot be observed, report deployment verification incomplete, not live.
4. Rollback options: use `/?legacy=1` immediately for old presentation; revert the default redirect and research code via a new tested PR if live failures occur.

**Notes:** The root refresh uses a normal relative redirect. Any non-empty legacy query remains on the old app, preserving existing saved scenario URLs. The published German sortie category headline differs by ten from its reported component sum, explicitly flagged rather than fabricated.
