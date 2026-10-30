# Grand Air War: unit positions, strength, losses and claims — validation pass (30 October 2026)

**Scope:** European Air War Atlas, 1936–9 May 1945. Research-only additions to draft PR #5. No site, map, simulator or `main` branch integration.

## New research assets and reproducibility

| Asset | Source level | Actual additions |
| --- | --- | --- |
| [USAAF unit–airfield–month crosswalk](../transcriptions/usaaf-1988-unit-airfield-month-crosschecked-1944-1945.json) | 1988 USAF official airfield study cross-checked against 1961 Maurer USAF group histories | 305 source lines, 285 parseable month windows, **764 provisional unit–airfield–month rows**, 529 distinct airfield–months; 153 unit–months with more than one listed airfield |
| [USAAF official combat groups, ETO/MTO](../transcriptions/usaaf-1945-statistical-digest-eto-mto-combat-groups-monthly-1942-1945.json) | 1945 Office of Statistical Control, *AAF Statistical Digest*, Table 2, printed p. 8 | **80 theater–month observations**, Feb 1942–May 1945, total plus five group categories, fractional group strengths preserved |
| [Multiforce unit-level quantitative seeds](../transcriptions/grand-air-war-unit-strength-losses-claims-multiforce-seeds-1939-1945.json) | Explicitly cited Soviet, Belgian, Hungarian, American, Czech, Polish and Finnish records already separately transcribed in PR #5 | **182 unit-aircraft-strength / organization rows**, **11 unit operations/claims/losses rows**, **20 Finnish squadron death aggregates** |
| [USAAF crosswalk builder](../../scripts/build-usaaf-airfield-unit-crosswalk.cjs) | Deterministic local input-to-output transformation | Regenerates candidate crosswalk and all review flags |
| [Multiforce unit metrics builder](../../scripts/build-grand-air-war-unit-metrics.cjs) | Deterministic local input-to-output transformation | Regenerates source-scoped unit observations without mixing denominators |
| [Integrity tests](../../tests/grand-air-war-unit-crosswalk.cjs) | Assertions against committed datasets | Checks source row linkage, counts, conflict retention, cutoff, arithmetic, missing vs zero and attribution |

Run from repository root:

```sh
node scripts/build-usaaf-airfield-unit-crosswalk.cjs
node scripts/build-grand-air-war-unit-metrics.cjs
node tests/grand-air-war-unit-crosswalk.cjs
node tests/grand-air-war-research.cjs
```

The source transcriptions remain unchanged. The new data are *derivative links* and *typed extracts*, not new discoveries of 764 independent original wartime postings.

## 1. American airfield / unit / month audit

**Input:** 305 OCR candidate physical lines in Johnson's 1988 USAF airfield index; 296 A/Y/R airfield headers; Maurer's USAF historical group stationing list. All source references and original page/line identifiers are retained.

| Quality tier | Source lines | Expanded month rows | Meaning |
| --- | ---: | ---: | --- |
| Corroborated candidate | **81** | **226** | Group identity, strictly normalized field name and overlapping time window agree, without listed priority flags |
| OCR candidate | **149** | **383** | Plausible source line, but no sufficiently strong independent cross-check at this granularity, or squadron not independently matched |
| Review priority | **75** | **155** | Source layout, dates or other specific validation issue |
| **Total** | **305** | **764** | **None is approved for map publication** |

The initial strict *place-and-date* matching identifies more candidates, but some have source flags. The quality tier deliberately demotes those rows. **Corroboration is not absolute verification:** the two official USAF publications may rely on common original records.

Flag counts (overlapping categories; **do not add them**):
- 43 source rows with uncertain header layout or country interpretation.
- 24 whose unit month range extends beyond the airfield header's release month.
- 6 whose unit month range starts before the header's first operation month.
- 20 without a complete machine-readable month window.
- 17 where a unit line physically precedes its proposed airfield header.
- 4 exact place matches where the Maurer station date is unresolved or not temporally corroborated.
- 34 whose original month ranges extend beyond May 1945; wartime expansion is capped at May 1945, but **May itself is not proof of pre-9-May occupancy**.
- 153 normalized unit–months with multiple airfield codes. This can be a legitimate transfer within a month, detachment, or transcription conflict. **Do not treat as 153 erroneous deployments or as 153 simultaneous operational bases.**

Examples for source-page verification: A-16 / 36th Fighter Group, A-35 / 36th Fighter Group, A-37 / 405th Fighter Group, A-44 / 365th Fighter Group, Y-47 / 112th Liaison Squadron and R-96 / 14th Liaison Squadron are flagged because their OCR month starts before the reported field first-operation month. These are **disagreements to investigate**, not historical corrections.

**Map rule:** do not draw historical position pins merely because an A/Y/R code is linked to a modern airport, and do not convert an OCR month span into exact arrival/departure dates. Historical coordinates, field identity, visual page review and a dated unit record are separate validation gates.

## 2. Unit aircraft strength and serviceability

- **Soviet VVS KA, five western border districts, 1 June 1941:** 165 aircraft-type rows across **121 regiments**. The regiment rows account for **6,963 aircraft on hand**, **853 inoperative**, **6,110 derived potentially operational**. The complete printed five-district figure is **7,009 / 855 / 6,154** respectively because **46 headquarters aircraft (2 inoperative)** are excluded from the regiment-only denominator. These are *not* all Soviet air forces; named stations can be multiple places, not geocoded.
- **Belgian Military Aviation, 10 May 1940:** 16 selected squadron rows, **182 aircraft** in the cited original military staff study. Several secondary accounts report different wartime bases and/or aircraft counts. None of the 182 is automatically considered serviceable, and this is not a national total.
- **Hungarian 101 Puma Fighter Group, May 1944:** **40 Bf 109 G** is a *derived initial organizational allowance* (3×12 plus four headquarters), **not** a verified inventory or readiness report. Kept as a separate field, with `aircraftOnHand: null`.

USAAF theater combat-group totals are **numbers of formations**, not numbers of airplanes. The 1945 digest's typical aircraft per group is an *establishment*, not observed strength of a particular 1944 group. No per-unit aircraft counts are invented from theater totals or establishments.

## 3. Unit sorties, claims, aircraft and personnel losses

- **Four Fifteenth Air Force fighter groups:** preserve group missions, bomber-escort group missions, credited enemy aircraft claims and *bomber losses observed during escorts*. These are distinct metrics. The source prints a rounded enemy-claims/own-fighter-loss ratio; **no own fighter loss count is reverse-engineered**.
- **Czechoslovak RAF units / B Flight:** five formation/flight observations preserve unit combat sorties, credited claims and casualty distinctions. The **312 Squadron Battle of Britain four aircraft lost** is a directly reported unit aircraft-loss figure. **310 Squadron four Battle of Britain pilots killed** is a unit-and-period figure. The 311 Squadron figure **246** combines killed/missing aircrew; 313's **30** combines killed/missing/captured and must not be presented as deaths.
- **Polish 303 Squadron RAF:** **126 credited enemy aircraft destroyed claims** during the Battle of Britain; not 126 independently verified German losses. The 29 Polish pilots killed figure belongs to *all Polish pilots in the battle*, not specifically 303 Squadron.
- **Hungarian 101 Puma:** **649 fighter sorties** and **107 credited enemy aircraft claims**, May–October 1944, not independent Allied losses.
- **Finnish National Archives:** **477** squadron-label-associated death records in **20** provisional squadrons, with death categories and year retained. These include deaths not caused by enemy action, and non-pilots. No names copied. This is **not** 477 pilot deaths or the entire Finnish Air Force.

## 4. Official USAAF theater group-count series

The 1945 Statistical Digest Table 2 contributes **80 theater–month observations** (40 months × ETO/MTO) for the five combat-group categories, including fractional group counts.

Three **source-table arithmetic discrepancies** are retained:
- **MTO February 1942:** printed total 1, category sum 2.
- **MTO April 1942:** printed total 2, category sum 1.
- **ETO September 1944:** printed total 103, category sum 104.

These are not silently corrected. **May 1945** is an end-of-month observation after the European war ended, and must not appear as an 8/9 May wartime strength figure.

Primary USAAF text: https://www.ibiblio.org/hyperwar/AAF/StatDigest/aafsd-1.html (Table 2, printed p. 8); original US Air Force-hosted scan: https://www.dafhistory.af.mil/Portals/16/documents/Timelines/USAF%20Statistical%20Digest/AFD-090608-039.pdf?ver=2016-09-02-113908-487

## 5. Dashboard consequences and next research queue

**Can support a research/preview chart now:** theater combat-group development by month, source caveats and flagged cells visible; stop at April 1945 for month-end wartime chart. Also a unit observation table with explicit force, metric, period and provenance.

**Can support a research-only map overlay after manual checks:** 226 better-corroborated American month candidates are the first review queue, *not 226 validated map pins*. Historic airfield coordinate/footprint and exact unit period need to be checked before publishing.

**Can support unit profiles in a research view now:** 121 Soviet regiments (one 1941 snapshot), 16 Belgian squadrons (one 1940 snapshot), 101 Puma organization, four USAAF fighter-group operations summaries, five Czech RAF formations/flight, Polish 303 claims and Finnish squadron-associated deaths. No false comparisons of organizational allowance, aircraft on hand, serviceability, sorties, claims or deaths.

**Not yet supported:** full European monthly unit map for all forces, systematic unit-level losses by aircraft and crew, monthly serviceability for individual USAAF/RAF/Luftwaffe formations, and independently reconciled air-to-air claims versus enemy loss event lists.

**Priority research order:**
1. Visually inspect flagged original 1988 USAF airfield pages, especially 6 initial-operation contradictions, 24 release-date contradictions and 17 pre-header lines. Reconcile same-month multi-field transitions against Maurer and unit ORBs.
2. Tie 226 candidate group–field–month rows to historically verified coordinates and field aliases; keep confidence and dated occupancy separately.
3. Find dated *unit* aircraft strength/serviceability returns for USAAF, RAF and Luftwaffe; do **not** distribute theater counts pro rata.
4. Find unit aircraft and aircrew losses with exact date, cause and independent casualty population. Start with RAF squadron ORBs, USAAF Missing Air Crew Reports, German Gen.Qu. loss lists, Soviet unit combat reports and national archives for smaller forces.
5. Build claims-versus-loss event matching only after dated event evidence, and avoid equating credited victories to actual enemy losses.

**Data accounting:** The 764 crosswalk months and 80 USAAF group-count observations had been described as *locally prepared* in the preceding research attempt but were not in GitHub. This pass reconstructs, audits and **commits them to PR #5**. They should **not** be counted twice as independent additions. The new stricter review tiers, reproducible builders and cross-force typed unit view are the additional validation work.
