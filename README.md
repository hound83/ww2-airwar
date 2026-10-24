# European Air War Atlas · 1936–May 1945

An interactive, source-led historical dashboard for the European air war: fighter-pilot attrition and experience, German and Allied equipment, aircraft production, theater strength, casualties, victory claims and hypothetical cohort simulations.

**[Open the dashboard](https://hound83.github.io/ww2-airwar/)**

> The dashboard is a historical exploration and **scenario model**, not a precise reconstruction of every airframe or pilot. The app distinguishes observed returns, derived values, two confidence grades of estimation and hypothetical scenarios. It deliberately leaves unsupported months blank.

## What it includes

- **Airpower overview:** German day-fighter readiness versus selected USAAF ETO and RAF fighter inventories, plus theater allocation.
- **Aircraft & equipment:** Bf 109/Fw 190, P-38/P-47/P-51, Spitfire, Hurricane, Typhoon, Tempest and RAF Mustang. Dated stock snapshots, factory production and confidence-labeled losses.
- **Pilots & experience:** source-reported monthly fighter-pilot strength attrition percentages January 1942–May 1944; absolute casualty counts only for documented months.
- **Losses & claims:** original German theater loss returns, yearly USAAF ETO fighter losses, **complete monthly (August 1942–May 1945) USAAF fighter-class in-air and on-ground credited claims**, **month-by-month U.S. fighter and bomber combat-mission losses by cause (1944–May 1945)**, and an expressly **hypothetical** attribution workbench.
- **Industry & operations:** original aircraft procurement costs, yearly U.S. production, European aircraft inventory and flying hours, plus **all 29 monthly USAAF fighter-sortie reports by mission role (1943–May 1945)** with an ETO/Mediterranean switch.
- **Pilot simulator:** preserved Monte Carlo model of novice/veteran risk, sorties, combat encounters, credited claims, returning pilots and Condor Legion/Battle of Britain cohorts through May 1945.
- **Aircraft simulator:** the existing modeled German readiness/production/write-off views.
- **Research & sources / About:** provenance, reporting definitions, missing data, project history and methodology; show/hide detailed citations through *Show source notes*.
- **Timeline:** July 1936–8 May 1945, with scenario presets, a selected-month inspector and toggleable historical event markers.

Charts support **mouse hover, touch/tap and keyboard focus + left/right arrows** to inspect exact monthly numbers and their confidence level.

## Run it

The project is a static site. There is no backend, no database, no telemetry, no paid service and no dependency on a CDN.

- Open the **GitHub Pages website** linked above. The root `index.html` references files in `dist/` and is no longer a redundant giant standalone release.
- For local editing, serve the project directory with a simple HTTP file server such as `python3 -m http.server 8000` and open its localhost URL.
- To rebuild the root entrypoint after editing `dist/index.html`: `node scripts/build-web.cjs`.
- To verify: `node tests/data.cjs`, `node tests/render.cjs` and `node tests/tooltips.cjs` (optional Playwright smoke test if a browser is installed).

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

## Main sources

- [USAAF Statistical Digest: World War II](https://www.ibiblio.org/hyperwar/AAF/StatDigest/index.html), notably Tables 55, 74–82, 104, 107, 128, 159 and 167. **Table 167 reports fighter-class claims, NOT claims by individual P-38/P-47/P-51 model.**
- [Official digitized USAAF Statistical Digest (PDF)](https://media.defense.gov/2011/Mar/31/2001330134/-1/-1/0/AFD-110331-045.pdf).
- [Dan Zamansky, *Luftwaffe: A Case Study*](https://www.ww2.dk/Dan%20Zamansky%20-%20The%20Study.pdf), using original Bundesarchiv records for German fighter strength, geography and theater losses.
- [Williamson Murray, *Strategy for Defeat*](https://www.airuniversity.af.edu/Portals/10/AUPress/Books/B_0012_MURRAY_STRATEGY_FOR_DEFEAT.pdf), German fighter personnel and aircraft returns.
- [USAAF ETO type-by-type strength transcription](https://www.theworldwars.net/stats/file.php?e=ww2&s=airstrusaafeur) and [RAF operational strength transcription](https://www.theworldwars.net/stats/file.php?e=ww2&s=airstrrafeur).
- [Royal Air Force Air Power Review, Battle of Britain readiness analysis](https://www.raf.mod.uk/what-we-do/centre-for-air-and-space-power-studies/aspr/apr-vol1-iss2-5-pdf/).

## How the files fit together

| Path | Purpose |
| --- | --- |
| `index.html` | Generated, modular GitHub Pages entry point |
| `dist/index.html` | Editable HTML source |
| `dist/atlas.css` | Subdued WWII-inspired palette and existing responsive layouts |
| `dist/model-v3-data.js` | Preserved simulation/data baseline |
| `dist/model-v3.js` | Preserved Monte Carlo pilot/equipment application |
| `dist/model-v4-data.js` | New annotated dated historical data series |
| `dist/model-v4.js` | New Atlas views and interactive analyses |
| `dist/atlas-v5.js` | Chart tooltips, tap and keyboard inspection, historical event overlays |
| `scripts/build-web.cjs` | Rebuilds the root modular Pages entry point |
| `tests/smoke.cjs` | Optional browser interactions test, requires Playwright locally |

## Historical claims are not model-specific proof

The original Table 167 gives 1944 ETO **5,602 fighter-class air-to-air credits** and **2,375 enemy aircraft credited as destroyed on the ground**, for all USAAF fighter types combined. These are credited claims, not independently documented German destroyed aircraft. The dataset includes **all 34 source-recorded monthly reporting rows**, August 1942–May 1945, which reconcile with all four annual totals. Table 128 separately gives monthly combat fighter sorties by role and theater. Model-specific claim histories remain unavailable rather than invented. See [DATA_NOTES.md](DATA_NOTES.md).

No license has been assigned to the repository. Before inviting third-party code contributions or redistribution, the project owner should choose a license deliberately.
