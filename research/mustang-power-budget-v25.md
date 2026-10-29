# European Air War — Mustang power-budget audit v2.5
**29 October 2026 | Research audit, not a new physics calibration**

## Goal and scope
Prioritize the largest source of model error. The principal unresolved failure is the P-51B-15 (43-24777) predicted climb deficit at 2,200 ft at 67 and 75 inHg. The four-aircraft v2.4 equations and historical-source references are preserved; *no new tuned aerodynamic or propeller coefficients have been accepted*.

## Primary reference and provenance
Wright Field, *Flight Tests on the North American P-51B-15 Airplane, AAF No. 43-24777 Using 44-1 Fuel*, Memo Eng-47-1749-A, dated 20 May 1944. Primary-report HTML transcription: https://www.wwiiaircraftperformance.com/org/p-51/p51b-24777.html . The original Figure 5 scan is retained in the full v2.4 research handover, path `06_SOURCE_AND_SCIENTIFIC_EVIDENCE/P51B_24777_ORIGINAL_SCANS/Fig_5_power_required.jpg`.

Historical results: 3,820 ft/min at 67 inHg; 4,380 ft/min at 75 inHg at 2,200 ft. The reported climb differential is +560 ft/min. The original tests were conducted with wing racks. Gross weight at takeoff was 9,335 lb; **weight exactly at the 2,200-ft climb checkpoint is not independently stated**. The model's 9,240-lb assumption should not be described as a measured climb weight. Source engine BHP values were obtained via Packard engine charts, not direct torque measurement in the aeroplane.

## Reproducible absolute power budget at 2,200 ft
Computed by `mustang_budget_v25.cjs` against the existing v2.4 `physics.js` and `cases.json`, candidate C, `bestClimb` with source-defined altitude power and optimized level of TAS. This is **not** the same input treatment as every previous v2.x interactive plot (some used the separate inlet-ram option), which explains a difference of several dozen ft/min from v2.1 and v2.4 summaries.

| Result | 67 inHg | 75 inHg |
|---|---:|---:|
| Historical climb ft/min | 3,820 | 4,380 |
| Calculated optimum climb ft/min | 3,448 | 4,031 |
| Model shortfall ft/min | −372 | −349 |
| Best model climb TAS mph | 171 | 174 |
| Model shaft hp | 1,603 | 1,811 |
| Model propeller efficiency | 0.7809 | 0.7834 |
| Model useful propulsive hp | 1,252 | 1,419 |
| Parasite drag hp | 120.8 | 127.2 |
| Induced drag hp | 165.7 | 162.8 |
| Extra useful power required (hp) | 104.1 | 97.6 |
| Diagnostic propeller efficiency if whole deficit assigned to η | 0.8459 | 0.8373 |

The model predicts a climb-rate boost gain of +583 ft/min versus the reported +560 ft/min, i.e. the relative increase is close even though the two *absolute* outputs are low. This does not prove the installed engine's BHP is correct.

## Unfitted original Figure 5 comparison at 22,400 ft
Original Figure 5 plots **engine brake horsepower required** inferred from engine charts, at varied combinations of RPM, manifold pressure, mixture and supercharger configuration. The following approximate graph readings are compared to modeled aerodynamic power/efficiency using the annotated RPM, not to the default 3,000-rpm-only curve. They are *not* a direct measured propulsive-power curve.

| TAS mph | Historical approx. BHP | Model required BHP | Difference | Engine rpm |
|---:|---:|---:|---:|---:|
| 270 | 490 | 556 | +66 | 2100 |
| 318 | 610 | 729 | +119 | 2300 |
| 387 | 1000 | 1117 | +117 | 2700 |
| 395 | 1090 | 1143 | +53 | 3000 |
| 415 | 1290 | 1310 | +20 | 3000 |
| 430 | 1440 | 1452 | +12 | 3000 |

The model's required BHP is increasingly too high at lower and middle speeds; it is close at the top end. This is **a low/mid-speed curve-shape problem**, not just a static 100-hp error. Figure 5 points are approximate reads, and the historical engine chart itself carries calibration uncertainty.

## What is established and what is not
**Established**: The baseline equations can reproduce high-speed reference points relatively well, but they fail both the absolute low-altitude climb and a separate reduced-power curve, under specified assumptions. Our model uses the source-backed physical wing geometry, but the `CD0` is anchored using only one high-speed observation; `e`, propeller map and the separate cooling contribution are provisional.

**Not established**: Whether the residual power is due primarily to propeller efficiency, incorrect source BHP proxy, low-speed airframe/cooling drag, or test-weight/configuration differences. Inferring a single ~0.84–0.85 eta at one climb condition is an inverse diagnostic, not a measured propeller map. Figure 5 cannot independently decompose drag and propeller efficiency without additional propeller torque/thrust constraints.

## Next 80/20 experiment
1. Audit the original Figure 7 **climb engine BHP** curve against the Figure 4 **level-flight BHP** curve, at the actual 2,200-ft boost, RPM, supercharger setting and weight correction. Explicitly document historical weight at altitude if recoverable.
2. Obtain or reconstruct independent **Hamilton Standard K-6523A-24** installed propeller efficiency versus advance ratio and power coefficient; do not transfer a three-blade Thunderbolt or generic NACA prop map as a measured Mustang curve.
3. Hold the sea-level speed anchor out of the fitting for one test: check the low-speed observed Figure 5 BHP curve with candidate drag polars and measured propeller efficiency; then see whether **both** climb ratings improve without sacrificing speed at altitude.
4. Keep the P-47B, Bf 109F-4 and Spitfire validation as regression tests, and preserve Greg's P-47 2,000/2,600-hp same-geometry calculations as a numerical controlled experiment.

## Dashboard integration
GitHub repository `hound83/ww2-airwar`, pull request #1 merged 29 October 2026, introducing `physics/research-model-v2.4.html`, switching the production and preview Aircraft simulator view to that page via iframe, and updating the script cache key. The historic dashboards remain unchanged. The hosted page retains numerical calculations but omits giant embedded scans, all preserved in the research handover. Live GitHub Pages propagation could not be independently verified from this execution environment.

## Scripts and limits
`mustang_budget_v25.cjs` reads the frozen v2.4 `physics.js` and `cases.json` from the handover. `mustang_power_budget_v25.json` is the exact output. `Mustang_Power_Budget_v2.5.png` visualizes the Figure 5 cross-check. The updated source figure annotation at 395 mph reads **3,000 rpm**, confirmed by inspection of the original scan. All existing Node regression suites passed; a full live dashboard browser test could not be completed.