# Atlas operational coverage: milestone QA, 6 November 2026

## Boundary

Stacked Atlas preview branch `feature/atlas-v81-campaign-coverage` on the unmerged `feature/atlas-v80-campaign-stages`; **not** the v7.4 public default or the frozen v2.4 physics research snapshot. No physics changes, no rewrite of German command-month / USA group-month original observations.

## Reproducible differences against parent feature branch

| Dataset or interaction | Before | This branch | Interpretation |
| --- | ---: | ---: | --- |
| Named campaigns | 20 | 20 | No synthetic filler campaigns |
| Campaigns with researched phases | 5 | 12 | Seven additional navigable narratives |
| Operational reading phases | 17 | 37 | Each phase includes context, air role, outcome and limitation |
| Detailed dated event dossiers | 11 | 50 | Each has specific source, units/outcome and limitations |
| All dated records | 36 | 57 | Includes explicitly labeled markers without a detailed account |
| Source-scoped campaign figures | 30 | 42 | Dates, original source and non-additive populations retained |
| Campaigns still without local figures | 8 | 6 | No blank value represented as zero |
| Theatre × search × month × all-dates matrix | 240 | 540 | Wider coverage of newly researched search terms |

The seven new phased campaigns are **Norway, Malta, Barbarossa, Sicily, Schweinfurt/Regensburg 1943, Big Week 1944 and Market Garden**. The original five (Spain, Poland, France, Britain, Normandy) now have better phase-linked dated evidence. Dieppe and Bodenplatte have enriched one-day dossiers without invented operational phase boundaries.

## Actual test plan and findings

1. `node tests/build.cjs`: reproducible web build plus earlier version data/render checks; verifies 20 campaigns, counts, unique source references, source-specific loss scopes, chapter coverage and evidence click-through.
2. `node tests/grand-air-war-v80-interactions.cjs`: independently computes expected filter results for six theatres, nine query modes, five calendar months and both all-dates states (**540** intersections). Checks nine Leaflet zoom values, Fit map, selected campaign and chapter/event navigation, unrelated research module isolation, 12 German loss configurations and 36 Allied data configurations.
3. Browser Playwright smoke script `tests/grand-air-war-v80-browser.cjs`: desktop **1440×900** and narrow mobile **390×844**, layered map, campaign/phase/detail clicks, sources, map zoom/filter, historic search, overflow and screenshots. This is a separate test gate because Playwright JavaScript availability does not imply a local Chromium executable. **GitHub Chromium runs 42194307268 and 42194848882 both passed**, including the final museum-denominator correction; core check runs **42194307267 and 42194849014 also passed**. Screenshots were generated as downloadable CI artifacts but not independently visually inspected here.
4. Historical sanity checks: August and October Schweinfurt raids stay distinct, the museum's 291-dispatched versus 251-on-mission October source disagreement remains visible, HMS *Eagle* / *Wasp* Malta inconsistency remains prominent, Market Garden 152 of 162 supply attempts does not imply success, local Eindhoven destruction is not added to Bodenplatte overall, RAF 1939/1940 campaign counts never reinterpreted as German 1943–44 losses.

## Open gaps before any public release

- The **eight unphased campaigns**, including already detailed Dieppe and Bodenplatte, do not yet offer a reviewed operation-by-operation sequence where meaningful. Six still have no verified local figures. Editorial content **is not** a substitute for original daily mission sheets.
- Retrospective published histories, although institutionally authoritative, have not all been independently checked against original 1940s operational logs. Malta's contradicted Spitfire carrier record particularly needs primary reconciliation.
- Independent browser vendors beyond GitHub Chromium CI are not tested. CDN failures (map coastline / Leaflet) can affect a visitor differently from the dependency-free Node suite.
- The original v7.4 Pages experience and physics snapshot are intentionally unchanged; do not describe this stacked branch as deployed or merged.

The source-by-source audit is in `research/sources/atlas-campaign-operational-coverage-2026-11-06.md`.
