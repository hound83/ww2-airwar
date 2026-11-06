# Atlas bilateral strength and losses: implementation QA
6 November 2026. Code verified at commit f5ba3f293b98315971aff58bff1068b9cd8c6523 (before these documentation commits).

## Before / after (relative to immediately preceding RAF daily / MAAF Sicily preview)
| Measure | Before | After | Difference |
|---|---:|---:|---:|
| Geographic campaign dossiers | 20 | 20 | unchanged |
| Sourced operational phases | 55 | 55 | unchanged |
| Source-scoped numerical facts | 75 | 108 | +33 |
| Researched dated event dossiers | 80 | 80 | unchanged |
| Campaigns featuring explicit cross-side strength/loss context panels | 0 | 4 | +4 |
| Distinct cross-side evidence sections | 0 | 7 | +7 |
| Sicilian German/Italian country-day operating-aircraft observations | 0 | 10 (2 x 5 days) | +10 structured data points |

Per campaign newly added fact records: Battle of Britain **+10**, Normandy **+14**, Barbarossa **+5**, Sicily **+4** = **+33**.

## Data accuracy and aggregation invariants
- RAF 11 August 1940 Fighter Command serviceable Hurricane 656 + Spitfire 334 = 990 (a **subset** of 1,095 on strength); Luftwaffe 10 August single-engine fighters 805 serviceable out of 934 on strength; Luftwaffe 2,550 all-types serviceable out of 3,358 on strength. Near-date fighter-class comparison is not a pilot or sortie equivalence.
- RAF operational fighter losses **over 900**, type lower-bound, vs German **600** Bf109 category; distinct from 1,733 Luftwaffe aircraft lost all types. No false overall bilateral ratio.
- German LF3 5 June strength 481 (includes 100 fighters) vs 6 June operational day/night availability 319; 826 German aircraft destroyed over **6 June–7 July** = 458+224+7+137 German reporting categories. Week one 362 and week two 232 are already included; do not re-add them. Allied 127 losses are **D-Day only**, not the same period as German 826.
- Allied D-Day 11,590 involved aircraft is an airframe population; Eisenhower's 5,309 strategic and 5,276 tactical are sortie counts, **not aircraft**, and differ in covered population from the pre-existing 14,674 D-Day sortie count.
- Barbarossa German 2,000 combat aircraft committed versus 5,700 **intelligence-estimated** Soviet aircraft facing invasion. These are not matched operational availability populations. 330 German own aircraft destroyed, 22–30 June, versus 4,614 **German claims** of Soviet aircraft destroyed; no confirmed exchange ratio.
- Sicily official history daily German/Italian aircraft committed to action: 283+198=481 on 11 July; 85+76=161 on 15 July. Five dates as original table, no summation across days. Losses by national air force/day-night window: German 59 day/44 night; Italian 32 day/12 night. Allied HQ MAAF 177 losses are for **entire 10 July–17 August** rather than the first week; no invalid side-by-side loss ratio.

## Tests actually executed
- GitHub Atlas core checks: **PASS**, run https://github.com/hound83/ww2-airwar/actions/runs/42231897729, on code commit f5ba3f293b98315971aff58bff1068b9cd8c6523.
- GitHub Atlas Chromium browser QA: **PASS**, run https://github.com/hound83/ww2-airwar/actions/runs/42231897778, on the same implementation commit. Desktop 1440x900 and narrow mobile 390x844 are included in workflow; checks cross-side panels and original source links, no horizontal comparison overflow, Sicily five-row operational table, existing 20-campaign routes, event interactions and map behavior.
- Prior initial failed CI on work-in-progress: source reporting-period text too short for existing data contract; corrected reporting labels, and repeated core/browser CI both passed.
- Source verification: documented in research/sources/atlas-bilateral-strength-losses-2026-11-06.md. No false claim of direct full-image original PDF re-transcription; some published scans could not be visually rendered through the available PDF screenshot viewer.

## Not yet verified / should not be inferred
- No fully harmonized RAF/Luftwaffe month-by-month, Soviet/German day-by-day, or RAF/USAAF/Regia Aeronautica/Luftwaffe complete multi-year aircraft loss ledger.
- German QM category 'lost' and RAF source 'destroyed on operations' may differ in damage thresholds. The two Allied/German Normandy sides have disjoint dates and command boundaries.
- Sicily 11–15 July figure is aircraft committed to action, *not* distinct squadron-size on-strength inventory, not sorties, and may include repeated aircraft across dates.
- The cross-side UI supports responsible comparison, NOT ratios drawn automatically from mismatched source populations.
- CI exercises Chromium only. Firefox/Safari, true physical phone touch and manual external-source scan verification remain out of scope.

**No merges/deployments.** This is a reviewable stacked preview PR; default public Atlas and aircraft physics repo unchanged.
