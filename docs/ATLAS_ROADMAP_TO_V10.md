# European Air War Atlas roadmap through v10

Updated 13 November 2026 for Atlas v9.8. This revises the 11 November [six-release proposal](https://github.com/hound83/ww2-airwar/pull/23).

## What has shipped

| Milestone | Shipped reader experience | Work still open |
| --- | --- | --- |
| Normandy, v8.6 | Five map-linked operations, 16 dated snapshots and a nine-chapter campaign. | Complete the German attribution for the Cobra escort encounters if the Mission 494 annex and matching returns become accessible. [Release QA](ATLAS_V86_RELEASE_QA.md) |
| Battle of Britain, v8.7–v9.2 | Four worked raid dossiers, followed by both comparison directions across 17 weeks and five phases, with source coverage and seven dated checks. | Extend the captured German daily claim series where the dated reports can be recovered. [Battle of Britain source audit](../research/sources/atlas-v92-britain-german-claims-2026-11-12.md) |
| Western air war, v9.1–v9.3.1 | January–July 1944 timeline with 2,103 dated records and 635 May/July Davis target rows. The June and July German command returns are available with reconciliation notes. | Daily May returns VII/133 and VII/134, Ninth Air Force July reporting and mission-level attribution. [Timeline](https://hound83.github.io/ww2-airwar/operations-1944.html?preset=july) · [Research audit](../research/sources/atlas-v93-may-july-returns-and-operations-2026-11-12.md) |
| Bodenplatte, v9.4–v9.5 | The original five accounts now sit within a 20-location map and a 16-entry chronology. Unit, airframe, ground-defence and order-of-battle details link to sources and filtered exports. | Reconcile the Sint-Truiden and Melsbroek reports when original returns become accessible. [Explorer](https://hound83.github.io/ww2-airwar/bodenplatte.html) · [Operation audit](../research/sources/atlas-bodenplatte-operation-scope-2026-11-13.md) |
| Bagration, v9.6 | Fifteen dated cases connect campaign geography, opposing air records, station changes, source links and filtered export. | Resolve the 1st Air Army’s loss discrepancy and retrieve matched German daily losses and the 4th Air Army’s assessment. [Explorer](https://hound83.github.io/ww2-airwar/bagration.html) · [Audit](../research/sources/atlas-bagration-air-campaign-2026-11-13.md) |
| Defence of the Reich, v9.7 | Thirteen map-linked day and night cases show Allied missions and escorts, German interceptions and original command returns. Two additional German daily command rows and an aircrew report extend the evidence. | Resolve selected formation-level matches and missing archival ledgers. [Explorer](https://hound83.github.io/ww2-airwar/reich-defence.html) · [Audit](../research/sources/atlas-reich-defence-2026-11-13.md) |
| Malta, v9.8 | Sixteen mapped cases link Spitfire deliveries, airfield defence and convoy outcomes. The Atlas resolves the Spotter carrier and records the remaining delivery, loss and sortie-count discrepancies. | Extend squadron and Axis unit daily records and reconcile the Bellows count. [Explorer](https://hound83.github.io/ww2-airwar/malta.html) · [Audit](../research/sources/atlas-malta-air-campaign-2026-11-13.md) |

Release numbers follow the shipped GitHub history. The earlier proposal used some of the same numbers for larger outcomes that are still open. Main contains 20 campaign entries. The six flagship depth targets, reusable formation histories, operational balance studies and connected European history remain ahead.

## Recommended next milestone

**Sicily flagship.** Connect the air forces, pre-invasion strikes, airfield seizures and airborne operations of the Sicily campaign to dated source records.

## Following milestones

| Order | Reader outcome | Completion evidence |
| --- | --- | --- |
| 2 · Remaining flagship campaigns and all-entry review | Bring Malta and Sicily to the Normandy/Britain standard and improve the remaining campaign entries. | Normandy, Battle of Britain, Bagration, Defence of the Reich, Malta and Sicily have deep, linked accounts. All 20 entries explain situation, objectives, participants, sequence, consequences and sources. Review the [bilateral evidence candidate](https://github.com/hound83/ww2-airwar/pull/20) and [Narvik candidate](https://github.com/hound83/ww2-airwar/pull/15) against main before reuse. |
| 3 · Formation and airfield histories | Trace a dated formation through its equipment, stations and operations. | Reuse the data relationships tested in Bodenplatte and Bagration. Aim for 20 substantive histories across the six flagships, with dated deployments and a traceable formation journey in each. |
| 4 · Operational balance studies | Use the records to answer questions about effort, losses, readiness, replacement and constraints. | Six worked studies with source definitions, compatible comparisons and inspectable exports. See study questions below. |
| 5 · v10, connected European air war | Move from the wider history into a campaign, operation, dated map and formation or source, then return to the wider context. | Six to eight Europe-wide chapters, working routes through all 20 campaigns, six flagship journeys, six evidence studies and verified desktop/mobile publication. |

## Evidence studies and v10 chapters

The studies examine Normandy's operational effort and response, British fighter readiness and replacement, Reich defence raid/escort/interception losses, Bagration's air-army activity, Malta/Sicily operational effort and Germany's 1944–45 aircraft output, fuel and pilot constraints. Use compatible reporting populations for ratios. Keep date, definition, force, geography and sources visible for comparisons.

The original chapter sequence remains Spain and prewar air power, early campaigns, Britain and maritime pressure, the multi-front war in 1941–42, attrition and reach in 1943, invasion and offensives in 1944, and retreat and resource constraints in 1944–45. Support guided reading, open exploration and investigation from the evidence. [Original product proposal](https://github.com/hound83/ww2-airwar/pull/23)

## Research priorities alongside implementation

Free Bodenplatte archive leads include AIR 27/1714 (320 Squadron), AIR 26/203 and AIR 26/200 (139 Wing), and Nationaal Archief 2.13.154, inventory 5 and 12. AHB5/234 and the A-92 original returns remain open. [Archive access notes](../research/sources/atlas-bodenplatte-original-sources-2026-11-13.md#january-returns-archive-access-follow-up)

Cobra / Mission 494 remains the first Western air war attribution follow-up when the fighter annex is accessible. The June type audit and the Battle of Britain reverse comparison have shipped. Their residual source gaps stay in the [latest research index](LATEST_INSIGHTS.md). Earlier roadmap work on the three priorities is preserved in the [November 12 review](https://github.com/hound83/ww2-airwar/blob/codex/atlas-roadmap-review-20261112/docs/LATEST_INSIGHTS.md).

## Research and delivery rules

- Research, implementation and historical editing advance together inside each release.
- Official histories and reputable secondary scholarship can establish narrative depth; seek primary records for finer operational figures and disputed claims. Do not postpone a useful narrative until every archive is complete.
- Preserve source/page/URL, reporting period, geography, formation/population, unit, definition, date precision and evidence class. Record contradictions and useful negative findings.
- Store compact reusable research in this repository; link original scans instead of committing large archives.
- Include historical context and source-linked visual material as each campaign is developed, with provenance and rights credits.
- Keep the static architecture unless an evidenced implementation need justifies change.
- No automatic physics integration is part of this roadmap. A separate authorized integration milestone would identify and validate a pinned solver release.
- Plan by completed outcomes, not calendar promises. Broad releases may use several internal research/build/review cycles without public micro-releases.
- Source-access blockers trigger targeted alternative research within the release, followed by an honest reassessment of its scope; fabricated precision is never the fallback.

## Release gate

For each public implementation release:

1. Capture the previous reader experience and historical baseline.
2. Complete the intended user journeys and historical/source review.
3. Rebuild generated assets, run affected Node checks and inspect the diff.
4. Verify desktop and mobile browser journeys, map/time/filter states, touch/keyboard navigation and relevant accessibility/performance behavior.
5. Inspect before/after screenshots, source links and genuinely missing-data states.
6. Require CI on the exact revision, know the prior deployable state and follow repository protections.
7. Merge and publish under the existing standing authorization for an assigned implementation milestone; verify the affected live default route.
8. Update the release manifest, roadmap/status and compact research records. Report completed and deferred scope plainly.

## Source leads and project references

Existing project records:

- [Merged Normandy PR #22](https://github.com/hound83/ww2-airwar/pull/22).
- [Normandy research ledger](../research/sources/normandy-1944-story-benchmark-2026-11-10.md).
- [Normandy before/after and QA](ATLAS_NORMANDY_STORY_BENCHMARK_QA_2026-11-10.md).
- [Current work queue](STATUS_AND_NEXT_STEPS.md).
- [Physics integration boundary](ATLAS_PHYSICS_INTEGRATION.md).

Verified source-discovery leads, not newly transcribed evidence:

- [RAF official campaign narratives](https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/second-world-war-campaign-narratives1/), including Britain and North-West Europe.
- [U.S. Army CMH, Breakout and Pursuit](https://history.army.mil/Publications/Publications-Catalog/Breakout-And-Pursuit/), an operational history/map starting point for Normandy.
- [The National Archives, RAF operations record books](https://www.nationalarchives.gov.uk/help-with-your-research/research-guides/royal-air-force-operations-record-books-1911-1963/), AIR 27 unit/date retrieval.
- [National Museum of the USAF, Strategic Bombing Resumed](https://www.nationalmuseum.af.mil/Visit/Museum-Exhibits/Fact-Sheets/Display/Article/196160/AFmuseum/strategic-bombing-resumed/), a contextual lead for the strategic/oil campaign.

Scope Eastern and Mediterranean source acquisition in the relevant implementation research ledgers.
