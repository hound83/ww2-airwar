# Aircraft Performance Lab — evidence and extension contract

Audit date: 26 October 2026. This increment extends `v7.5-integration` at `90f27f5`; the older `v7.5-preview` branch is not the latest integration baseline. Image selection remains deferred and default routing remains v7.4.

## Sources and retained scope

Canonical numeric transcription: `research/transcriptions/aircraft-performance.json`. The build creates `dist/atlas-v75-performance-data.js`. Neither file contains coefficients fitted to an aircraft.

| Configuration | Report location | Imported observations | Audit limits |
| --- | --- | ---: | --- |
| RAF Spitfire LF IX, BS.543, Merlin 66 | [A&AEE report](https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLF-HF-mkIX.html), sections 4.2 / 4.4 corrected summaries | 4 speed + 4 climb | HTML table checked. Report date not established; original scan not independently reconciled. |
| RAF Spitfire HF IX, BS.551, Merlin 70 | Same report, corrected summaries | 4 speed + 4 climb | Use corrected boost results, not original overboosted readings. Carburettor richness at altitude is noted by the report. |
| USAAF P-51B-5-NA, 43-6883, V-1650-3 | [Eng-47-1734-A, 24 April 1944](https://www.wwiiaircraftperformance.com/org/p-51/p-51b-6883.html), VI.B.2 and VI.D | 8 speed + 10 climb | HTML checked, not scan-audited. Speed is from a faired curve; carburettor scatter unresolved. BHP-from-chart is not imported as measured power. |
| USAAF P-47D-10, 43-75035 as transcribed, R-2800-63 | [Eng-47-1652-A, 11 October 1943](https://wwiiaircraftperformance.com/org/p-47/p-47.html), B.1 and B.2 | 11 speed + 10 climb | HTML checked, not scan-audited. Keep serial as printed pending scan review. Manufacturer trials, water injection, Curtiss propeller; not the adjacent later tests. |

Total: **55** observations. The online host is a later transcription of primary test reports, not the original archive. Verification states therefore say `primary_report_transcription` and explicitly disclose the uncompleted scan comparison. No source is silently upgraded to independently verified primary-scan status.

Spitfire source controls: LF 407 mph TAS at 22,000 ft; HF 415.5 mph at 27,800 ft. Speed and climb use different radiator settings and weight treatment. Combat rating was normally limited to five minutes, with a concession for test climbs. These exceptions must not become unlimited operational ratings.

P-51 conflicts are preserved as structured records: summary versus detailed table gives sea-level speed 371 / 370.5 mph, 29,400-ft speed 442 / 442.5 mph, and 25,500-ft climb 2,660 / 2,658 ft/min. The detailed table supplies the plotted value; the alternatives are available in the UI. Two climb rows at 19,500 ft are retained because they refer to different blower gears. The apparently anomalous cruise value at 2,250 rpm is outside this import and must not be silently corrected or reused.

P-47 controls: 435 mph at 31,000 ft, climb 1,520 ft/min at 28,000 ft. Absolute manifold pressure in inHg is not interchangeable with British gauge boost in lb/in². Fuel grade is not asserted where unestablished. Propeller, cooling, weight, armament, water and fuel-load context stay with each test, not just the family label.

## Four statuses, and a separate model gate

- **Measured:** a source-reported flight-test result. The original authors may already have corrected, reduced or faired it. This is not a claim of raw sensor data, fleet-wide performance, or perfect historical certainty.
- **Reconstructed:** our optional linear altitude interpolation between two compatible records. Returned values include both parent observation IDs. No extrapolation, cross-gear bridge, nearest-point replacement or cross-variant borrowing is allowed. Sparse points can hide real peaks; numerical uncertainty remains unknown, not zero.
- **Placeholder:** a named research queue entry with zero observations and no physics model. Engine/rating/test-condition audit is outstanding. Labels identify research subjects, not audited production or deployment windows.
- **Illustrative:** one of the two explicitly generic reference configurations. Every coefficient remains an assumption. It cannot be returned as a historical aircraft's model.

Historical entries have `model: null`. The solver accepts only immutable illustrative models returned by `modelFor`. The registry deliberately has no historical simulation enabled yet. Adding measured points or an interpolated curve is insufficient to enable aircraft physics.

Graph interaction: dashed visual guides connect observations only within the same test configuration and supercharger gear. They do not add measurements or change the optional reconstruction setting. Floating readouts snap to the nearest reported altitude using the actual, irregular altitude spacing and show exact values, units, gear and source. Mouse hover, touch taps and left/right arrow keys are supported; Escape dismisses the readout. The illustrative signed-energy plot has the same inspection controls with explicit scenario labels.

## Adding coverage

1. Add an exact test configuration with stable ID, force/research context, family, mark/block, specimen, engine and source. Keep different ratings, propellers, engines and test airframes separate, even for the same variant.
2. Record report title, date if established, URL, table/section, source provenance, audit level, units, loading, fuel/boost/rpm, cooling/drag setup, corrections, limitations and conflicts. Never invent missing conditions. Do not import plotted chart points as exact table values without a digitization method and error estimate.
3. Preserve raw reported numbers in the canonical JSON. Current tuple schema is `[altitudeFt, value, gear]`; speed is mph TAS and climb is ft/min. Other units, metrics or multiple rating curves require an explicit schema extension, not an implicit conversion. A single configuration's speed and climb conditions may differ, as documented.
4. Replace only the matching research placeholder. Keep unsourced siblings missing. Add independent numeric source controls and tests for missing boundaries. Build and review the generated diff.
5. A future historical physics model needs engine/propeller/drag inputs with provenance, separate calibration and independent validation datasets, explicit error tolerances over altitude/speed/rating/weight, and documented limits. Current invariant tests verify accounting and dimensional relationships, not aircraft accuracy.

The current 89 placeholders span six force/research groups. Coverage is intentionally incomplete: additional marks, blocks, night fighters, naval aviation, operators and theatre-specific equipment can be added without changing the UI or solver. These are not all-inclusive lists of a nation's wartime types.

## Leads preserved for subsequent audits

- [Messerschmitt Bf 109 E report index](https://www.wwiiaircraftperformance.org/me109/me109e.html): manufacturer tests for W.Nr. 1791 / 1792 / 1774, handbook curves, captured-aircraft tests and DB 601 manuals. Reviewed as an index only in this increment; German numerical records were not imported from uninspected chart images.
- Spitfire tables V/VI: expand the sparse corrected summary only after reconciling measured versus boost-corrected curves. Do not combine uncorrected HF data with the corrected summary.
- P-51 report: reconcile original scan, detailed tables, summary and carburettor uncertainty before fitting performance; keep chart-derived horsepower distinct from torque measurements.
- VVS, French and Italian variants: acquire original test reports with documented specimen/engine/fuel conditions. No invented performance fills these gaps.

## Verification and release

Thirteen Node suites cover cross-platform build reproducibility, historical regressions, ledger controls, registry uniqueness, source references, immutable models, interpolation parents/bounds, unknown-input rejection, EAS/TAS and sustained-turn power balance. Browser checks exercise desktop and 390px mobile views, source discovery, historical/illustrative switching, placeholders, labeled reconstruction and the default v7.4 route. Physics uses equivalent airspeed (EAS); it does not model instrument errors or compressibility. No-feasible-level-flight envelope values remain missing instead of becoming zero climb.

Publish the integration commit only after these checks pass; wait for its GitHub validation, then fast-forward the Pages-serving `main` branch without force. Verify the deployed files and browser paths. The main URL continues to open v7.4; `?preview=7.5` opts into this work. Full v7.5 completion and aircraft-accurate physics remain open work.
