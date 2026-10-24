# European Air War Atlas · 1936–May 1945

An offline-capable, source-led dashboard for studying the European air war, German fighter-pilot experience, aircraft inventory, attrition, Allied fighter deployment, and the P-47/P-51 debate.

**[Open the dashboard](https://hound83.github.io/ww2-airwar/)** · **[Download the single-file HTML](https://github.com/hound83/ww2-airwar/raw/refs/heads/main/index.html)**

> The dashboard is a historical exploration and **scenario model**, not a precise reconstruction of every airframe or pilot. The app distinguishes observed returns, derived values, two confidence grades of estimation and hypothetical scenarios. It deliberately leaves unsupported months blank.

## What it includes

- **Pilot simulator:** preserved Monte Carlo model of novice/veteran risk, sorties, aerial-combat encounters, victory-claim concentration, survivor cohorts, and return-from-loss assumptions; trace Condor Legion, Battle of Britain, 1943 and other cohorts through May 1945.
- **Aircraft simulator:** retained from the original lab; production, fighter readiness, write-offs and equipment attrition under clearly marked confidence levels.
- **Airpower balance:** German day-fighter numbers compared with U.S. and RAF European inventories, archival 1943 readiness and 1940 RAF Fighter Command readiness, plus theater allocations.
- **Fleet by type:** Bf 109/Fw 190, P-38/P-47/P-51, Spitfire, Hurricane, Typhoon, Tempest and RAF Mustang, with dated fleet snapshots. Shows original USAAF ETO monthly total fighter losses (July 1943–April 1944), and optionally allocates that total to individual USAAF models by their inventory shares (a **lower-confidence estimate**, never misrepresented as recorded model losses).
- **Losses and attribution:** original German theater loss returns, documented fighter-force pressure and a configurable, **hypothetical** exercise for apportioning air-to-air results to Allied fighters. A claim is not an independently verified aircraft loss.
- **P-47 vs P-51:** official fiscal-year aircraft flyaway prices, quarterly flight hours, ETO deployment inventories, changing operational roles, and verification status of prominent historical claims.
- **Research and sources:** compact provenance and measurement notes; expand them globally with *Show source notes*.
- **Timeline:** July 1936–8 May 1945, with scenario presets and a selected-month inspector. May 1945 is not extrapolated into 1946.

## Run it

The project is a static site. There is no backend, no database, no telemetry, no paid service and no dependency on a CDN.

- Open **`index.html`** directly in a browser — this is the complete, single-file app.
- For editing, open **`dist/index.html`** through a simple local static-file server; the CSS and JavaScript source files sit beside it in `dist/`.
- To rebuild the root portable file using Node.js: `node scripts/build-standalone.cjs`.

The GitHub Pages site is served from the repository's `main` branch and root directory, **once Pages is enabled** under *Settings → Pages → Deploy from a branch → main / (root)*. If you get a 404 on the Pages link, that repository setting still needs enabling.

## Evidence and caveats

The minimum rule is that **fighter-aircraft stock, serviceable aircraft, newly accepted aircraft, aircraft write-offs, pilot positions, personnel casualties, sorties, flying hours and air-to-air claims are different measures**. They cannot be silently converted into one another.

- **Recorded:** published table with the same date and definition.
- **Derived:** reproducible calculation from a recorded source quantity.
- **Estimated (higher confidence):** short interpolation between comparable dated returns.
- **Estimated (lower confidence):** broad interpolation, cross-series allocation or inferred model shares.
- **Scenario only:** a freely adjustable hypothetical mechanism.

An estimated number is never styled as wartime documentation merely because it has many decimal places. Prewar Condor Legion strength is tracked as a *small unit of deployed rotating pilots*, not the entire German fighter force. The simulation's German national 1936–42 pilot-strength baselines remain scenarios, not archival censuses. For the original data gaps and source scopes, see [DATA_NOTES.md](DATA_NOTES.md).

## Main sources

- [USAAF Statistical Digest: World War II](https://www.ibiblio.org/hyperwar/AAF/StatDigest/index.html), notably Tables 55, 74–82, 104, 107 and the as-yet-untranscribed model-specific enemy-aircraft-claim Table 167.
- [Official digitized USAAF Statistical Digest (PDF)](https://media.defense.gov/2011/Mar/31/2001330134/-1/-1/0/AFD-110331-045.pdf).
- [Dan Zamansky, *Luftwaffe: A Case Study*](https://www.ww2.dk/Dan%20Zamansky%20-%20The%20Study.pdf), using original Bundesarchiv records for German fighter strength, geography and theater losses.
- [Williamson Murray, *Strategy for Defeat*](https://www.airuniversity.af.edu/Portals/10/AUPress/Books/B_0012_MURRAY_STRATEGY_FOR_DEFEAT.pdf), German fighter personnel and aircraft returns.
- [USAAF ETO type-by-type strength transcription](https://www.theworldwars.net/stats/file.php?e=ww2&s=airstrusaafeur) and [RAF operational strength transcription](https://www.theworldwars.net/stats/file.php?e=ww2&s=airstrrafeur).
- [Royal Air Force Air Power Review, Battle of Britain readiness analysis](https://www.raf.mod.uk/what-we-do/centre-for-air-and-space-power-studies/aspr/apr-vol1-iss2-5-pdf/).

## How the files fit together

| Path | Purpose |
| --- | --- |
| `index.html` | Generated, self-contained downloadable dashboard; GitHub Pages entry point |
| `dist/index.html` | Editable HTML source |
| `dist/atlas.css` | New dashboard styling and responsive layouts |
| `dist/model-v3-data.js` | Preserved simulation/data baseline |
| `dist/model-v3.js` | Preserved Monte Carlo pilot/equipment application |
| `dist/model-v4-data.js` | New annotated dated historical data series |
| `dist/model-v4.js` | New Atlas views and interactive analyses |
| `scripts/build-standalone.cjs` | Rebuilds the root one-file release |
| `tests/smoke.cjs` | Optional browser interactions test, requires Playwright locally |

## Scope of the original debate

The dashboard is **not** designed to declare the P-47 or P-51 the winner. Price, range, mission type, aircraft availability, engagement exposure, sorties, air victories, ground attack and operational dates matter. Figures such as Greg's **4,429 European P-47 victories** are displayed as *reported but not reconciled* until the exact theater, period and counting convention are confirmed against the original USAAF model tables.

No license has been assigned to the repository. Before inviting third-party code contributions or redistribution, the project owner should choose a license deliberately.
