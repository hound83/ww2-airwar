# v7.5 research and implementation verification log (integration stage)

## 26 October 2026 · aircraft registry increment

Follow-up graph fix: historical speed/climb plots now connect points within each gear using dashed guides and provide floating source readouts, crosshairs and point highlights. Mouse, mobile tap, keyboard stepping and dismissal are browser-tested, including irregular altitude spacing and viewport bounds. The signed excess-power graph also supports inspection. No historical values or reconstruction policies changed.

Built from `90f27f5` on `v7.5-integration`. Added a 95-entry registry (4 measured test configurations, 89 placeholders, 2 illustrative references) with 55 report points and an optional, separately labeled reconstruction readout. Source provenance and scan-audit gaps remain visible. New browser coverage checks both sides of the selector, placeholders, interpolation, source discovery, mobile overflow and v7.4 fallback. New physics checks independently verify power balance; density-scaled airspeed is now correctly named EAS. See [full audit and extension rules](v75-aircraft-performance.md). This completes an incremental preview update, not all v7.5 historical research or aircraft-model calibration. Image curation remains deferred.

## Newly preserved evidence (secondary transcriptions with exact original-source references)

Published historical tables in *The Battle of Britain: Myth and Reality*, reproduced at:
https://erenow.org/ww/the-battle-of-britain-myth-and-reality/6.php

The new `dist/atlas-v75-evidence.js` records each observation with dates, reported population, source identifier, `secondary` provenance, `recorded` value method and verification status `published_table_checked`. The original archive documents cited in the published book have **not** been individually scan-audited here. That gap is documented explicitly.

- **Fighter Command operational fighter pilots** (RAF AIR 22/296 cited), eight reporting dates between 30 June and 2 November 1940; first 1,200, last 1,796. Establishments kept separate.
- **German operational single-engine fighter pilots** (Webster/Frankland and Murray cited), four dates from June to November 1940. On 1 September, 735 and alternative 688 are preserved as unresolved conflicting secondary readings, not blended.
- **Weekly British Hurricane / Spitfire production** (RAF AIR 22/293 cited), 22 rows covering June–1 Nov 1940. Counts sum **1,367 Hurricanes** and **724 Spitfires**. Output ≠ ETO deliveries ≠ readiness.
- **Weekly destroyed RAF Hurricane / Spitfire aircraft** (RAF AIR 22/262 cited), 15 report rows including the long aggregate 10 May–29 July. Totals **753 Hurricanes** and **467 Spitfires**. The long aggregate is intentionally not graphed as an ordinary weekly bucket.

Additional contemporary RAF personnel detail: *The Narrow Margin*, Appendix 11 (similar but not identical establishment figures), https://erenow.org/ww/narrow-margin-battle-britain-rise-air-power-1930-1940/21.php. Keep alternate counts for audit before combining.

**Data-model limits:** These BoB records are not all-air-force counts. Germany's 1940 operational-pilot snapshots are not numerically equivalent to its separate all-front monthly fighter-pilot loss counts of 1942–44. All source metrics are kept in their original time and organization scopes.

## New simulation prototype design — not yet historical-calibrated

The separate `dist/atlas-v75-lab.js` module contains:

- A **deterministic expected-pilot-cohort accounting model**, with original versus replacement identity, monthly returns, modeled experience classes and mathematically reconciled active + temporarily absent + permanent departures. Duration is bounded and cohorts re-bucketed to preserve population conservation for 107-month spans. RAF/Luftwaffe/USAAF/VVS may be selected but national attrition rates are **not invented**; force comparison is explicit scenario sensitivity only.
- A **source-neutral aerodynamic engineering sandbox** with independent single-stage-supercharged and turbocharged reference configurations, altitude-dependent ISA density, simplified critical-height manifold-pressure behavior, shaft power, propulsive power, parasite + induced drag, specific excess power, model climb, instantaneous and sustained turning. Inputs include assumed internal fuel after drop tanks, power rating and pilot G cap. Positive and negative Ps are separately charted.
- **Important prohibition:** illustrative configurations must never be presented as validated Messerschmitt Bf 109 vs Republic P-47 historical curves. A credible historical side-by-side needs NACA/RAE/RLM/OEM engine test condition datasets, aircraft drag polar and propeller calibration, independent flight-test validation. No universal 95/5 parasite/induced-drag split is used.

Reference technical reading leads: FAA *Aerodynamics for Naval Aviators* https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/00-80T-80.pdf and NACA altitude engine report https://ntrs.nasa.gov/citations/19930094435. These are **research references**, not numeric sources for the uncalibrated reference aircraft.

## Completion gaps that must remain visible before final sign-off

- Comparable national RAF, German, USAAF and VVS full-war pilot baseline sources by role, training, force and front.
- Source-audited German aircraft type/variant monthly acceptance and detailed Bf 109/Fw 190 K-4 production; RAF and VVS annual/monthly industrial tables.
- Historian-checked campaign air operation effects and original theater-scoped RAF/VVS losses.
- Aircraft/engine measured performance curves, boosted engine power at critical altitude, props, drag fitting and independent calibration/validation.
- High-quality one-to-one photographic curation of the nine homepage cards (user explicitly requested **later**, not part of this integration).
- Fully georeferenced multiregion map and dated campaign-unit mapping.

Do not falsely mark these gaps as complete based on the new engineering demo or individual secondary book excerpts. Any future verified rows must retain both *source provenance* and *value method* dimensions, and partial ranges must not silently sum missing months as zero.
