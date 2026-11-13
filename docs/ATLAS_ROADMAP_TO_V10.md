# European Air War Atlas roadmap through v10

Updated 13 November 2026. Verified repository baseline is main at `25029906`. This revises the 11 November [six-release proposal](https://github.com/hound83/ww2-airwar/pull/23). The milestone order below is a recommendation for future implementation.

## What has shipped

| Milestone | Shipped reader experience | Work still open |
| --- | --- | --- |
| Normandy, v8.6 | Five map-linked operations, 16 dated snapshots and a nine-chapter campaign. | Complete the German attribution for the Cobra escort encounters if the Mission 494 annex and matching returns become accessible. [Release QA](ATLAS_V86_RELEASE_QA.md) |
| Battle of Britain, v8.7–v9.2 | Four worked raid dossiers, followed by both comparison directions across 17 weeks and five phases, with source coverage and seven dated checks. | Extend the captured German daily claim series where the dated reports can be recovered. [Battle of Britain source audit](../research/sources/atlas-v92-britain-german-claims-2026-11-12.md) |
| Western air war, v9.1–v9.3.1 | January–July 1944 timeline with 2,103 dated records and 635 May/July Davis target rows. The June and July German command returns are available with reconciliation notes. | Daily May returns VII/133 and VII/134, Ninth Air Force July reporting and mission-level attribution. [Timeline](https://hound83.github.io/ww2-airwar/operations-1944.html?preset=july) · [Research audit](../research/sources/atlas-v93-may-july-returns-and-operations-2026-11-12.md) |
| Bodenplatte, v9.4 | Map and ledger for Eindhoven, Asch, Evere, Melsbroek and Metz–Frescaty, with 69 local or formation observations and 18 operation-wide records. | Integrate the research covering 20 locations, 16 chronology entries and 22 recently identified airframes. The records include overlapping populations. [Release PR](https://github.com/hound83/ww2-airwar/pull/50) · [Pages deployment](https://github.com/hound83/ww2-airwar/actions/runs/43341264068) · [Explorer](https://hound83.github.io/ww2-airwar/bodenplatte.html) |

Release numbers follow the shipped GitHub history. The earlier proposal used some of the same numbers for larger outcomes that are still open. Main contains 20 campaign entries. The six flagship depth targets, reusable formation histories, operational balance studies and connected European history remain ahead.

## Recommended next milestone

**v9.5 proposal · Operation Bodenplatte across the full operation**

A reader should be able to follow why the Luftwaffe launched the raid, what its formations were assigned, what they reached and what the two sides reported. The [20-location ledger](../research/transcriptions/bodenplatte-operation-scope-1944-1945.json) covers 16 December 1944 through 14 January 1945, with the raid on 1 January. Locations include attacks, intercepted formations, intended targets and disputed outcomes. The [archival follow-up](../research/sources/atlas-bodenplatte-original-sources-2026-11-13.md) includes the Sint-Truiden command annex, the Melsbroek airframe cases and the revised archive references.

1. Extend the existing map and ledger to all 20 documented locations. Show assignments, actual attacks or diversions, intercepts and disputed outcomes. Use supported positions and mark uncertain ones. Keep the 16 dated entries connected to the raid and its aftermath.
2. Extend airfield and formation drill-downs. At Sint-Truiden, show XXIX TAC's 10 destroyed and 31 damaged alongside the 6/33 excerpt, each with its source and scope. At Melsbroek, link the squadron and aircraft cases and show the difference between damage on 1 January and later disposal. Retain the existing five detailed airfield accounts.
3. Carry the same evidence through the interface, shareable links and exports. Make loss, damage, opponent claims, air and ground scope, and source disagreements visible. Prevent duplicate counting across station, unit and aircraft records. Use empty states where records are missing.
4. Verify the dossier → map/chronology → airfield → formation and source journey on desktop and mobile. Include keyboard and touch selection, direct links, filters and export checks. Verify the deployed Pages route after the tested implementation is merged.

Free archive retrieval can proceed alongside this milestone. The project will use publicly accessible copies and extracts or reading-room access. Paid bulk ordering is outside scope. First check Kew's AIR 27/1714 for the 320 Squadron January forms and AIR 26/203 with AIR 26/200 for the 139 Wing appendix and diary. The Dutch equivalents and operational returns are Nationaal Archief 2.13.154, inventory 5 and 12. Keep AHB5/234, the A-92 original returns and the Manrho/Pütz appendices open. The existing evidence supports publishing the operation with those gaps visible. [Access notes and request scope](../research/sources/atlas-bodenplatte-original-sources-2026-11-13.md#january-returns-archive-access-follow-up)

## Following milestones

| Order | Reader outcome | Completion evidence |
| --- | --- | --- |
| 2 · Bagration flagship | Follow Soviet and German air operations through the changing ground situation, then open the formations and their records. | Several source-backed operation cases, dated geography, opposing perspectives and a formation journey. Use the [Eastern unit research](../research/sources/atlas-eastern-front-and-condor-legion-unit-data-2026-11-12.md) and [inventory evidence](../research/sources/atlas-aircraft-inventory-loss-ceilings-2026-11-11.md) as starting points. |
| 3 · Remaining flagship campaigns and all-entry review | Bring Defence of the Reich, Malta and Sicily to the Normandy/Britain standard and improve the remaining campaign entries. | Normandy, Battle of Britain, Bagration, Defence of the Reich, Malta and Sicily have deep, linked accounts. All 20 entries explain situation, objectives, participants, sequence, consequences and sources. Review the [bilateral evidence candidate](https://github.com/hound83/ww2-airwar/pull/20) and [Narvik candidate](https://github.com/hound83/ww2-airwar/pull/15) against main before reuse. |
| 4 · Formation and airfield histories | Trace a dated formation through its equipment, stations and operations. | Reuse the data relationships tested in Bodenplatte and Bagration. Aim for 20 substantive histories across the six flagships, with dated deployments and a traceable formation journey in each. |
| 5 · Operational balance studies | Use the records to answer questions about effort, losses, readiness, replacement and constraints. | Six worked studies with source definitions, compatible comparisons and inspectable exports. See study questions below. |
| 6 · v10, connected European air war | Move from the wider history into a campaign, operation, dated map and formation or source, then return to the wider context. | Six to eight Europe-wide chapters, working routes through all 20 campaigns, six flagship journeys, six evidence studies and verified desktop/mobile publication. |

## Evidence studies and v10 chapters

The studies examine Normandy's operational effort and response, British fighter readiness and replacement, Reich defence raid/escort/interception losses, Bagration's air-army activity, Malta/Sicily operational effort and Germany's 1944–45 aircraft output, fuel and pilot constraints. Use compatible reporting populations for ratios. Keep date, definition, force, geography and sources visible for comparisons.

The original chapter sequence remains Spain and prewar air power, early campaigns, Britain and maritime pressure, the multi-front war in 1941–42, attrition and reach in 1943, invasion and offensives in 1944, and retreat and resource constraints in 1944–45. Support guided reading, open exploration and investigation from the evidence. [Original product proposal](https://github.com/hound83/ww2-airwar/pull/23)

## Research priorities alongside implementation

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
