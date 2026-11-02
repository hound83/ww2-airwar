# Grand Air War v8.0 — historical map and German airpower evidence

**Research and implementation note — 1 November 2026.** Preview route: `grand-air-war-v80.html`; stacked on v7.7. **Draft / not published.** Full source and transformed data in `dist/grand-air-war-v80-german.js`; map in `dist/grand-air-war-v80-core.js` and `dist/grand-air-war-v80.css`.

## Why a larger change was needed

The old map used **present-day OSM political borders, roads and town names**, and campaign/command-loss records appeared as rectangular overlapping labels. This was misleading both visually (anachronistic map) and substantively: **German command-month aircraft losses have no single crash-site coordinate**.

The new theater map therefore loads physical **Natural Earth land-only topology, 1:50m**, with an unlabeled graticule. It draws no modern borders or road network. Stable **small numbered campaign markers** match the campaign list. Crowded markers collapse into numeric proximity clusters; click to zoom, or select individual campaigns. Names appear in the dossier or in transient accessible tooltips, not persistently on top of one another.

### Limitations of the map

- Land outlines depict physical geography using modern coastline source data; physical shorelines may have local changes since WW2. **This is a historical-style theater orientation map, not a precisely reconstructed 1944 cartographic sheet**.
- **No 1939/1940/1941/1944 front lines or national boundaries** until specific dated historical sources and geographic references can be documented. Better no border than a known-wrong current border.
- Campaign markers are **approximate navigational centers**. They do not identify actual aircraft flight paths, battle perimeters or precise bomb-strike locations.
- Natural Earth `land-50m.json` is downloaded at runtime from `cdn.jsdelivr.net/npm/world-atlas@2.0.2`, requiring network and external host availability. `topojson-client@3.1.0` is an external script. The page must retain usable campaign listings when either fails.
- **No modern OSM raster fallback**, as it reintroduces anachronistic borders.

## German research modules (new functional source series)

| Measure | Rows | Date / population | Source class | Critical caveat |
| --- | ---: | --- | --- | --- |
| Single-engine fighter pilot casualties | 9 monthly | Sep 1943–May 1944, German fighter pilot population | Murray, *Strategy for Defeat*, scholarly with wartime German records | **Pilot losses ≠ aircraft destroyed**, not single-front casualties. Monthly published casualty percentages are its own denominator. |
| Reich fighters on-hand/serviceable | 3 dates | **1 Jun, 1 Jul, 27 Jul 1944**; SE/TE fighters **Luftflotte Reich only** | Murray, historical data / wartime return | Not all Germany; three snapshots **must not** be interpolated into a monthly full-European fighter inventory. |
| Apr 1944 fighter pilots lost / replacements | 1 distinct conference record | Galland report: **489 lost**, **396 replacements**, officers **100/62** | Captured German Göring–Galland conference, RAF AHB VII/71 | Murray's **447** April losses differ by definition/population, not an arithmetic correction. A new arrival is not proof of net strength change. |
| JG 53 fighter Gruppe case reports | 2 unit-months | III./JG 53 Apr 1944, II./JG 53 May 1944 | Murray's reproductions of original wartime unit logs | May's **53 lost or damaged** includes the **34 completely destroyed**, not an extra number to add. |
| Aviation fuel production capacity | 7 months | Aug 1944–Feb 1945 | Murray secondary economic data | Percent of available **production capacity**, not tons of fuel at airfields. |
| German monthly aircraft production | 27 months | Jan 1943–Mar 1945, **all aircraft types** | USSBS-derived scholarly production table, also checked against official USSBS annual 1944 | Factory flow, NOT force inventory or fighters alone. **Original USSBS monthly table has not been independently reread.** |

### The unusual September 1944 production issue

One USSBS table reproduction gives September 1944 **4,130** aircraft, while the historical published table by *Germany and the Second World War*, Vol. VII gives **4,103**. Monthly totals for 1944 **with 4,103** reconcile to **39,807** all-type aircraft, matching the official USSBS summary at [GovInfo](https://www.govinfo.gov/content/pkg/GOVPUB-D301-PURL-LPS47072/pdf/GOVPUB-D301-PURL-LPS47072.pdf). With 4,130 the annual sum is 39,834. **The interface uses 4,103 with an explicit discrepancy warning** rather than silently smoothing or using the higher number.

This is a reasoned reconciliation, not an independent reading of original USSBS report 2a. [Truman Library original USSBS archive locator](https://www.trumanlibrary.gov/library/federal-record/records-united-states-strategic-bombing-survey); [published scholarly table reproduction](https://www.scribd.com/document/754259981/Germany-and-the-Second-World-War-Vol-VII-the-Strategic-Horst-Boog-2006-Clarendon-Press-44ac2fcc10274caa9f6e73c5d92b2e80-Anna-s-Arch).

### Source connections

- [Murray, Chapter VII](https://www.ibiblio.org/hyperwar/AAF/AAF-Luftwaffe/AAF-Luftwaffe-7.html), pp. 277–79 — German pilot attrition, Reich readiness and JG53 combat sorties, pilot readiness December 1943.
- [RAF AHB German translation of 15–16 May Galland conference](https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/ahb-translations-from-captured-german-documents/notes-on-discussions-with-reichsmarschall-goering-held-on-15th-16th-may-1944-on-the-subject-of-fighters-and-fighter-personnel/).
- [RAF Air Historical Branch Rise and Fall of the German Air Force](https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/second-world-war-thematic-studies/rise-and-fall-of-the-german-air-force-1933-1945/), Fighter Assembly Plant chapter — July 1943 SE fighter production and growing importance of escorts.
- [USSBS European summary](https://www.govinfo.gov/content/pkg/GOVPUB-D301-PURL-LPS47072/pdf/GOVPUB-D301-PURL-LPS47072.pdf), official 1944 annual all-type figure.

## What the interface now lets you investigate

1. **Pilot pressure:** nine historically sourced casualty months and the source's percentage, with April 1944 separate replacement shortfall.
2. **Actual readiness:** 1944 dated single-engine and twin-engine fighters in **Luftflotte Reich**, serviceable and non-serviceable as distinct components.
3. **Production tension:** all aircraft output versus pilot/aircraft serviceability, *never* as a net replacement calculation. The 1944 monthly table discrepancy is shown on selection.
4. **Fuel bottleneck:** August 1944–February 1945 monthly aviation-fuel capacity percentages, alongside different overall-fuel capacity.
5. **A concrete Gruppe:** dated April/May 1944 JG53 serviceable aircraft, sorties and aircraft written off.
6. **Same-month source context:** available Reich/West original airframe losses appear in the detail, explicitly **not** treated as directly comparable national casualties.
7. **CSV export** for each German dataset.

Data only includes named, provenance-traceable observations. **No manufactured full 1939–45 German force chart, no generic pilot-loss backfilling and no invented Allied vs German loss rate.**

## Release checks and remaining work

Run `node tests/grand-air-war-v80.cjs`; normal `tests/build.cjs` also executes the new test. The v7.7 core page is preserved and loads its own code. Browser-rendered 50m topology, mobile layout and controls still require a full visual smoke test before any release.

Next research: USSBS original printed monthly pages; audited German strength/date series outside Luftflotte Reich; RAF and USAAF actual theater-local combat aircraft strength with common-date denominators; Soviet front-by-front unit strength rather than national totals.
