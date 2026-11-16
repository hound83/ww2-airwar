# Atlas v10 WIP · All-campaign evidence review

**Status:** Initial review baseline. **Owner:** Codex. **Starting revision:** [v9.9 · From Malta to Messina](https://github.com/hound83/ww2-airwar/commit/5ad240057d285eded7b4005ff7f0f356d0850580). The [published Atlas](https://hound83.github.io/ww2-airwar/) is v9.9. This candidate starts the evidence review milestone on the [v10 roadmap](ATLAS_ROADMAP_TO_V10.md).

## Coverage baseline

Counts come from the campaign registry after loading the Normandy narrative, in the same order as the Atlas audit suite. Chapters, chronology entries and quantitative facts are three different measures. These counts describe the main campaign dossiers. Linked explorers and timelines have their own records. A small count identifies a review candidate and says nothing by itself about the historical quality or completeness of its evidence.

| Campaign dossier | Chapters | Chronology entries | Quantitative facts | Dedicated route |
| --- | ---: | ---: | ---: | --- |
| [Spanish Civil War · Condor Legion](https://hound83.github.io/ww2-airwar/grand-air-war-v80.html?campaign=spain#campaign-dossier) | 3 | 5 | 2 | — |
| [Invasion of Poland](https://hound83.github.io/ww2-airwar/grand-air-war-v80.html?campaign=poland#campaign-dossier) | 3 | 7 | 4 | — |
| [Norwegian campaign](https://hound83.github.io/ww2-airwar/grand-air-war-v80.html?campaign=norway#campaign-dossier) | 3 | 6 | 11 | — |
| [Battle of France and the Low Countries](https://hound83.github.io/ww2-airwar/grand-air-war-v80.html?campaign=france1940#campaign-dossier) | 3 | 4 | 4 | — |
| [Battle of Britain](https://hound83.github.io/ww2-airwar/grand-air-war-v80.html?campaign=britain#campaign-dossier) | 5 | 7 | 16 | — |
| [Siege and air battle of Malta](https://hound83.github.io/ww2-airwar/grand-air-war-v80.html?campaign=malta#campaign-dossier) | 4 | 7 | 5 | [Malta](../malta.html) |
| [Operation Barbarossa](https://hound83.github.io/ww2-airwar/grand-air-war-v80.html?campaign=barbarossa#campaign-dossier) | 3 | 4 | 7 | — |
| [Dieppe: Operation Jubilee](https://hound83.github.io/ww2-airwar/grand-air-war-v80.html?campaign=dieppe#campaign-dossier) | 0 | 1 | 4 | — |
| [Stalingrad air operations](https://hound83.github.io/ww2-airwar/grand-air-war-v80.html?campaign=stalingrad#campaign-dossier) | 3 | 5 | 3 | — |
| [Defence of the Reich](https://hound83.github.io/ww2-airwar/grand-air-war-v80.html?campaign=reichdefense#campaign-dossier) | 3 | 4 | 2 | [Reich defence](../reich-defence.html) |
| [Sicily: Operation Husky](https://hound83.github.io/ww2-airwar/grand-air-war-v80.html?campaign=sicily#campaign-dossier) | 3 | 4 | 11 | [Sicily](../sicily.html) |
| [Kursk: Operation Citadel](https://hound83.github.io/ww2-airwar/grand-air-war-v80.html?campaign=kursk#campaign-dossier) | 3 | 3 | 2 | — |
| [Schweinfurt–Regensburg raids](https://hound83.github.io/ww2-airwar/grand-air-war-v80.html?campaign=schweinfurt#campaign-dossier) | 2 | 2 | 8 | — |
| [Italian campaign air operations](https://hound83.github.io/ww2-airwar/grand-air-war-v80.html?campaign=italy#campaign-dossier) | 3 | 6 | 4 | — |
| [Big Week: Operation Argument](https://hound83.github.io/ww2-airwar/grand-air-war-v80.html?campaign=bigweek#campaign-dossier) | 2 | 2 | 3 | [Big Week timeline](../operations-1944.html?preset=big-week) |
| [Normandy: Operation Overlord](https://hound83.github.io/ww2-airwar/grand-air-war-v80.html?campaign=normandy#campaign-dossier) | 9 | 39 | 22 | [D-Day timeline](../operations-1944.html?preset=d-day) |
| [Operation Bagration](https://hound83.github.io/ww2-airwar/grand-air-war-v80.html?campaign=bagration#campaign-dossier) | 3 | 6 | 15 | [Bagration](../bagration.html) |
| [Market Garden](https://hound83.github.io/ww2-airwar/grand-air-war-v80.html?campaign=marketgarden#campaign-dossier) | 3 | 3 | 3 | — |
| [Operation Bodenplatte](https://hound83.github.io/ww2-airwar/grand-air-war-v80.html?campaign=bodenplatte#campaign-dossier) | 0 | 1 | 10 | [Bodenplatte](../bodenplatte.html) |
| [Final air operations over Berlin](https://hound83.github.io/ww2-airwar/grand-air-war-v80.html?campaign=berlin#campaign-dossier) | 3 | 5 | 3 | — |
| **Total** | **61** | **121** | **139** | |

Dieppe has a single dated entry and no dossier chapters. Bodenplatte also has a single overview entry, but links to its dedicated campaign explorer. Review the route as well as the registry counts before prioritizing repairs.

## Earlier candidates

| Candidate | Comparison with v9.9 | Review action |
| --- | --- | --- |
| [Bilateral evidence · PR #20](https://github.com/hound83/ww2-airwar/pull/20) | 24 commits ahead and 81 behind at intake. Touches the shared campaign dataset, rendering and tests. | Compare additional evidence by campaign, date, reporting population and source. Start with Dieppe and Big Week. Identify records already represented on v9.9 before porting source rows. |
| [Narvik daily records · PR #15](https://github.com/hound83/ww2-airwar/pull/15) | 3 commits ahead and 120 behind at intake. Touches the shared campaign dataset, rendering and tests. | Review the 28 May–12 June records against the existing Norway dossier. Preserve the source discrepancies and the distinction between area and squadron tallies. |

## Acceptance checks

- [x] Capture the v9.9 baseline for all 20 dossiers and identify overlapping candidates.
- [ ] Review the 20 reader journeys from campaign selection through dated detail and the source or dedicated explorer. Record broken routes and thin coverage.
- [ ] Reconcile the evidence in PRs #20 and #15 against the current baseline before porting any records. Preserve missing values and distinct definitions for claims, own losses, sorties, strength and serviceability.
- [ ] Run the applicable Node checks and desktop/mobile journeys for implementation changes. Review deployment separately when the milestone is ready.

**Baseline inputs:** [Campaign registry](../dist/grand-air-war-v77-campaigns.js) · [Normandy narrative](../dist/normandy-1944-story.js) · [Atlas audit test](../tests/grand-air-war-v80-audit.cjs).
