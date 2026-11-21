# Atlas v10 WIP · All-campaign evidence review

**Status:** Initial review baseline. **Owner:** Codex. **Starting revision:** [v9.9 · From Malta to Messina](https://github.com/hound83/ww2-airwar/commit/5ad240057d285eded7b4005ff7f0f356d0850580). The [published Atlas](https://hound83.github.io/ww2-airwar/) is v9.9. The [second-sweep roadmap](#second-sweep-roadmap) sets the proposed delivery order and research questions. This candidate starts the evidence review milestone on the [v10 roadmap](ATLAS_ROADMAP_TO_V10.md).

## Coverage baseline

Counts come from the campaign registry after loading the Normandy narrative, in the same order as the Atlas audit suite. Chapters, chronology entries and quantitative facts are three different measures. These counts describe the main campaign dossiers. Linked explorers and timelines have their own records. A small count identifies a review candidate and says nothing by itself about the historical quality or completeness of its evidence.

| Campaign dossier | Chapters | Chronology entries | Quantitative facts | Specialist explorer or timeline |
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
| [Schweinfurt–Regensburg raids](https://hound83.github.io/ww2-airwar/grand-air-war-v80.html?campaign=schweinfurt#campaign-dossier) | 2 | 2 | 8 | [Black Thursday raid](../reich-defence.html#black-thursday) |
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
| [Narvik daily records · PR #15](https://github.com/hound83/ww2-airwar/pull/15) | 3 commits ahead and 120 behind at intake. Touches the shared campaign dataset, rendering and tests. | Review the 18 dated records spanning 21 May–7 June 1940 against the existing Norway dossier. Preserve the source discrepancies and the distinction between area and squadron tallies. |

## Acceptance checks

- [x] Capture the v9.9 baseline for all 20 dossiers and identify overlapping candidates.
- [ ] Review the 20 reader journeys from campaign selection through dated detail and the source or dedicated explorer. Record broken routes and thin coverage.
- [ ] Reconcile the evidence in PRs #20 and #15 against the current baseline before porting any records. Preserve missing values and distinct definitions for claims, own losses, sorties, strength and serviceability.
- [ ] Run the applicable Node checks and desktop/mobile journeys for implementation changes. Review deployment separately when the milestone is ready.

**Baseline inputs:** [Campaign registry](../dist/grand-air-war-v77-campaigns.js) · [Normandy narrative](../dist/normandy-1944-story.js) · [Atlas audit test](../tests/grand-air-war-v80-audit.cjs).

## Second-sweep roadmap

Proposed 21 November 2026.

**Start in Sicily.** Build a short account of when fighters could first operate from captured airfields. Use Dieppe to test whether the same way of telling a story works for a single day with conflicting loss totals. The all-campaign review can then apply a tested approach to the other entries.

### What I would change in the Atlas

| What a reader encounters in v9.9 | Proposed improvement | How to test it |
| --- | --- | --- |
| The main dossier puts sourced figures and comparisons above its objective, turning point and outcome. The specialist explorer link comes after the sources. | Put the historical question, a short answer and a link to the best dated case directly under the title. Keep the detailed evidence and its citations available below. | From Sicily on a phone, find what changed at Pachino and open the supporting passage without first reading the campaign totals. |
| Dieppe and Bodenplatte each have one main chronology entry. Bodenplatte also has a 20-location explorer. Schweinfurt already links directly to Black Thursday in the Reich defence explorer. | Describe the actual destination in the campaign list. A link such as “Explore 20 Bodenplatte locations” tells the reader more than the overview count alone. Use the same route list for the website and its coverage inventory. | Verify the destination for each of the 20 entries, including shared explorers, filtered timelines and evidence embedded in the dossier. |
| Sicily gives a selected case its own URL. The main campaign selector changes the dossier in memory. | Carry the selected campaign and dated event in a shareable URL. Preserve the selection when a reader returns from a source or specialist page. | Open a shared event in a fresh tab, reload it, then use Back from its explorer. Each route should recover the intended campaign and date on desktop and mobile. |
| Several accounts use similar-looking numbers for different populations. Big Week is an especially clear example. | Beside any comparison, show who counted what, over which dates, and the page that supports it. Explain disagreements in one sentence. Offer a ratio only where populations, measures and periods support the question. | A reader can explain why two Big Week sortie totals coexist and can trace each to its source. A blank day in the Narvik diary remains distinguishable from a reported zero. |

### Delivery order

| Milestone | Reader outcome | Completion evidence |
| --- | --- | --- |
| 1 · Sicily and Dieppe | Follow the consequences of gaining a Sicilian airfield or the purpose and outcome of the air cover at Dieppe. | One sourced Sicily field-to-formation journey, the two Biscari accounts, and a Dieppe account covering objective, cover, withdrawal and losses. A direct link and return journey work for each. |
| 2 · Review all 20 dossiers | Every campaign leads to its best dated evidence and identifies the most important question still open. | A 20-row review names the entry point, dated case, source locator, specialist destination if any, and principal gap. Reconcile PRs [#20](https://github.com/hound83/ww2-airwar/pull/20) and [#15](https://github.com/hound83/ww2-airwar/pull/15) row by row. Record accepted, duplicate, differently scoped and unverified items. |
| 3 · Follow formations and airfields across campaigns | Read a unit's history through successive stations and operations. | Use the existing roadmap target of 20 substantive histories across six flagships. Include one traceable journey per flagship. Cite station, readiness and actual operation separately. Link across campaigns wherever a dated record supports continuity. |
| 4 · Explain the European air war | Move from a Europe-wide chapter into a worked study and back to the wider outcome. | Retain the six studies and six-to-eight chapters in the [v10 roadmap](ATLAS_ROADMAP_TO_V10.md). Start with Malta–Sicily operational effort and German production, fuel and pilot availability. Provide comparable series, source passages and exports for each study. |

### Second-sweep research queue

| Priority and question | First records to inspect | What would earn inclusion |
| --- | --- | --- |
| **1. Sicily, 10–16 July 1943. When did capture translate into flying operations?** Start with Pachino as the documented example, then Biscari and Ponte Olivo. | Compare the RAF narrative with the Seventh Army engineer report cited in the U.S. Army history. Follow the 809th, 814th and 815th Engineer Aviation Battalion references in the USAF engineering history, p. 41 n. 158. For the Axis side, look for Italian daily reports for one named unit in the same sector. [RAF narrative](https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/second-world-war-campaign-narratives/sicilian-campaign-june-august-1943/) · [Army engineer history, pp. 119, 132](https://history.army.mil/portals/143/Images/Publications/catalog/10-22.pdf) · [USAF engineering history](https://media.defense.gov/2025/Jun/12/2003737781/-1/-1/0/LEADING%20THE%20WAY%20BOOKMARKED.PDF) · [Italian archive guide](https://www.aeronautica.difesa.it/home/storia-e-tradizione/ufficio-storico-2026/) | Separate orders, occupation, runway fitness, unit arrival and first documented sortie. The engineer narrative names several units and fields collectively. A unit-to-field assignment needs its own record. Retain the RAF's 12 July and the U.S. account's 14 July at Biscari until the reporting thresholds can be reconciled. |
| **2. Dieppe, 19 August 1942. What did air cover accomplish, and whom do the loss totals include?** | Start with one formation, such as 403 Squadron, then check its record against the Canadian narrative and a German account of the operation. Follow PR #20's French figure back to its source. [RCAF history](https://www.canada.ca/en/department-national-defence/maple-leaf/rcaf/2019/08/in-the-skies-above-dieppe-august-19-1942.html) · [Canadian AHQ Report 10 based on German war diaries](https://www.canada.ca/en/department-national-defence/services/military-history/history-heritage/official-military-history-lineages/reports/army-headquarters-1948-1959/book-operation-jubilee-raid-dieppe.html) | Link an air task to an observed result for the ships or troops. Record the current RAF-labelled 106, the RCAF retrospective's approximately 106 Allied aircraft and the candidate 108 with their original wording. A German-diary synthesis supplies another perspective. Its figures still need page-level verification. |
| **3. Narvik and Big Week. Which apparently conflicting totals can a reader actually compare?** | At Narvik, compare AHB Table 2, pp. 95–96, with the reconstructed No. 263 Squadron Form 540 and check No. 46 Squadron AIR 27/460 if a free scan is available. For Big Week, start with the existing mission timeline and one day of Eighth, Fifteenth and RAF coverage. [Narvik candidate audit](https://github.com/hound83/ww2-airwar/blob/2ac27643ab7581fedf6b435a81caa1b1940c187a/research/sources/atlas-narvik-daily-unit-operations-2026-11-06.md) · [USAF Museum](https://www.nationalmuseum.af.mil/Visit/Museum-Exhibits/Fact-Sheets/Display/Article/1519678/big-week-february-20-25-1944/) · [Air University account](https://www.acc.af.mil/News/Article-Display/Article/1754195/operation-argument-big-week-the-beginning-of-the-end-of-the-german-luftwaffe/) | At Narvik distinguish area and squadron reporting, exact counts, estimates, explicit nil and missing entries. For Big Week distinguish nearly 4,000 USAAF heavy-bomber sorties from roughly 6,000 Allied sorties. Reuse an existing mission record and show which formations the two aggregates cover. |
| **4. Poland and Bagration. What does the local reporting side add?** | Trace the Polish 24th Reconnaissance Squadron from Klimontów to the Orawka operation on 3 September 1939. At Bagration, seek the underlying 1st Air Army return for 23 June–3 July 1944. Use the separate 50th Army assessment for the 4th Air Army only within its own scope. [Polish Aviation Museum](https://muzeumlotnictwa.pl/en/aviation-traces/aviation-disasters/g-39-orawka/) · [Bagration source audit and archive references](../research/sources/atlas-bagration-air-campaign-2026-11-13.md) | One dated Polish unit journey with the fate of the aircraft and independently supported effects if available. For Bagration, check whether the underlying return explains the printed total of 119 and the listed components that sum to 179. Keep both readings visible if the source cannot resolve them. |
| **5. Bodenplatte and Germany in 1944–45. What capacity returned after losses?** | At Melsbroek, follow 320 Squadron aircraft from 1 January through the first week using AIR 27/1714, the wing diary and Dutch inventories 5 and 12. At the national level, compare dated production, fuel, trained-pilot and operational strength series. [Bodenplatte retrieval notes](../research/sources/atlas-bodenplatte-original-sources-2026-11-13.md) · [Nationaal Archief 2.13.154](https://www.nationaalarchief.nl/onderzoeken/archief/2.13.154) · [U.S. Strategic Bombing Survey, European summary](https://media.defense.gov/2017/Apr/07/2001728533/-1/-1/0/B_0020_SPANGRUD_STRATEGIC_BOMBING_SURVEYS.PDF) | At the field, distinguish destroyed, repairable, repaired and returned to flying by serial where possible. In the national study, show output and usable capacity on their own time scales. A factory delivery alone cannot establish that a combat unit could fly the aircraft. |

For a further breadth pass, give an underrepresented campaign one question with a measurable consequence. For Stalingrad, compare cargo dispatched with cargo received for one reporting period. For Market Garden, follow one resupply mission from dispatch through the receiving unit's account. Expand whichever first yields an air and a ground record for the same place and date.

**Research handoff.** For each proposed figure, record the existing Atlas row, date, place, formation, reporting side, definition, source lineage, page or folio, and a short transcription. Trace repeated figures back to their common source before treating agreement as corroboration. When only a catalogue entry or paid scan is available, retain the reference and the open question. Where coverage permits, end each case with what the air operation changed for people on the ground, ships at sea or the unit's ability to fly the next day.

**Review basis.** The public v9.9 HTML, campaign renderer and datasets supplied the current figures and route observations. This was a targeted review with source spot checks. A fresh interactive browser run could not be completed. The full 20-campaign journey review remains open. [Published Atlas](https://hound83.github.io/ww2-airwar/) · [v9.9 release verification](https://github.com/hound83/ww2-airwar/actions/runs/43643257760).
