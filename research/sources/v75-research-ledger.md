# v7.5 research ledger — source findings and next validations

**Status:** candidate evidence inventory and implemented source rows for the opt-in UI preview, not a claim that the entire atlas is complete.

## Aircraft performance increment · 26 October 2026

See [the performance evidence ledger](v75-aircraft-performance.md) and `research/transcriptions/aircraft-performance.json`: 55 reported speed/climb observations for two RAF Spitfire IX test configurations and USAAF P-51B-5 / P-47D-10 tests. Primary-report HTML transcriptions were checked; original-scan reconciliation remains outstanding. Three summary/detail conflicts are preserved. The registry distinguishes measured, reconstructed, placeholder and illustrative data; 89 variant research placeholders never inherit generic physics. Two engineering references remain explicitly uncalibrated. Full-aircraft coverage is an ongoing objective, not claimed complete.

## New directly extracted model-by-month production series

* **Source:** US Army Air Forces, *Statistical Digest: World War II*, Table 76: *Factory Acceptances of Army Cognizance Airplanes, by Type and Model of Airplane*.
* **Source URL:** https://www.ibiblio.org/hyperwar/AAF/StatDigest/aafsd-3.html
* **Included fields:** P-38, P-47, P-51; monthly 1943 and 1944 plus Jan–Aug 1945.
* **Location:** `dist/atlas-v75-production.js`, `window.AirWarV75Production`.
* **Control totals (1943 / 1944 / Jan–Aug 1945):**
  * P-38: **2,213 / 4,186 / 1,666**
  * P-47: **4,428 / 7,065 / 3,559**
  * P-51: **1,710 / 6,908 / 5,111**
* **Qualification:** Army-cognizance factory acceptances; worldwide, not RAF/USAAF/VVS operational strength in Europe. Month/year outputs must not be presented as the location of service.
* **Provenance:** wartime official statistical compilation, published as a later transcription; compared numerically with the same compilation's year totals. Scan-to-HTML reconciliation remains useful.

## Primary leads retained, not yet fully transcribed into current view

1. **USAAF Statistical Digest Table 79**: Factory Deliveries by type and recipient. Potentially links industrial output to recipient nations without confusing assigned inventory. https://www.ibiblio.org/hyperwar/AAF/StatDigest/aafsd-3.html
2. **USAAF Statistical Digest Table 81**: Engines and propeller deliveries, useful for Industry bottlenecks. Same source.
3. **USAAF Statistical Digest operations/personnel sections**: theater/group sortie and flying-hour returns, aircrew availability and casualties; inspect whether fighter-pilot totals are separable from total aircrew.
4. **United States Strategic Bombing Survey — Survey Reports:** original German industry acceptance series, oil/fuel production, and effects of strategic bombing; need to distinguish production/acceptances and reconcile 1944 total (39,807 of all types in Survey summary) to sub-series. https://www.airuniversity.af.edu/Portals/10/AUPress/Books/B_0020_SPANGRUD_STRATEGIC_BOMBING_SURVEYS.PDF
5. **AAF historical studies, German industrial attacks:** interpret German Bf 109/Fw 190 monthly acceptance versus production separately, with source audit. https://www.dafhistory.af.mil/Portals/16/documents/Studies/101-150/AFD-090522-058.pdf
6. **Soviet wartime air-army returns (rkka.es):** avoid mixing western border districts, incomplete front lists, front+reserve and PVO/Naval. Verify dates and archival originals where possible.
7. **NACA, RAE, BMW/DB, P&W/Republic test reports:** measured power by engine setting and altitude, supercharging/turbocharging, test weight, propeller assumptions, stall speed, drag polar and independently measured climb curves. Maintain distinct calibration and validation points. No single 95/5 drag ratio is adopted solely from an informal recollection.

## Release safety

The v7.5 preview renders only with `?preview=7.5`. The default behavior intentionally remains v7.4 pending complete QA and implementation of the full nine-tab requirements. No claim is made that a validated cross-national pilot simulator or aircraft E-M solver is implemented. Remaining work includes multi-force pilot data, verified German monthly production, RAF/VVS loss and serviceability series, historically validated subvariant dates, and substantial browser regression testing.

