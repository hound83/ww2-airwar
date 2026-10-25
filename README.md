# European Air War Atlas · 1936–May 1945

**Version 7.3** · Theater-aware, period-first airpower research with Soviet VVS original source checkpoints, collapsible ledgers, estimated monthly airframe-variant mixes, and event-weighted German theater-loss reconstructions. All thirty v7.2 original German command-month observations remain unchanged.

An interactive, source-led historical dashboard for the European air war: fighter-pilot attrition and experience, German and Allied equipment, aircraft production, theater strength, casualties, victory claims and hypothetical cohort simulations.

**[Open the dashboard](https://hound83.github.io/ww2-airwar/)**

> The dashboard is a historical exploration and **scenario model**, not a precise reconstruction of every airframe or pilot. It distinguishes observed returns, derived values, two confidence grades of estimation and hypothetical scenarios. Unsupported months are **visually identified** and never treated as zero.

### New in v7.3

- **Period-first analysis:** a selected date interval produces average fighter inventories, start/end fighter strength and cumulative flows only where valid. Clicking an archival month optionally drills in; there is no second mandatory month picker. The date slider disappears entirely from About and Research & sources.
- **Overall / Western / Eastern theater lens** across historical views, with a sourced Eastern Front fighter chart and separate scope notes. *Overall is not simply West + East:* Germany's reported fighter class can also include Mediterranean, Scandinavia, Reich defense and other areas. The existing pilot and aircraft simulators retain their independent front-exposure controls, without pretending to be complete Soviet operational simulators.
- **Five original Soviet fighter-strength checkpoints** from published Soviet General Staff statistical tables, 1 July 1943 through 1 May 1945. They count VVS **front air armies and command reserves**, not every Soviet air service. The source is transcribed at RKKA.es with original Soviet archival document references. Direct dates are recorded; between-point reconstructions are marked *Interpolated*, not recorded; unsupported years remain blank.
- **Aircraft variants** (e.g. Bf 109 E/F/G/K-4, P-51 B/C vs D/K) with explicit modeled deployment windows and month/year views. Numerical subtype splits are **Estimated** from model weights and the existing type-family inventory, never claimed as original wartime by-variant counts. German, RAF, USAAF and Soviet monthly ledgers expand independently and have sticky column headers.
- **Event-sensitive monthly German loss estimates** distribute verified *quarterly*, front-specific **all-aircraft** totals over constituent months, with weights for major actions. The months carry an **Estimated** status; source quarterly sums reconcile exactly. This is a transparent allocation scenario, not a discovered original monthly return. Ordinary straight-line values strictly between two original stock checkpoints carry **Interpolated** status.
- **Less visual noise:** supplementary datasets now default to collapsed panels, original German returns no longer crowd the airpower overview, Battle of Britain RAF comparisons appear only with the relevant campaign, country and theater coverage is stated, and chart hover readouts sit beside the pointer with crosshair/active-point emphasis. The sticky settings sidebar is visually isolated from passing graphs.

### Added in v7.2

- **26 additional original month-end returns** manually read from eight more captured German reports (RAF AHB VII/148–149, VII/135/138, VII/142/144 and VII/143/145), augmenting v7.1's four. Both Reich and Western-command series now have verified monthly totals for **all fifteen months from September 1943 through November 1944**. They do **not** represent all German aircraft on all fronts.
- **Explicit number-and-gap calendar:** each year has one row per selected German command, with a number in each source-covered month and a hatched **—** in unsupported months. Hover for the original citation, click a covered cell to inspect that month. Missing months never turn into zero.
- **Original cause detail:** selectable destroyed or damaged categories and a *missing-aircraft subset* metric. Each row shows the scanned document and PDF page, while CSV export preserves every source category and citation ID. “Missing aircraft” is included in enemy-action destroyed and must **not** be added again.
- **Original-document reconciliation:** RAF VII/138 March 1944 has a handwritten correction to its non-operational **damaged** column: **202** replaces **304**. We use 202, although plain OCR reports the crossed-out 304. From September 1944 the Western return is from Luftwaffenkommando West, renamed from Luftflotte 3, and is explicitly marked as a reporting-boundary change.

### New in v7.1

- **Four primary month-end aircraft-loss totals transcribed and checked against original scans:** Luftflotte Reich and Luftflotte 3 (Western Front), May and June 1944. Enemy action, other operational losses and non-operational losses are separate; each has **destroyed and damaged** columns. Aircraft missing are **already included** in enemy-action destroyed. These are **not** German fighter-only casualties or confirmed Allied kills.
- **May all-aircraft write-offs:** Reich **924**, Western Front **343**. **June:** Reich **433**, Western Front **998**. The printed Western May enemy-action subtotal **228** may differ by one from adding its legible component headings; the site preserves the printed value and explicitly flags the discrepancy.
- **June Bf 109 / Fw 190 aircraft-type research view:** 167 OCR-assisted type rows across two original German command registers, with inverted text-layer page and suspect glyphs checked against scans. These remain **provisional working transcriptions**, not independently verified complete month-by-type records; no allocation is generated for other months.
- **New loss-cause and theater controls** on the Losses & claims tab, missing-month-aware charts, direct citations, hover inspection and CSV export columns that identify original versus provisional data.

### Introduced in v7.0

- **Visible missing-data coverage:** every archival chart reports how many selected months have observations, displays an observed/missing coverage strip, and allows switching between *focus on observed months* and *full selected period* with visually hatched gaps. Entirely unsupported periods receive an explanatory panel. Hover/touch/keyboard inspection identifies unavailable points without pretending zero losses.
- **Captured original personnel record:** 15–16 May 1944 Göring/Galland conference reports **489 fighter pilots lost** against **396 replacements** in April. We explicitly retain and contrast the **447** in the preexisting compiled series; reporting definitions cannot simply be assumed identical. Its net 93-person flow difference is not a complete historical force balance.
- **German fighter-pilot readiness:** at 31 December 1943, **2,395** frontline single-engine fighter pilots, **1,491** fully and **291** partially combat-ready, 613 residual classified only by subtraction.
- **Luftflotte Reich fighter availability:** 1 June, 1 July and 27 July 1944 original strength versus ready figures; two JG 53 Gruppe-level equipment/personnel cases from the spring battles.
- **Fuel-production bottleneck:** seven dated 1944–45 aviation versus overall fuel-capacity percentages from Murray Table LVIII; percentages of production capacity, **not tonnes or inventories**.
- **Twenty identifiable original RAF translations of captured German aircraft-loss reports**, filtering by theater and selection window. V7.2 distinguishes the twelve reports with imported month-end command totals from documents still awaiting transcription.

## What it includes

- **Airpower overview:** German *on strength versus serviceable* aircraft from captured German returns, compared carefully with selected USAAF ETO/RAF fighter organizational inventories, plus theater allocation.
- **Aircraft & equipment:** Original dated worldwide German fighter-strength and serviceability observations (1938–April 1945), multi-aircraft-class archival snapshots, preserved Bf 109/Fw 190 estimates, P-38/P-47/P-51, Spitfire, Hurricane, Typhoon, Tempest and RAF Mustang. Factory production and confidence-labeled losses remain separate.
- **Pilots & experience:** source-reported monthly fighter-pilot strength attrition percentages January 1942–May 1944; absolute casualty counts only for documented months; original replacement flow, 1943 pilot readiness and two local JG 53 unit reports.
- **Losses & claims:** original German theater loss returns, yearly USAAF ETO fighter losses, **complete monthly (August 1942–May 1945) USAAF fighter-class in-air and on-ground credited claims**, **month-by-month U.S. fighter and bomber combat-mission losses by cause (1944–May 1945)**, a separate *Eighth Fighter Command whole-war type-specific claims/loss summary*, original Big Week campaign figures and the expressly **hypothetical** attribution workbench.
- **Industry & operations:** original aircraft procurement costs, yearly U.S. production, European aircraft inventory and flying hours, three dated Reich-only fighter readiness records, fuel-capacity records, plus **all 29 monthly USAAF fighter-sortie reports by mission role (1943–May 1945)** with an ETO/Mediterranean switch.
- **Campaigns & archives:** original Condor Legion through VE-Day date windows, all **22 chapters** of USAAF official history Volume III, and a valuable original **September 1944 four-command Allied operational-strength comparison**.
- **Pilot simulator:** preserved Monte Carlo model of novice/veteran risk, sorties, combat encounters, credited claims, returning pilots and Condor Legion/Battle of Britain cohorts through May 1945.
- **Aircraft simulator:** the existing modeled German readiness/production/write-off views.
- **Research & sources / About:** search original archives, audit the explicit **Wikipedia article → bibliographic citation → verified record** trail, inspect 22 history chapters, provenance, missing data and project history. Show/hide detailed notes through *Show source notes*.
- **Timeline:** July 1936–8 May 1945, with scenario presets, period-wide analysis, optional month inspection by clicking original return calendar entries and toggleable historical event markers.

Charts support **mouse hover, touch/tap and keyboard focus + left/right arrows** to inspect exact monthly numbers and their confidence level. The coverage strip exposes missing historical months; use its button to change the chart's horizontal view.

## Run it

The project is a static site. There is no backend, no database, no telemetry, no paid service and no dependency on a CDN.

- Open the **GitHub Pages website** linked above. The root `index.html` references files in `dist/` and is no longer a redundant giant standalone release.
- For local editing, serve the project directory with a simple HTTP file server such as `python3 -m http.server 8000` and open its localhost URL.
- To rebuild the root entrypoint after editing `dist/index.html`: `node scripts/build-web.cjs`.
- To verify: `node tests/data.cjs`, `node tests/v6.cjs`, `node tests/v7.cjs`, `node tests/v71.cjs`, `node tests/v72.cjs`, `node tests/v73.cjs`, `node tests/render.cjs` and `node tests/tooltips.cjs` (optional Playwright smoke test if a Chromium browser is installed).

The GitHub Pages site is served from the repository's `main` branch and root directory, **once Pages is enabled** under *Settings → Pages → Deploy from a branch → main / (root)*. If you get a 404 on the Pages link, that repository setting still needs enabling.

## Evidence and caveats

The minimum rule is that **fighter-aircraft stock, serviceable aircraft, newly accepted aircraft, aircraft write-offs, pilot positions, personnel casualties, sorties, flying hours and air-to-air claims are different measures**. They cannot be silently converted into one another.

- **Recorded:** published table with the same date and definition.
- **Derived:** reproducible calculation from a recorded source quantity.
- **Interpolated:** directly between dated, compatible source observations; long intervals remain low confidence and have an explanatory note.
- **Estimated:** event-weighted monthly allocations, geographical shares and invented-by-necessity fighter variant splits, with the assumptions disclosed.
- **Scenario only:** a freely adjustable hypothetical mechanism.

Special date caution: **USAAF Table 167 claims end May 1945**, whereas the separate **Table 104 first-line aircraft-loss subtotal for 1945 covers January–August**, including post-war administration. The app identifies both periods and does not imply a matched-denominator kill/loss ratio.

An estimated number is never styled as wartime documentation merely because it has many decimal places. Prewar Condor Legion strength is tracked as a *small unit of deployed rotating pilots*, not the entire German fighter force. The simulation's German national 1936–42 pilot-strength baselines remain scenarios, not archival censuses. For the original data gaps and source scopes, see [DATA_NOTES.md](DATA_NOTES.md).

**Important v6 correction:** an earlier aircraft curve mixed values for fighters *on strength* with aircraft *serviceable* and treated some published snapshots from differently defined series as comparable. V6 displays both columns of RAF Air Historical Branch VII/107 as separate series. In the original cohort simulator only the serviceable source values anchor the continuous aircraft curve. Historical charts **stop after the last compatible April 1945 return**, even though the calculator's May 1945 scenario remains available. The two measurements and their exact dates are explained in [SOURCE_AUDIT.md](SOURCE_AUDIT.md).

## Main sources

- [USAAF Statistical Digest: World War II](https://www.ibiblio.org/hyperwar/AAF/StatDigest/index.html), notably Tables 55, 74–82, 104, 107, 128, 159 and 167. **Table 167 reports fighter-class claims, NOT claims by individual P-38/P-47/P-51 model.**
- [Official digitized USAAF Statistical Digest (PDF)](https://media.defense.gov/2011/Mar/31/2001330134/-1/-1/0/AFD-110331-045.pdf).
- [Dan Zamansky, *Luftwaffe: A Case Study*](https://www.ww2.dk/Dan%20Zamansky%20-%20The%20Study.pdf), using original Bundesarchiv records for German fighter strength, geography and theater losses.
- [Williamson Murray, *Strategy for Defeat*](https://www.airuniversity.af.edu/Portals/10/AUPress/Books/B_0012_MURRAY_STRATEGY_FOR_DEFEAT.pdf), German fighter personnel and aircraft returns.
- [USAAF ETO type-by-type strength transcription](https://www.theworldwars.net/stats/file.php?e=ww2&s=airstrusaafeur) and [RAF operational strength transcription](https://www.theworldwars.net/stats/file.php?e=ww2&s=airstrrafeur).
- [Royal Air Force Air Power Review, Battle of Britain readiness analysis](https://www.raf.mod.uk/what-we-do/centre-for-air-and-space-power-studies/aspr/apr-vol1-iss2-5-pdf/).
- [RAF AHB VII/107: original German aircraft strength and serviceability, August 1938–April 1945](https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/ahb-translations-from-captured-german-documents/luftwaffe-strength-and-serviceability-tables-august-1938-april-1945/).
- [USAAF official European war history, Volume III, all 22 chapters](https://www.ibiblio.org/hyperwar/AAF/III/); notably [chapter 2, Big Week](https://www.ibiblio.org/hyperwar/AAF/III/AAF-III-2.html) and [chapter 17, Check at the Rhine](https://www.ibiblio.org/hyperwar/AAF/III/AAF-III-17.html).
- [Eighth Fighter Command Summary of Combat Operations](https://www.wwiiaircraftperformance.org/marshall/SUMMARY_OF_COMBAT_OPERATIONS.pdf), research compilation of wartime award/crew records, and [US Strategic Bombing Survey](https://www.ibiblio.org/hyperwar/AAF/USSBS/ETO-Summary.html).
- [RAF AHB translated German aircraft loss series, 1939–44](https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/ahb-german-translations/); [Bundesarchiv guide to aircraft-loss research](https://www.bundesarchiv.de/en/research-our-records/research-by-topic/the-fate-of-downed-airplanes-and-their-crews-in-the-second-world-war/), and [NARA RG18](https://www.archives.gov/research/guide-fed-records/groups/018.html).
- [Soviet Air Force General Staff figures, archive-cited Russian-language statistical tables](https://www.rkka.es/Estadisticas/VVS_stat/02/02_08.htm), with additional dated tables in the v7.3 source ledgers. The source's force definition explicitly excludes PVO and Naval Aviation from our front-air-army calculation.
- [National Museum of the USAF: North American P-51D](https://www.nationalmuseum.af.mil/Visit/Museum-Exhibits/Fact-Sheets/Display/Article/196263/north-american-p-51d-mustang/) supports introductory B/C and D deployment chronology, **not** our estimated monthly P-51 model split.

For a clickable bibliography showing **which Wikipedia page referenced which potentially useful monograph**, which source was actually inspected, and which leads remain unverified, see [SOURCE_AUDIT.md](SOURCE_AUDIT.md) and the live **Research & sources** tab.

## How the files fit together

| Path | Purpose |
| --- | --- |
| `index.html` | Generated, modular GitHub Pages entry point |
| `dist/index.html` | Editable HTML source |
| `dist/atlas.css` | Subdued WWII-inspired palette and existing responsive layouts |
| `dist/model-v3-data.js` | Preserved simulation/data baseline |
| `dist/model-v3.js` | Preserved Monte Carlo pilot/equipment application |
| `dist/model-v4-data.js` | New annotated dated historical data series |
| `dist/atlas-v6-data.js` | RAF VII/107 returns, separate WWII fighter-type awards, campaign and complete bibliography audit |
| `dist/atlas-v7-data.js` | German fighter-pilot flows, readiness, training/fuel context and twenty original German loss-return archive links |
| `dist/atlas-v71-data.js` | Four source-checked May–June 1944 German monthly totals and explicitly provisional June Bf 109/Fw 190 source-line breakdown |
| `dist/atlas-v72-data.js` | Twenty-six additional visually checked 1943–44 original German monthly totals and eight source-linked PDF-page maps; no inferred gaps |
| `dist/atlas-v73-data.js` | Soviet front-air-army source checkpoints, estimated variant allocation windows, event-weighted quarter-to-month German theater-loss models |
| `tests/v73.cjs` | V7.3 sourcing, reconstruction classification and loss-quarter reconciliation tests |
| `scripts/inspect-ahb-losses.py` | Reproducible OCR inspection aid for 1944 RAF loss scans; see source caveats before treating its output as measured totals |
| `dist/model-v4.js` | New Atlas views and interactive analyses |
| `dist/atlas-v5.js` | Chart tooltips, tap and keyboard inspection, historical event overlays |
| `dist/atlas-v6.js` | Versioned source-integrity helper and integration |
| `SOURCE_AUDIT.md` | Research provenance and Wikipedia-to-source bibliography |
| `tests/v6.cjs` | v6 archival arithmetic, reporting windows and source boundaries |
| `scripts/build-web.cjs` | Rebuilds the root modular Pages entry point |
| `tests/smoke.cjs` | Optional browser interactions test, requires Playwright locally |

## Historical claims are not model-specific proof

The original Table 167 gives 1944 ETO **5,602 fighter-class air-to-air credits** and **2,375 enemy aircraft credited as destroyed on the ground**, for all USAAF fighter types combined. These are credited claims, not independently documented German destroyed aircraft. The dataset includes **all 34 source-recorded monthly reporting rows**, August 1942–May 1945, which reconcile with all four annual totals. Table 128 separately gives monthly combat fighter sorties by role and theater. Model-specific claim histories remain unavailable rather than invented. See [DATA_NOTES.md](DATA_NOTES.md).

No license has been assigned to the repository. Before inviting third-party code contributions or redistribution, the project owner should choose a license deliberately.
