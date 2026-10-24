# Data provenance and modeling safeguards

This file documents the most important scope boundaries behind the European Air War Atlas.

## Original values vs estimates

**Recorded** values are transcribed from original official tables or archive-based secondary transcriptions, with a named source and the original reporting population. **Derived** values use mathematical operations on recorded data (for example, multiplying a 1943 reported loss percentage by that month's reported fighter strength). **Higher-confidence estimates** interpolate close, comparable checkpoints. **Lower-confidence estimates** fill larger time gaps or allocate known totals by inferred proportions. **Scenario only** values explore assumptions but should never be cited as historical results.

**Version 6:** independently checked the scanned RAF **AHB VII/107** German single-engine fighter strength/serviceability returns (27 separate source-month snapshots in this release, ranging August 1938–13 April 1945); this fixes an older mixing of stock and serviceability figures. The archive has more daily/weekly columns than were transcribed into v6, so 27 is **not** a claim that only 27 wartime reports exist. The original reporting *day* is retained on every checkpoint. Both exact values are shown separately, and intermediate monthly values explicitly carry a high/low interpolation tag. **No fabricated 8 May 1945 original German fighter inventory** is displayed; the v3 simulator's hypothetical May value is marked model-only.

### July 1936–May 1945 pilot cohorts

- Germany-wide 1936–1942 fighter pilot staffing and monthly hazards in the original Monte Carlo engine are exploratory assumptions; historical tables constrain selected periods in 1942–May 1944. July 1936 is the earliest simulator month. VE Day is 8 May 1945, so there is no fabricated post-May continuation.
- The Condor Legion was a deployed unit whose service rotated across hundreds of pilots; those pilots are a **cohort within** a larger national force, not the whole wartime Luftwaffe.
- Murray's Table LXVIII gives month-by-month **fighter-pilot strength-loss percentages from January 1942 to May 1944**. The historical view displays these on their own, separately from simulated individual pilot careers. Absolute reported fighter-pilot casualty counts are only entered for **September–December 1943 and January–May 1944**; do not multiply missing rates by an assumed pilot force and call those actual wartime casualties.
- Pilot loss/casualty reporting does not equate automatically to a fatality or permanent disappearance; wounded, missing, POW, returned and released outcomes require different administrative categories. The simulator explicitly lets users vary re-entry.
- Source-driven veteran percentages are not historical rosters of individually reconstructed sortie, combat-encounter and victory totals. Those remain modeled.

### German airframes

- Zamansky transcribes multiple original German measures: *on strength*, *front-line posted*, and *serviceable*. These are not interchangeable.
- The RAF German Quartermaster **VII/107** dates report all-front single-engine fighters: **26 August 1939 788 on strength / 686 serviceable; 17 August 1940 1,076 / 853; 31 August 1943 1,581 / 1,019; 31 October 1944 3,055 / 2,487; 13 April 1945 2,173 / 1,648**. The two columns must not be mistaken for pilot headcounts, theater-specific forces, or model-only Bf 109 stock. Alfred Price's Wikipedia-reproduced serviceable strengths differ materially: e.g. 787 for 17 August 1940 instead of VII/107's 853. The series must be reconciled by definitions, not spliced into a curve.
- 1943 single-engine on-strength data are compared with Murray's **August 1943 1,581 present / 1,019 operational-ready** fighters only with a denominator warning. A residual calculation creates approximate Bf 109 numbers from the German single-engine fighter force minus Fw 190 figures; small other types may be included.
- Zamansky's September 1943–September 1944 theater losses cover **all German operational aircraft categories**, NOT just fighters. Full quarters stay quarters. A 71% Q2 loss/strength rate is **not** a 71% risk per sortie.
- German fighter write-off numbers for October–December 1943 are **derived** from Murray's recorded percentages and counts. A 1944 8,500 annual fighter-write-off figure is distributed by an illustrative monthly shape in the legacy calculator and visibly marked **allocated**. No unrecorded 1945 mass aircraft/pilot disappearance is inserted.
- **Original USAAF official history Volume III chapter 17** includes a September 1944 daily average inventory table for Ninth AF (1,502 fighters / 968 operational), RAF Second Tactical AF (999/879), Eighth AF (1,234/904) and Fifteenth AF (559/402): total **4,294 on strength / 3,153 operational** across those four Allied commands. It separately cites Luftflotte Kommando West's **431 fighters on strength on 25 September 1944**. The command theater and reporting dates differ; do not compare this 431 with RAF VII/107's *worldwide* Luftwaffe force without scope matching.

### USAAF / RAF airframes and losses

- Official **USAAF ETO type inventories** track operational aircraft present, not automatically combat-ready aircraft. The dated snapshot series is quarterly; intermediate months are labeled interpolation, not original monthly counts.
- **RAF fighter type figures** are selected Fighter Command / Air Defence of Great Britain and later 2nd Tactical Air Force components from a different reporting convention, including serviceability differences. They cannot be summed with USAAF and German worldwide strengths to infer a clean local numerical superiority ratio.
- Original **USAAF Statistical Digest Table 104** contains ETO fighter losses **across all fighter types**. The historical **first-line (combat + accident) totals** are 68 (1942), 301 (1943), 4,758 (1944) and 1,997 (**January–August 1945**, including post-VE reporting). Those add to 7,124 and exclude the separate second-line and downgrade columns. **Do not compare the 1945 Jan–Aug loss total with Table 167's Jan–May wartime claims without matching reporting windows.** The Atlas also contains verified July–December 1943 and January–April 1944 first-line monthly values: January 1944 **110** and March 1944 **229** (as distinct from all-line totals 111 and 232). A lower-confidence allocation by ETO type inventory is exploratory, **not** a recorded P-47/P-51/P-38 loss split. A separate, later Table 104 document covering calendar 1945 uses different administrative dates and totals: not merged into this series.
- Official **Table 82** flyaway prices compare aircraft procured under federal fiscal-year programs; the 1944 values **P-47 $85,578** vs **P-51 $51,572** do not include all operating/support costs.
- Factory acceptances **worldwide** in a calendar year (Table 75) are not the same as aircraft delivered to Europe or currently available on a front.
- Original **USAAF Statistical Digest Table 128** gives **29 individual months January 1943–May 1945** of fighter sorties by role for both ETO and MTO: escort, bombing/strafing, reconnaissance and other. Both theater series reconcile month-by-month to row and annual source totals: **ETO 27,260 (1943), 365,284 (1944), 176,553 (Jan–May 1945)**; **MTO 112,193, 183,528 and 58,811**, respectively. They are **all USA(A)F fighter types together**, not P-47/P-51-specific missions. Source text indexing rendered the MTO February 1944 escort cell as 6,628, but both the row total 12,522 and the year's escort sum 65,348 require **2,628**, which is the arithmetic-corrected value shown (see inline data comment). No other source values are silently altered.
- Original **USAAF Statistical Digest Table 159** documents **U.S. aircraft lost on combat missions** in the ETO by **fighter, heavy bomber and medium/light bomber classes**, with separate cause attribution for enemy aircraft, antiaircraft and other causes. The Atlas includes original annual totals for 1942 Aug–Dec, 1943, 1944 and 1945 Jan–May; all **17 months Jan 1944–May 1945** are transcribed per class/cause. Every entered monthly cause row reconciles to its total; every year's monthly class/cause sum matches the annual official table. In 1944: **3,765 U.S. fighter combat-mission losses** (1,293 enemy aircraft; 1,611 flak; 861 other), and **3,497 U.S. heavy bombers** (1,516 enemy aircraft; 1,587 flak; 394 other). These are not German write-offs, not P-47/P-51-specific losses, and are a different event definition from Table 104's broader first-line loss tally. August 1944 heavy-bomber air attribution is stored as **61** because 61+238+32=331 and it reconciles the printed annual 1,516, whereas indexed PDF text may show 60.
- The original RAF July–September 1940 readiness figures are given **separately** from the cross-period RAF survey so readers can see why denominators matter.

### Aircraft claims and attribution

- A wartime victory claim may be accepted after review but still not match an identifiable enemy aircraft loss. Claims by aircraft type and month require the same theaters and campaign periods for a meaningful comparison.
- Original **USAAF Statistical Digest Table 167 is often misread**: its heading 'by type of AAF airplane' refers to **fighter versus bomber categories**, not P-47 versus P-51. Its original **monthly fighter-class air/ground claims** from **August 1942 through May 1945** are now transcribed in full and displayed for matching time windows, including source-reported zeroes. Before August 1942 is **not reported**, not zero. The monthly figures reconcile *exactly* to all four printed yearly subtotals shown below. They include all USAAF fighter models, not RAF or Soviet aircraft.

  | Year | Credited in air | Credited on ground | Combined |
  | --- | ---: | ---: | ---: |
  | 1942 Aug–Dec | 7 | 0 | 7 |
  | 1943 | 451 | 0 | 451 |
  | 1944 | 5,602 | 2,375 | 7,977 |
  | 1945 Jan–May | 1,362 | 4,421 | 5,783 |
  | **Total** | **7,422** | **6,796** | **14,218** |

- No original all-Allied **fighter-model by month** accepted-claims dataset has been ingested yet. The claims attribution controls use fighter availability as an explicitly **lower-confidence proxy**, or allow users to enter hypothetical accepted-claim percentages themselves.
- The **Eighth Fighter Command Summary of Combat Operations** research compilation now provides an independently categorized **whole-war** American model breakdown (not every air force in the ETO): Spitfire **13** aerial claims, P-47 **1,550.5**, P-38 **278.5**, P-51 **3,328**; total **5,170**. Ground credits P-47 **739**, P-38 **161.5**, P-51 **3,212.8**; total **4,113.3**. Its air-combat-related American fighter losses sum to **644**, and its per-type strafing-related losses sum to **890**. The report's own final *All types* summary prints **889 strafing losses** despite both the model type rows and the group totals yielding 890. V6 **retains this discrepancy explicitly** rather than silently forcing reconciliation. This is a compilation based on Victory Credits Board and MACR documents, **not a contemporary universal database of verified German destruction**. Neither the 8th-only type shares nor the World War II all-force shares can be applied as fixed weights to each German month's losses.
- In **Big Week (20–25 February 1944)** the official USAAF history reports Eighth 2,548, Ninth 712 and Fifteenth 413 USAAF fighter supporting sorties, **28** USAAF fighter losses, and **226** combined Eighth/Fifteenth heavy bombers lost; RAF night bomber losses form a different category. The same official history warns of a German Western fighter February 1944 monthly casualty figure of **456** versus a possible **533** if 77 delayed reports belong in February. These are not *Big Week* German loss counts and must not be treated as such.
- Even reliable percentages of Allied accepted claims should apportion only an appropriate **air-to-air** loss pool — not every German airframe write-off, a factory bombing loss, pilot fatality or ground-destroyed parked aircraft.
- Raw victory totals alone do not establish superiority of an airframe's shooting-down capability; exposure, escorts vs ground attack, operational availability, probability of engaging German fighters and front/location all matter.

### Research priority

1. Find **USAAF Eighth and Ninth Air Force original fighter group claims and mission returns** split by model, month, theater and in-air/on-ground credits. **Table 167 cannot provide that model breakdown.**
2. Extract more original **Table 104** months (remaining 1944/1945) and, if available, model-specific fighter loss tables; retain first-line vs second-line and combat vs accident distinctions.
3. Digitize the German original loss, personnel and type return series with independent denominator checks for 1940–1942 and 1944–45.
4. Research source-reconciled sorties/flying-hours by model and role, particularly **July 1943–6 June 1944**.
5. Add RAF 1940 and 1944 fighter readiness, original RAF claims and Soviet theater strengths at matching scopes.

Missing values are missing; they are not zero. A high-fidelity historical dashboard must sometimes leave a blank cell.
# V7: archival personnel flows, readiness and visible source gaps

V7 adds original captured German command data **without** adjusting the legacy casualty calibration by fiat. For April 1944 RAF AHB VII/71/Galland reports 489 pilots lost, 396 reinforcements; the existing Murray monthly absolute series is 447. The difference in report population or definitions is not sufficiently reconciled to treat 489 and 447 as interchangeable. The 93-pilot arithmetic difference between reported flows is **not** total fighter pilot net strength, and neither count is pilot deaths alone.

Murray's 31 Dec 1943 2,395 German frontline single-engine fighter pilots comprise 1,491 ready, 291 partly ready, and **613 derived residual**. Luftflotte Reich 1944 readiness points are geographically restricted, not Germany-wide totals. Seven Murray fuel series points are **percentages of refinery production capacity**, not aviation gasoline tonnage or inventory at airfields. The unit reports for III./JG53 and II./JG53 illustrate intensity; they cannot be scaled to all squadrons.

The 20 AHB original German aircraft-loss volumes have exact date-window and theater links in a filterable index. V7 originally left the scans numerically untranscribed; v7.1 has now added the first four verified month-end all-aircraft totals and the separately labeled provisional aircraft-type transcript. The monthly chart coverage strip reports absence honestly, never converting missing dates into invented zeros or a continuous curve.

## V7.1: exact German month-end loss returns, May–June 1944

Original RAF AHB reports VII/134 (Reich May), VII/133 (Western Front May), VII/139 (Reich June) and VII/136 (Western Front June) were inspected at the original scanned **MONTH'S TOTAL / TOTAL LOSSES** row. The three top-level outcome classes do not overlap; **missing aircraft are part of enemy-action destroyed**. "Damaged" is not interchangeable with destroyed. Reporting geography is Luftflotte Reich or Luftflotte 3, **not the entire German air force**.

| Month / command | Enemy-action destroyed / damaged | Other operational destroyed / damaged | Non-operational destroyed / damaged | All destroyed / damaged |
| --- | ---: | ---: | ---: | ---: |
| May 1944 Reich · VII/134 p22 | 556 / 180 | 107 / 157 | 261 / 349 | **924 / 686** |
| May 1944 Western Front · VII/133 p15 | 228 / 71 | 27 / 51 | 88 / 147 | **343 / 269** |
| June 1944 Reich · VII/139 p24 | 208 / 90 | 42 / 44 | 183 / 405 | **433 / 539** |
| June 1944 Western Front · VII/136 p23 | 818 / 220 | 113 / 219 | 67 / 160 | **998 / 599** |

**Original transcription caveat:** West May's printed enemy-action subtotal is 228, but adding its visibly legible breakdown of subcauses seems to yield 229. We preserve the printed subtotal and show this one-unit discrepancy openly. The final monthly totals are distinct from long-run all-front single-engine-fighter losses by Murray / Zamansky, and the sources' named damaged-aircraft category is not a write-off by definition.

The provisional **June 1944** Bf 109/Fw 190 subtotals were obtained with `scripts/inspect-ahb-losses.py`, whose source PDFs are linked from the dashboard. Page 15 of both June PDFs has an inverted searchable text layer; four aircraft-type rows per document were read directly from the upright scans, and five ambiguous OCR cells were corrected by eye. These candidate sums are *not yet independently reconciled against every original daily row*. They are kept separate from the four verified monthly totals, and no modeled percentages are used to fill May's aircraft-type breakdown or dates elsewhere.

