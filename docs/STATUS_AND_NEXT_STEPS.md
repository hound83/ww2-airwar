# Atlas status and next work

## 6 November 2026 — first Narvik day-level RAF operational-return comparison

**Work branch:** `feature/atlas-v84-narvik-daily-unit-ledger`, stacked on reviewable v8.3 branch. Public v7.4 default and physics repository remain unchanged.

- Located the RAF's original *Campaign in Norway* **Table 2** (printed pp. 95–96) and a modern archival **transcription of No. 263 Squadron's retrospective Form 540, AIR 27/1547** (PDF pp. 59–73). The latter is **not an independently checked scan or a surviving May 1940 Form 541**. Added an interactive, date-by-date Narvik comparison: **18 unit-diary dates**, **16 area-table dates**, **13 complete daily sortie/combat/RAF own-loss observations**, and **nine unit-diary sortie quantity reports**, including three explicit grounded days. Separate missing values and recorded zeroes remain visibly distinct.
- Explicitly flagged the **25 and 26 May contradictions** (AHB 36 versus 263 Sqn >40; AHB 50 versus >50) and the unresolved summary comparison (**594 precise + about 50 AHB area sorties** versus **329 + 249 original-history squadron flights**). The RAF PDF's OCR renders 329 as 309; its independently indexed text confirms 329. No false combined or verified enemy-loss totals were created. All existing **20 campaigns / 55 phases / 65 numeric facts / 78 events** remain unchanged.
- Source-level research and archive leads: [`research/sources/atlas-narvik-daily-unit-operations-2026-11-06.md`](../research/sources/atlas-narvik-daily-unit-operations-2026-11-06.md). Code and browser quality gates: [`docs/ATLAS_NARVIK_DAILY_UNIT_QA_2026-11-06.md`](ATLAS_NARVIK_DAILY_UNIT_QA_2026-11-06.md). Against corrected code commit `524a7a1`: [core test run 42219533875](https://github.com/hound83/ww2-airwar/actions/runs/42219533875) **passed**, as did [Chromium desktop/mobile run 42219533874](https://github.com/hound83/ww2-airwar/actions/runs/42219533874). Narvik screenshots were captured and uploaded as CI artifacts; visual files were not independently opened.
- **Next source milestone:** obtain original photographed RAF Form 540/541 records for **No. 46 Squadron**, plus corresponding German Narvik-area daily unit returns, to reconcile operational sorties and matched loss categories instead of widening an unsupported total.

## 6 November 2026 — recovered operational quantities for four thin campaigns

**Work branch:** `feature/atlas-v83-operational-evidence`, stacked on tested v8.2 PR #13. The public default and physics repository remain untouched.

- Added source-bounded operational evidence to Norway, Barbarossa, Sicily and Berlin. Nine new numerical observations (**56 → 65**) and two documented dated events (**76 → 78**), while retaining the existing 55 campaign phases. Norway now distinguishes 49 RAF sorties, 37 engagements, six *claims* and 13 ground-destroyed Gladiators from the 17 fighters of the later evacuation; Barbarossa's 800 ground losses are explicitly part of at least 1,200; Sicilian navy fighter-cover sortie rates are separate from tracked Axis flights; Berlin's 16th Air Army daily sorties are a published secondary transcription, not three-army airframe losses.
- Sources and unresolved archival issues: [`research/sources/atlas-thin-campaign-operations-2026-11-06.md`](../research/sources/atlas-thin-campaign-operations-2026-11-06.md). Reproducible test/report: [`docs/ATLAS_THIN_CAMPAIGN_OPERATIONS_QA_2026-11-06.md`](ATLAS_THIN_CAMPAIGN_OPERATIONS_QA_2026-11-06.md). Both [core run 42215620011](https://github.com/hound83/ww2-airwar/actions/runs/42215620011) and [real Chromium desktop/mobile run 42215619843](https://github.com/hound83/ww2-airwar/actions/runs/42215619843) **passed** against code commit `3ae8ee62de2cbc21a8742966ef71a1127854f241`.
- **Not claimed:** complete bilateral campaign losses or daily airfield serviceability. Berlin's 91,000-sortie headline and inconsistent 2,738 aircraft/crews remain excluded pending original Soviet reporting-denominator audit.
- **Next high-value source milestone:** original day-by-day air-army and Luftwaffe unit returns for selected Soviet campaigns, with source-backed comparable operations and loss categories before any plot-level aggregation.

## 6 November 2026 — six gap campaigns now have researched phased dossiers

**Work branch:** `feature/atlas-v82-gap-coverage`, stacked on `feature/atlas-v81-campaign-coverage`. Default v7.4, standalone historical laboratories, underlying physics and optional v8 route unchanged.

- Researched and integrated multi-phase guide and source-linked events for **all six previously numerical-empty campaigns**: Stalingrad, defence of Reich, Kursk, Italy, Bagration and Berlin. **18/20 campaigns** have operational stage guides, **55 phases** (previously 37), **76 dated researched events** (previously 57), **56 scoped numeric facts** (previously 42). Dieppe and Bodenplatte correctly remain single-day operations without invented extra phases.
- New quantitative distinctions include Stalingrad delivered daily cargo versus supply *requirements*; Luftflotte Reich all-cause monthly airframe write-offs; Soviet and German assigned/committed strength at Kursk and Bagration; 435 Cassino morning bombers partitioned into 173 medium plus 262 heavy; and approximate Soviet assembled strength at Berlin. **No implied aircraft-loss total** where original local loss registers are unavailable.
- **Deliberately withheld:** a contradictory Berlin 16th Air Army **2,738 aircraft versus 2,738 experienced crews** historical report until primary source reconciliation. The Italian campaign now correctly reaches the **2 May 1945 surrender** rather than stopping in April.
- Source-by-source research and limitations: [`research/sources/atlas-campaign-gap-research-2026-11-06.md`](../research/sources/atlas-campaign-gap-research-2026-11-06.md). Node/data/regression tests cover all 20 campaigns, the six new journeys, 540 search/time/theatre/visibility combinations, nine zoom levels and independently scoped analytic panels. **Both release-verification suites passed against the final code:** [core GitHub run 42212885013](https://github.com/hound83/ww2-airwar/actions/runs/42212885013), [Chromium desktop/mobile run 42212885231](https://github.com/hound83/ww2-airwar/actions/runs/42212885231). Screenshots of desktop/mobile Italy, Poland and map were independently inspected. Details and known limits: [`docs/ATLAS_CAMPAIGN_GAPS_QA_2026-11-06.md`](ATLAS_CAMPAIGN_GAPS_QA_2026-11-06.md).
- **Remaining next major research need:** recover unit- and day-level RAF, Luftwaffe, VVS and USAAF original loss, readiness and sortie registers to replace scoped secondary estimate placeholders with comparable proven populations; do not fabricate them from opening inventories or worldwide production.

## 6 November 2026 — operational campaign coverage and research discoverability

**Work branch:** `feature/atlas-v81-campaign-coverage`, stacked on the unmerged `feature/atlas-v80-campaign-stages`; website v7.4 default and physics snapshot untouched. This is a review increment, not a published website.

- A campaign now offers a researched operational narrative in **12/20** cases (previously 5/20), comprising **37** phases (previously 17) with at least one clickable evidence-detailed event in each. The original five phase guides have been made more informative too.
- **50** detailed dated events (previously 11), **57** total dated records (36), **42** source-scoped historical quantities (30). No invented phase subdivisions for one-day Dieppe/Bodenplatte, and six campaigns remain explicitly without local numeric reports.
- Search now finds *Cobra*, convoy *Peewit*, HMS *Glorious*, *Black Thursday* and other actual phase/event names, with short-token whole-word matching. The UI distinguishes researched events from simple calendar markers and shows `>200` rather than an exact 200 for a Big Week lower-bound figure.
- Contradictions and denominators are documented: 7 March 1942 Malta HMS *Eagle* versus USS *Wasp* museum sources, 17 Aug versus 14 Oct 1943 Schweinfurt, Market Garden 152 as a subset of 162 resupply aircraft on 20 September, and Eindhoven local Bodenplatte losses versus whole-raid figures.
- Exact source and test report: `research/sources/atlas-campaign-operational-coverage-2026-11-06.md` and `docs/ATLAS_CAMPAIGN_COVERAGE_QA_2026-11-06.md`. GitHub core **42194849014** and final Chromium desktop/mobile **42194848882** both passed following the source discrepancy fix. Screenshots were generated but not independently downloaded and inspected here.
- **Next substantial milestone:** source-audit additional phase journeys and genuinely local operational counts in the eight thinner campaigns; verify contradictory mission claims against original operational returns where accessible.

## 5 November 2026 — source-backed campaign stages, new stacked review branch

**Work branch:** `feature/atlas-v80-campaign-stages`, stacked on `feature/atlas-v80-quality-poland`, still an **opt-in, unmerged preview**; v7.4 default and physics unchanged.

- Campaign navigation now follows **campaign selection → operational phase selection → ground/air/interpretive context → optional dated evidence**, without auto-opening the first arbitrary day event.
- Reviewed **17 phases in 5 campaigns**: Poland 1939 (3), Condor Legion/Spain (3), France 1940 (3), Battle of Britain (5 RAF Museum phases), Normandy (3). The other 15 remain unphased with a prominent warning; no synthetic historical phases.
- Explicit numerical boundaries: **30** source-specific campaign facts, **36** dated records, including the distinct 1936 airlift vs approximately 19,000 rotated Condor Legion personnel, and Polish 121st Squadron combat on **9 September 1939**. No campaign-wide totals apportioned to individual days/phases.
- Controller/data checks passed: `node tests/build.cjs`, **240** filter intersections, **9** zoom levels, **12** German loss filter modes and **36** Allied force combinations, phase/source/event checks and year-boundary checks. **Chromium desktop and mobile workflow run 42048245427 passed**, and screenshots were inspected; rerun after the final scroll-reset adjustment before release.
- Review records: `docs/ATLAS_V80_END_TO_END_QA_2026-11-05.md` and `research/sources/poland-1939-campaign-pilot-2026-11-05.md`. Full original opposing-force air-loss reconciliation, 15 phase histories, and testing outside Chromium remain research gaps.

## 5 November 2026 — v8 QA and Poland source pilot, separate review branch

**Work branch:** `feature/atlas-v80-quality-poland`, based on unmerged v8 draft PR #8; default v7.4 and frozen physics unchanged. No deployment, merge or release authorized.

- Relevance fix: selecting a campaign now displays **its own** events and event-level evidence/source details. The German, Soviet and American data laboratories are a separately labeled, default-collapsed research library; they no longer follow the campaign month or supply misleading automatic campaign actions.
- Poland pilot: four retrospective RAF Museum campaign-wide observations, six dated events (including 121st Fighter Squadron and 24th Reconnaissance Squadron), unit and source trails, uncertainty statements, and October 6 endpoint. Conflicting RAF Museum/USHMM ground-destruction narratives are acknowledged, not merged into an invented ground-loss total. See `research/sources/poland-1939-campaign-pilot-2026-11-05.md`.
- UI fixes: map Fit control uses the correct Leaflet scope; clustered selected campaign remains highlighted and visible in the picker, as does selected chronology row; theatre/search combinations with zero matches show no stale battle dossier; unreported USAAF group months render explicit `n/a` markers.
- Internal reproducible tests: `node tests/build.cjs` passed, including all prior suites; new exhaustive controller matrix passed **240** theatre/search/month/visibility combinations, **9** map zoom levels, **12** German command/outcome/year combinations, **36** Allied population/area/metric combinations, plus evidence click-through and absence semantics.
- **Pending real-browser gate:** `tests/grand-air-war-v80-browser.cjs` and dedicated PR Chromium workflow check at 1440px and 390px, CDN coastline loading, event links, filter intersection, map pin presence and viewport overflow. Local environment has Playwright code but no installed Chromium binary; do not report this as passed until workflow evidence exists.
- Remaining uncertainty: the other **19** campaigns are still uneven; prior 25 campaign facts become 29, and 28 events become 33. Nine campaigns had no local numerical observation before this work; Poland is now populated but the remaining eight still need a verified research program. The 30 German command-month return totals, 80 USAAF group-month rows (4 unavailable), 5 VVS snapshots and 68 US production months were **not independently retranscribed** as part of this UI QA.


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


## v7.6 Grand Air War experience — Normandy preview, revised 1 Nov 2026

**Status:** draft PR #6, independent from quantitative research PR #5, not deployed. Main v7.4 and opt-in v7.5 are unchanged. User screenshot review of the first preview exposed coarse unzoomable 110m geography, overlapping icon clusters and overly generic, misleading ETO/West statistics beside Normandy.

### What changed after visual criticism
- New **Leaflet 1.9.4** interactive map with real modern OpenStreetMap raster tiles, pan and zoom controls, keyboard and touch support, map style and map-provider attribution. CDN scripts/styles pinned by SRI hashes. OSM tiles are fetched for the on-screen viewport only, without bulk preloading. Needs live internet connection.
- **Pixel-distance dynamic marker clustering** at overview zooms. Click cluster to zoom into individual airfield records. The map has independent airfield and operations layer toggles, Normandy/Europe jumps, fit-visible-records and a responsive layout. Clustering never implies precise WWII runway coordinates.
- Replaced the *illusory whole-war data playback* with a **dated, 16-scene Normandy history** (6 June–17 August 1944), event stepper and actual changes to field availability, dated Ninth Air Force unit movement and a documented 11 July 366th Fighter Group action near Saint-Lô. Whole-war research remains the goal but only Normandy is presented as detailed.
- **Corrected a serious map mistake:** USAAF ALG **A-1 Saint-Pierre-du-Mont is at the Omaha Beach / Pointe du Hoc sector in Calvados**, NOT Cotentin. Eight selected airfields now have source-linked approximate published historical site coordinates; flags document conflicts (especially A-6 and A-10 typo in source pages).
- **Date status fixed:** A-2 Johnson 19 June initial use versus specialist 22 June full operation; A-7 initial-use 24 June vs readiness 2 July; A-10 initial landing/use 19 June vs 26 June completion. Values remain available as distinct fields, with dated construction and some unit-arrival observations; no invented exact group arrival date from a month-only record.
- Includes RAF **B-1 Asnelles (7 June)**, the 366th FG's 17 June crossing to A-1, P-47/P-51/P-38 and A-9's reconnaissance/depot role. The current visible scene on page open is **11 July 1944**, with eight known USAAF sites and a specific ground-support action. One-click D-Day reset and chronological selection.
- Removed prominent **USAAF entire-ETO combat group** and **Luftflotte 3 full-command all-cause destruction** numbers from the Normandy UI: these are **not campaign totals**. The 6 June **14,674 Allied sorties / 5,656 RAF** are retained from the RAF Museum with a dated denominator. Missing localized measures are not filled in.
- Eight fields, nine originally transcribed source-row group/field candidates, 16 dated narrative scenes. This is **still not** the full order of battle, all RAF/USAAF/VVS units or a monthly series across Europe.

### Verification, guardrails and next step
- GitHub Actions **Atlas core checks** and `tests/grand-air-war-v76.cjs` completed **successfully on 1 Nov** (run `41256575169`, prior to documentation-only edits).
- Regression test asserts exact A-1 location sector, differences between initial use and completion, 16 chronological scenes, source keys, Leaflet controls, clustering behaviour hooks, CSS and linked assets, source denominators. Tests inspect API/code/data but **do not prove browser visual rendering**.
- **Still required:** human browser visual review on PC and phone with live tile connections, pan, zoom, click on dense A-1/A-2/A-3 cluster, step to Falaise, and interaction/mobile checks. If OSM tile traffic grows, replace the nonprofit community tile service with an appropriate hosted or self-hosted OSM provider. Do not merge until verified.
- Next substantive research target: historically verified RAF B-coded fields, dated unit stations/actual operations, and air-group moves beyond Normandy; only include sourced figures with matching geography and date.

### Sources and implementation
- Site entry: `grand-air-war-v76.html` on PR #6's branch; GitHub Pages route only after merge.
- Site code: `dist/grand-air-war-v76.js`, `dist/grand-air-war-v76.css`, `dist/grand-air-war-v76-data.js`.
- Principal current references: RAF Museum 1944 timeline; National Museum of the USAF Overlord; 1988 USAAF Johnson European Airfields; D-Day Overlord individual ALG pages; Anciens Aérodromes A-1; 366th Fighter Group combat history. Each scene and field holds its evidence links.
- No changes to the aircraft physics repository or its embed. No verified airfield survey, historic 1944 borders or missing day-based sorties invented.


## v7.7 European overview and evidence labs — 1 November 2026

**Scope approved:** Turn v7.6's Normandy demonstration into a useful European air-war research experience rather than another generic dashboard. `feature/grand-air-war-v77-europe-analysis` is **stacked on v7.6's unmerged feature branch**, so it can be reviewed as a separate, focused draft PR. Do not merge/ship without user review; v7.4 default, v7.5 preview and physics remain untouched.

### Functional features, not mock data

- New `grand-air-war-v77.html`: Leaflet/OSM Europe map, zoom/pan, dates **July 1936–May 1945**, theatre filtering, campaign search, active/inactive selection, collision grouping, clickable dated events and map markers. Modern basemap is *not a 1944 front-line map*. Campaign centres represent broad areas, not combat aircraft positions.
- **20 named campaigns and continuous operational areas** across Western Europe, Reich, Eastern Front, Northern Europe and Mediterranean, with documented purpose, what changed, outcome and participating air forces. **21 standalone historical quantity observations**, each with source, date, scope, observation type (including claim, lower bound, approximation), accessible from dossiers.
- German *loss laboratory*: all **30 scan-checked Luftflotte Reich / Western Front original 1943–1944 monthly command returns** from existing Atlas v7.1 + v7.2, original sources and pages, destruction vs damage, enemy-action vs other operational vs non-operational, missing as included subset, actual observed gaps blank, selectable charts, CSV. West command changed organizational coverage in September 1944.
- Historical *force laboratory*: **80 source-transcribed USAAF ETO/MTO combat group-month observations** promoted from quantitative research PR #5's Statistical Digest Table 2 (without importing the bulk 185-file research PR), with group roles and original arithmetic disagreements; **5 dated VVS front+reserve aircraft snapshots**, and **68 monthly USAAF worldwide factory acceptances**, both from existing v7.3/v7.4 source registers; different scopes intentionally never combined into a European aircraft total.
- Detailed 1940/42/44/45 case evidence: Battle of Britain German archives vs RAF wartime claims; Malta 1942 raid sorties and aircraft losses; Dieppe, Big Week, D-Day, Market Garden, Bodenplatte. Where no localized loss count has been audited, the dossier says **no verified campaign total**, not zero.
- Existing Normandy link from v7.7 dossier opens the richer dated `grand-air-war-v76.html` field notebook. Both routes are self-contained GitHub Pages static pages *once merged*.

### Source and interpretation gates

- Campaign metrics cannot be compared between opposed sides without matching dates and populations. RAF *claimed victories* in the Battle of Britain are NOT German recorded losses, nor are sortie counts an inventory of aircraft.
- German Reich/West reports are source-defined **command** populations, not RAF/USAAF claims or battle-specific geographic map bins. Lost aircraft count only original non-overlapping cause classes. No unverified German Eastern Front or Italian monthly losses are generated.
- VVS all-front/command-reserve figures do not represent the VVS aircraft over Bagration, Kursk or any one battle; Table 2 ETO/MTO groups are organizations, not planes; Table 74 is U.S. *worldwide factory production*, not stationed ETO strength.
- All reports and dates remain traceable via `dist/grand-air-war-v77-campaigns.js`, `dist/grand-air-war-v77-groups.js` and existing v7.1–v7.4 sources. Original source rows and preserved nulls are not silently averaged.
- Numerical overview is **not yet complete:** missing audited RAF daily/campaign aircraft losses, German Eastern Front monthly loss totals, most Mediterranean losses, actual unit/airfield deployments for each front and verified geographic strike intensity. Thus no Europe-wide casualty total or fabricated animated front line.
- Need browser verification of map icons/filters/touch and charts on desktop and mobile before merging. CI test covers schema/algorithms/source boundaries but not visual browser success. OSM tiles and Leaflet assets require access to their external providers.

### Next milestone

1. Visually test and fix v7.7 on desktop and mobile; user review.
2. Expand primary RAF/USAAF/VVS/Italian/Central European *campaign-localized* operation and loss data. Add only values with actual reporting area, loss category and source; preserve gaps, contradictions and claims.
3. Integrate currently unmerged PR #5's remaining historical data only through explicit validation gates, not a bulk merge or invented precision.

Run: `node tests/grand-air-war-v77.cjs` (integrated into `tests/build.cjs` CI).


## v8.0 integrated historical-airwar milestone (1 November 2026)

The goal is a **noticeably larger leap per request**, not version-number churn. User approved building a single larger historical map and German air force/evidence experience.

**Review route** `grand-air-war-v80.html`; draft PR is based on `feature/grand-air-war-v77-europe-analysis` (PR #7), which itself depends on Normandy PR #6. Existing v7.7 and older routes retain their own scripts; live main stays v7.4.

### User-visible new functionality

- No more present-day country borders, roads or giant overlapping country/campaign labels. A Leaflet **physical chart** loads 1:50m Natural Earth land-only polygons, graticule and small stable numbered campaign points. Selected campaign names live in side dossier/list. Crowded points cluster by pixel radius and open with zoom. No fake plotted Reich/West command-loss pins.
- **German War Capacity study**: interactive pilot casualties (9 monthly observations Sep 1943–May 1944), Luftflotte Reich on-hand/serviceable fighters (3 dated observations, SE and TE separate), German all-aircraft factory output (27 monthly observations Jan 1943–Mar 1945), aviation fuel capacity (7 months), two individually sourced JG53 Gruppen reports.
- Separate pilots/airframes/factory flows/percentages by source population; each panel has metric-specific y axis, observation detail, direct source links and CSV export. German command airframe-loss context shows nearby reported dates but is never a pilot-loss exchange ratio.
- Four prominent **clickable** German wartime evidence highlights lead to exact observation/mode. Campaign dossiers can jump to the relevant German pilots/readiness/fuel module (where wartime evidence exists) as well as original German command loss reports.
- Distinct Allied research lab retains USAAF ETO/MTO group organizations, VVS dated front+reserve snapshots and USAAF worldwide factory acceptance series, with no Germany–USA false head-to-head aircraft ratio. Hide controls irrelevant to currently selected Allied population.
- Production transcription disagreement: Sep 1944 USSBS-derived series uses 4,103, which reconciles to postwar official 1944 annual 39,807; an alternative reproduced tabulation gives 4,130 and annual 39,834. Both values and outstanding primary-source audit are documented.

### Important limits

- The physical geography is present-day coastline **shape** rather than historically surveyed 1940s terrain. WWII political front lines and national boundaries are **not included** until dated scholarly geometry is checked. All campaign points are indicative geographic centres only.
- 50m world-atlas topology is an external CDN fetch; unavailable topology should not silently substitute modern map borders. Source footnote is Natural Earth public domain/world-atlas.
- Full pilot loss time series outside nine months, exact current command aircraft strength, localized RAF/USAAF/VVS opposition records and original USSBS monthly appendices remain research tasks. The 27 German production months are **USSBS-derived secondary**, not independently scanned original monthly pages.
- One panel per historical denominator, no interpolations of missing pilot/aircraft dates, no compound "German strength" from factory output or Germany-wide fleet from three Reich observations.

### Checkpoints

`node tests/grand-air-war-v80.cjs` checks map source (land not countries), 27 production months/annual reconciliation, pilot/Galland conflict, readiness/JG53/fuel sources and interactive data mode selection.
Normal `node tests/build.cjs` executes it with all earlier Atlas tests.
**Visual browser and mobile smoke test with live third-party CDN assets is required before merge.**
Original source audit and implementation reasoning: `research/sources/grand-air-war-v80-historical-map-and-german-capacity-2026-11-01.md`.

## v8.0 coherence and cross-population audit — 2 November 2026, review pending

**5 November follow-up:** Draft PR #9 adds a source-scoped Poland 1939 pilot, stronger distinction between campaign evidence and independent research, a full filter/aggregation matrix and desktop/mobile Chromium screenshot gating. The detailed QA matrix, eight campaigns lacking numerical observations, remaining archival uncertainties and pre-merge boundary are recorded in [`ATLAS_V80_END_TO_END_QA_2026-11-05.md`](ATLAS_V80_END_TO_END_QA_2026-11-05.md). Historical border geometry and source gaps remain explicitly unresolved.

- **Navigation/map:** the v8 review page links Overview, Campaigns & Events, German/Allied/loss laboratories and sources; an opt-in link from the root Atlas makes the page discoverable after a future merge. The v7.4 default and frozen physics model are otherwise unchanged. All 20 campaign centres are shown by default (inactive periods are muted), so zooming out never reduces the atlas to the one month-active battle. Clusters offer a direct campaign picker plus zoom. Europe-only polygon clipping prevents out-of-range global land edges from crossing the chart.
- **Timeline/dossier:** campaigns are sorted ascending by historical start date and selection stays stable as the user moves the month. The chronology scroll container tracks the selected row without scrolling the page. Irrelevant source actions are hidden, not overlapping disabled controls. Spain's sourced troop-airlift metric and dated events remain visible without an out-of-period 1943 West command-loss message. France/Low Countries gains four separately scoped RAF counts and four dated events; disagreement between studies is flagged, not averaged.
- **Data/aggregations:** 20 campaigns, **25 campaign-localized numeric observations**, 28 dated events; **30 German command-month loss rows**, **80 USAAF ETO/MTO theater-month rows (76 reported totals, four missing)**, five Soviet VVS snapshots, 68 worldwide USAAF acceptance months; nine German fighter pilot casualty months, three dated Luftflotte Reich readiness observations, 27 German all-aircraft production months, seven fuel-capacity percentages and two JG 53 unit records. Command destroyed/damaged subtotals, missing-as-subset, USAAF group discrepancies, production 1944=39,807 and both July 1944 readiness dates are audited. CSV for German series now exports complete source fields.
- **QA:** `node scripts/build-web.cjs`, `node tests/build.cjs` including new `tests/grand-air-war-v80-audit.cjs`, and all 12 historical tests listed in the README passed locally 2 November. **Browser verified, desktop Chromium:** full coastlines without dateline stripes/visible clipping edges; all 20 map candidates and direct cluster picker; Spain and France cards/chronology; selected row remains in the list viewport; no overlapping dossier buttons; month, theater and active-only filters; German/Allied mode switching, independent 1/27 July readiness labels, keyboard graph selection and German CSV download event; no horizontal page overflow or site-origin console error. The root v7.4 navigation link was clicked successfully to reach the v8 page. **Still required:** actual narrow-phone/touch-rendered QA (browser viewport resize unavailable here), and independent scan verification of secondary source transcriptions. Internal consistency does not establish every archival figure. No PR merge or default-route promotion authorized.
