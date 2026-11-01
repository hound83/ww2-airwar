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
