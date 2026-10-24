# Data provenance and modeling safeguards

This file documents the most important scope boundaries behind the European Air War Atlas.

## Original values vs estimates

**Recorded** values are transcribed from original official tables or archive-based secondary transcriptions, with a named source and the original reporting population. **Derived** values use mathematical operations on recorded data (for example, multiplying a 1943 reported loss percentage by that month's reported fighter strength). **Higher-confidence estimates** interpolate close, comparable checkpoints. **Lower-confidence estimates** fill larger time gaps or allocate known totals by inferred proportions. **Scenario only** values explore assumptions but should never be cited as historical results.

### July 1936–May 1945 pilot cohorts

- Germany-wide 1936–1942 fighter pilot staffing and monthly hazards in the original Monte Carlo engine are exploratory assumptions; historical tables constrain selected periods in 1942–May 1944. July 1936 is the earliest simulator month. VE Day is 8 May 1945, so there is no fabricated post-May continuation.
- The Condor Legion was a deployed unit whose service rotated across hundreds of pilots; those pilots are a **cohort within** a larger national force, not the whole wartime Luftwaffe.
- Pilot loss/casualty reporting does not equate automatically to a fatality or permanent disappearance; wounded, missing, POW, returned and released outcomes require different administrative categories. The simulator explicitly lets users vary re-entry.
- Source-driven veteran percentages are not historical rosters of individually reconstructed sortie, combat-encounter and victory totals. Those remain modeled.

### German airframes

- Zamansky transcribes multiple original German measures: *on strength*, *front-line posted*, and *serviceable*. These are not interchangeable.
- 1943 single-engine on-strength data are compared with Murray's **August 1943 1,581 present / 1,019 operational-ready** fighters only with a denominator warning. A residual calculation creates approximate Bf 109 numbers from the German single-engine fighter force minus Fw 190 figures; small other types may be included.
- Zamansky's September 1943–September 1944 theater losses cover **all German operational aircraft categories**, NOT just fighters. Full quarters stay quarters. A 71% Q2 loss/strength rate is **not** a 71% risk per sortie.
- German fighter write-off numbers for October–December 1943 are **derived** from Murray's recorded percentages and counts. A 1944 8,500 annual fighter-write-off figure is distributed by an illustrative monthly shape in the legacy calculator and visibly marked **allocated**. No unrecorded 1945 mass aircraft/pilot disappearance is inserted.

### USAAF / RAF airframes and losses

- Official **USAAF ETO type inventories** track operational aircraft present, not automatically combat-ready aircraft. The dated snapshot series is quarterly; intermediate months are labeled interpolation, not original monthly counts.
- **RAF fighter type figures** are selected Fighter Command / Air Defence of Great Britain and later 2nd Tactical Air Force components from a different reporting convention, including serviceability differences. They cannot be summed with USAAF and German worldwide strengths to infer a clean local numerical superiority ratio.
- Original **USAAF Statistical Digest Table 104** contains ETO monthly losses **across all fighter types**, including combat and accident categories. The Atlas contains verified July–December 1943 and January–April 1944 ETO totals. A lower-confidence allocation by relative ETO type inventory is provided for exploratory comparison; it is **not** the historical P-47/P-51/P-38 loss split.
- Official **Table 82** flyaway prices compare aircraft procured under federal fiscal-year programs; the 1944 values **P-47 $85,578** vs **P-51 $51,572** do not include all operating/support costs.
- Factory acceptances **worldwide** in a calendar year (Table 75) are not the same as aircraft delivered to Europe or currently available on a front.
- The original RAF July–September 1940 readiness figures are given **separately** from the cross-period RAF survey so readers can see why denominators matter.

### Aircraft claims, attribution and the P-47/P-51 debate

- A wartime victory claim may be accepted after review but still not match an identifiable enemy aircraft loss. Claims by aircraft type and month require the same theaters and campaign periods for a meaningful comparison.
- No original all-Allied per-type, per-month *accepted claims* dataset has been ingested yet. The claims attribution controls use fighter availability as an explicitly **lower-confidence proxy**, or allow users to enter hypothetical accepted-claim percentages themselves.
- Even reliable percentages of Allied accepted claims should apportion only an appropriate **air-to-air** loss pool — not every German airframe write-off, a factory bombing loss, pilot fatality or ground-destroyed parked aircraft.
- Greg's **4,429 European P-47 aircraft** figure and the Millville Museum slide's **11,878 destroyed in air and on ground / 546,000 sorties** retain their *reported* status until checked for theater, time span, types of claim and counting conventions against original USAAF Table 167 and other original sources. They do not seed the simulator as confirmed numbers.
- Raw victory totals alone do not establish superiority of an airframe's shooting-down capability; exposure, escorts vs ground attack, operational availability, probability of engaging German fighters and front/location all matter.

### Research priority

1. Extract **Statistical Digest Table 167** with complete row definitions for USAAF enemy aircraft destroyed by P-47, P-51 and P-38 in the European theater; reconcile Greg's 4,429 claim.
2. Extract more original **Table 104** months (the full year 1944/1945) and, if available, model-specific loss tables; retain all-cause vs combat distinctions.
3. Digitize the German original loss, personnel and type return series with independent denominator checks for 1940–1942 and 1944–45.
4. Research source-reconciled sorties/flying-hours by model and role, particularly **July 1943–6 June 1944**.
5. Add RAF 1940 and 1944 fighter readiness, original RAF claims and Soviet theater strengths at matching scopes.

Missing values are missing; they are not zero. A high-fidelity historical dashboard must sometimes leave a blank cell.
