# Atlas v8.0: end-to-end quality audit and Poland pilot

Date: 5 November 2026. Scope: **opt-in v8 preview**, not the default v7.4 website.
This is a reproducible internal-data and UI audit, **not** an independent transcription of every original archive page.

## Product decision

The Atlas separates **campaign-local evidence**, **dated campaign events**, and **independent regional/global research datasets**. Selecting Poland in September 1939 must never make a 1943–44 western German command record look like a Polish campaign loss. Missing observations are described as *unavailable*, not zero. A historical map pin represents a **navigation centre**, not an asserted unit or aircraft position.

The **Invasion of Poland** is the depth pilot. Its 4 source-scoped observations, 6 events and original-source links demonstrate the dossier standard. Other campaigns remain uneven in evidence coverage and must not be presented as equally complete.

## Coverage and internal data tests

| Data population | Audited observations | Rules checked |
| --- | ---: | --- |
| Campaign catalogue | 20 campaigns, 29 sourced numeric facts, 33 dated events | Unique IDs/events; chronological ordering; start/end and fact/event dates; sources and explicit scope; map coordinates |
| Campaigns with no sourced numeric observations | **8 of 20** | Display an evidence gap, not a zero or a regional proxy |
| Poland, September–October 1939 | 4 numeric source claims, 6 dated events | Original source per claim, uncertainty and discrepancy, units and event scope |
| Spain / Condor Legion | 1 campaign-local troop-airlift figure (7,350) | July–September 1936 scope, no 1943 German reporting substitution; Spanish Civil War labelled correctly |
| German captured command loss reports | 30 command-month records, September 1943–November 1944 | Destroyed/damaged cause sums; missing aircraft are a subset of enemy-action destroyed; commands and periods not pooled |
| USAAF ETO/MTO combat groups | 80 theatre-month records, **76 recorded totals and 4 unavailable** | No missing→0 conversion; role subtotals and explicit archival differences; groups ≠ aircraft |
| VVS front/reserve strength | 5 dated observations | Dated scope excludes naval/PVO; no continuous interpolated series |
| USAAF worldwide aircraft acceptances | 68 months | Unique months and category sums; factory arrivals ≠ deployed aircraft |
| German fighter-pilot attrition | 9 months | Personnel losses ≠ aircraft; incompatible April 1944 figures 489 and 447 retain separate sources |
| German fighter readiness | 3 dated records | 1 and 27 July 1944 observations remain distinct; local command strength ≠ Germany-wide fleet |
| German aircraft production | 27 months | 1944 reconciliation 39,807; flow ≠ aircraft in service |
| German fuel capacity | 7 observations | Capacity percentages ≠ tonnes available or aircraft strength |

## Interaction coverage

- `node tests/build.cjs`: reproducible build plus pre-existing v7.6/v7.7 regression suites and v8 tests.
- `tests/grand-air-war-v80-audit.cjs`: referential integrity, scope, geography, missing values, population boundaries and aggregation arithmetic.
- `tests/grand-air-war-v80-interactions.cjs`: **240** combinations of region, campaign query, historical month and all-dates mode; **9** map zoom levels; **12** German command/outcome/year combinations; **36** Allied series/area/metric combinations; campaign/event navigation.
- `tests/grand-air-war-v80-browser.cjs`: actual Chromium desktop **1440×900** and narrow mobile **390×844**; Poland selection, source buttons and dated-event drilldown; initial and fitted physical-coastline rendering; independent research-library expansion; German damaged/command selection and VVS/USAAF series; empty intersection; activity toggles; JavaScript exceptions and horizontal overflow. Screenshots are saved as workflow artifacts.
- `Fit map` must retain all matching campaign centres and render physical land. At normal zoom, clusters must provide selection; at high zoom, individual numbered campaign pins remain available.
- Dossier source figures must be near the **top** of the visible panel, before extended explanation. No country-specific result should be hidden behind unrelated global laboratory graphs.

## Changes and resolved defects

1. Separated independent research laboratories from campaign reporting and collapsed them initially, avoiding unrelated dates and false local attribution.
2. Kept all 20 candidate campaigns visible in the overview while highlighting active campaigns; refined map clusters, active selection and `Fit map` behavior.
3. Replaced placeholder-only Poland with dated, sourced observations and clickable event dossiers, and displayed evidence figures before narrative paragraphs.
4. Maintained search/theater/date intersection semantics; an empty intersection clears the dossier rather than showing stale results.
5. Corrected four missing USAAF organization-role observations previously displayed as numeric zero, and made unavailable values explicit in detail and charts.
6. Added a real-browser CI gate and screenshot checks; split the historical land GeoJSON into separate Leaflet polygon paths on SVG, so individual coastlines remain distinguishable through map redraws and can be tested.
7. Clarified that the Spanish Civil War is **not** the WWII Western Front, despite sharing the West/Spain filter.

## Explicit limits / unfinished research

1. **Eight other campaigns have no audited local numeric evidence.** All other 19 campaigns still need deeper event-level source work; the 1939 Poland pilot is not a completed all-campaign source register.
2. The RAF Museum's retrospective Poland figures (~300 Polish aircraft, >1,300 German aircraft, 126 German aircraft reported shot down, 114 Polish aircraft reported lost) are **not** a source-audited bilateral daily aircraft loss ledger. Do not calculate a precise loss exchange ratio from them.
3. RAF Museum and USHMM summarize Polish aircraft destruction in the opening days differently; a daily German/Polish unit-return reconciliation remains to be done. See `research/sources/poland-1939-campaign-pilot-2026-11-05.md`.
4. Source population differences in German Reich/West commands, USAAF ETO/MTO group counts, VVS front/reserve and worldwide factory deliveries prevent a single defensible combined 'all sides at this battle' number.
5. Natural Earth 1:50m physical coasts are **not** 1939–45 political borders, frontlines, airfields or historical territorial changes. The CDN may be unreachable; that should show a clear unavailable message, never fake a modern boundary map.
6. Independent checks of the **original archival scans** and browser support outside Chromium (Firefox/Safari/real touch devices) remain outstanding. Internal equality checks cannot establish archival truth.

## Release boundary

Work remains on a **draft PR** based on the unmerged v8 preview branch. Do not merge, change the GitHub Pages default route, or publish without Michael's explicit review and approval.
