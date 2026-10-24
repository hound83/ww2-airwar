# European Air War Atlas · 1936–May 1945

**Version 7.0** · Original German pilot-replacement conference, dated operational returns, source-coverage charts and located German loss-register archive.

An interactive, source-led historical dashboard for the European air war: fighter-pilot attrition and experience, German and Allied equipment, aircraft production, theater strength, casualties, victory claims and hypothetical cohort simulations.

**[Open the dashboard](https://hound83.github.io/ww2-airwar/)**

> The dashboard is a historical exploration and **scenario model**, not a precise reconstruction of every airframe or pilot. It distinguishes observed returns, derived values, two confidence grades of estimation and hypothetical scenarios. Unsupported months are **visually identified** and never treated as zero.

### New in v7.0

- **Visible missing-data coverage:** every archival chart reports how many selected months have observations, displays an observed/missing coverage strip, and allows switching between *focus on observed months* and *full selected period* with visually hatched gaps. Entirely unsupported periods receive an explanatory panel. Hover/touch/keyboard inspection identifies unavailable points without pretending zero losses.
- **Captured original personnel record:** 15–16 May 1944 Göring/Galland conference reports **489 fighter pilots lost** against **396 replacements** in April. We explicitly retain and contrast the **447** in the preexisting compiled series; reporting definitions cannot simply be assumed identical. Its net 93-person flow difference is not a complete historical force balance.
- **German fighter-pilot readiness:** at 31 December 1943, **2,395** frontline single-engine fighter pilots, **1,491** fully and **291** partially combat-ready, 613 residual classified only by subtraction.
- **Luftflotte Reich fighter availability:** 1 June, 1 July and 27 July 1944 original strength versus ready figures; two JG 53 Gruppe-level equipment/personnel cases from the spring battles.
- **Fuel-production bottleneck:** seven dated 1944–45 aviation versus overall fuel-capacity percentages from Murray Table LVIII; percentages of production capacity, **not tonnes or inventories**.
- **Twenty identifiable original RAF translations of captured German aircraft-loss reports**, filtering by theater and selection window. They are linked and labeled **untranscribed**, not represented as per-type/month historical loss counts until original cells are checked.

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
- **Timeline:** July 1936–8 May 1945, with scenario presets, a selected-month inspector and toggleable historical event markers.

Charts support **mouse hover, touch/tap and keyboard focus + left/right arrows** to inspect exact monthly numbers and their confidence level. The coverage strip exposes missing historical months; use its button to change the chart's horizontal view.

## Run it

The project is a static site. There is no backend, no database, no telemetry, no paid service and no dependency on a CDN.

- Open the **GitHub Pages website** linked above. The root `index.html` references files in `dist/` and is no longer a redundant giant standalone release.
- For local editing, serve the project directory with a simple HTTP file server such as `python3 -m http.server 8000` and open its localhost URL.
- To rebuild the root entrypoint after editing `dist/index.html`: `node scripts/build-web.cjs`.
- To verify: `node tests/data.cjs`, `node tests/v6.cjs`, `node tests/v7.cjs`, `node tests/render.cjs` and `node tests/tooltips.cjs` (optional Playwright smoke test if a Chromium browser is installed).

The GitHub Pages site is served from the repository's `main` branch and root directory, **once Pages is enabled** under *Settings → Pages → Deploy from a branch → main / (root)*. If you get a 404 on the Pages link, that repository setting still needs enabling.

## Evidence and caveats

The minimum rule is that **fighter-aircraft stock, serviceable aircraft, newly accepted aircraft, aircraft write-offs, pilot positions, personnel casualties, sorties, flying hours and air-to-air claims are different measures**. They cannot be silently converted into one another.

- **Recorded:** published table with the same date and definition.
- **Derived:** reproducible calculation from a recorded source quantity.
- **Estimated (higher confidence):** short interpolation between comparable dated returns.
- **Estimated (lower confidence):** broad interpolation, cross-series allocation or inferred model shares.
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
