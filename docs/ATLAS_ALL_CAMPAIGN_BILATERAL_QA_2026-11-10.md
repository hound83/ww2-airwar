# Reciprocal-loss evidence audit and end-to-end QA (10 November 2026)

## Outcome and historical release criteria
Every European Air War Atlas campaign is reviewed as a source-scoped opposing-force investigation, and every dated event carries an explicit source status. **Coverage status does not mean actual bilateral data exists.** A claim, a destroyed aircraft, a damaged aircraft, assigned strength, a sortie, and a serviceable aircraft are different measurements. Never generate an aircraft kill ratio unless loss date, geographical and organizational population, cause and write-off thresholds match.

### Before / after relative to current public main
| Metric | Before | New branch | Delta |
|---|---:|---:|---:|
| Campaigns | 20 | 20 | unchanged |
| Operational chapters | 55 | 55 | unchanged |
| Source-scoped campaign numeric facts | 127 | **135** | +8 |
| Research-backed dated events | 82 | **83** | +1 |
| Explicit cross-side comparison studies in campaigns | 7 across 4 campaigns | **14 across 11 campaigns** | +7 studies / +7 campaigns |
| Campaign-level opposing evidence statuses | 0 | **20** | +20 |
| Event-level exact-date opposing evidence status | 0 | **83** | +83 |
| Official 1947 parliamentary German-vs-RAF comparison series | 0 | 5 campaign periods + 7 battle dates | +12 structured source rows |

### Reality check: quality of the 83 event-level source matches
- **4** have both sides' same-day reported own-aircraft-loss evidence: Battle of Britain 18 Aug 1940, Dieppe 19 Aug 1942, Schweinfurt 14 Oct 1943 and Bodenplatte 1 Jan 1945. Differences of fighter/bomber classes, 'lost' versus destroyed, damage/write-off rules, source and area remain stated; no mathematical ratio is generated.
- **2** have RAF claims against source-recorded German losses: Battle of Britain 7 and 15 September 1940. Neither is RAF own losses versus Luftwaffe losses.
- **21** have day-specific numbers only for incomplete/opponent-mismatched populations. These remain partial.
- **56** have no trustworthy directly matched daily numeric counterpart. The interface says so explicitly rather than projecting campaign-month figures onto an individual day.
- These four statuses sum **83**, and every one is tested in the real browser.

### Seven additional source-grounded comparison studies
- Poland September 1939: assigned/estimated Polish 300 aircraft vs German fighter/bomber lower bound 1,300, not compatible serviceable fighter inventory.
- Malta April 1942: RAF 44 aircraft destroyed on ground vs Luftwaffe 45 lost under wider cause classification, not a reciprocal attrition ratio.
- Kursk July 1943: assigned Soviet ~3,000 vs German ~2,000 in specified formations, not daily serviceability.
- Bagration June 1944: assigned Soviet 5,300 vs German 1,400 at opening, not directly comparable with narrower 16th Air Army day serviceability 2,319.
- Dieppe 19 August 1942: RAF 106 own aircraft lost, 48 German destroyed, 24 German damaged. German damaged not added to destroyed.
- Schweinfurt 14 October 1943: USAAF 60 bombers shot down; Germany 31 fighters destroyed + 12 written off + 34 damaged (different status categories); US bomber claims of 186 German aircraft explicitly unverified.
- Bodenplatte 1 January 1945: Allied 224 destroyed vs about 300 Luftwaffe lost, uncertainty and Eindhoven smaller geographic subset preserved.

### New historical source conflict discovered and recorded
Official House of Commons/Hansard 14 May 1947: five printed period rows sum **1,760** German destroyed / **657** German damaged, while the parliamentary published **TOTAL** is **1,733 destroyed / 643 damaged**. Disagreements of **27** destroyed and **14** damaged. RAF claims sum exactly to the printed **2,692**. The Atlas reproduces both with an explicit contradiction banner; does NOT silently force totals or invent a correction. A second cross-source difference: RAF Museum 18 Aug 1940 **69 German aircraft destroyed or damaged beyond repair** versus 1947 Parliamentary figures **71 destroyed and 23 damaged**. They do not share a reliable write-off threshold.

Sources and boundaries are retained in `research/sources/atlas-all-campaign-bilateral-evidence-audit-2026-11-10.md`.

### Important coding correction from full event audit
A numeric row dated 31 October 1940 represented **July–October** fighter losses and was initially misclassified as a 31 October single-day observation. The exact-day logic now explicitly rejects all facts with a nonempty reporting `period`, even if their date matches the selected event. This invariant is regression-tested.

### Testing and release
- Core/data tests: check full campaign inventory, exact day source links, Hansard 5+7 rows, both discrepancy arithmetic checks, preserved missing-data semantics, preserved independent German/Soviet source populations and existing filter/zoom matrix.
- Controller matrix: opens all 20 campaigns and all 83 dates, verifies a source-status badge/panel for every event, checks claims versus recorded and real own-loss matches; ensures cumulative fighter totals do not appear as 31 October daily losses.
- Chromium actual browser on desktop 1440×900 and mobile 390×844: exercises original filters, country/theater and zoom navigation, all 20 campaign coverage banners and all 83 dated event statuses, key source links and day tables, console errors and horizontal layout.
- Early Chromium test found a usability regression: comparison overview pushed original Poland facts out of the first viewport. Repaired by displaying core campaign numeric facts **before** extended reciprocal evidence analysis. Never treat the initial failed run as passing.
- **Final GitHub CI details:** see PR #21 check runs and verify they correspond to final code SHA before merging. This document does not claim a completed run without checking it.

### Still missing
The vast majority of dated operations require original same-area opponent aircraft loss books to create *real* comparisons. Priority: Luftwaffe Generalquartiermeister 6.Abt original rolls, VVS TsAMO unit daily returns, RAF AIR 27 squadron ORBs, Italian military registers, USAAF daily strike loss registers. Need serial-number and loss threshold reconciliation. Firefox/Safari and physical touch devices are not included in Chromium automation.
