# European Air War Atlas: proposed roadmap through v10

**Prepared:** 11 November 2026 (Europe/Amsterdam).
**Status:** proposal for product direction; implementation has not started.
**Repository:** https://github.com/hound83/ww2-airwar
**Verified baseline:** `main` commit `13a9529394e7091940cd9e6ce525b5c5f365bea0`, Normandy benchmark merged in PR #22 on 10 November 2026 at 22:42 UTC.
**Version convention:** the current source still uses v8-series assets and the existing work queue refers to v8.5. The labels v8.6, v8.7, v9.0, v9.1, v9.2 and v10.0 below are proposed future product releases, not statements about existing tags. Conversation titles are not release identifiers.

## Product destination

By v10, the Atlas should explain how the European air war developed, where it happened, which forces participated, what they attempted, what changed and what the evidence establishes. Readers should be able to move between a Europe-wide historical account, a campaign, an operation, the dated map and the relevant formations and sources without losing context.

Two deliberate depths:

- **Six flagship campaigns:** Normandy, Battle of Britain, Bagration, Defence of the Reich, Malta and Sicily. These should offer sustained cause-and-effect histories, multiple worked operations, opposing perspectives, relevant dated geography, participants and useful quantitative evidence.
- **All 20 existing campaign entries:** useful, coherent historical accounts covering context, progression or the sequence of a one-day operation, objectives, participants, outcome and significance, relevant geographic references and source-linked operational evidence. The six flagships receive deeper treatment; the other entries are not described as equally complete.

v10 is an editorial and functional milestone, not a claim of complete daily aircraft accounting for all Europe. Source coverage and historical scope should be explicit. The aircraft physics solver remains a separate product under the existing integration contract.

## Verified starting point and open housekeeping

- 20 campaign entries, 61 operational chapters, 119 chronology entries and 135 source-scoped numerical observations.
- Normandy: 9 connected chapters and 39 episodes, of which 31 are date-specific operations/developments and 8 are explicitly identified period-context anchors.
- The Normandy release improved narrative and local episode markers; numerical observations stayed unchanged.
- The existing research library contains German losses, pilot attrition, readiness, output and fuel, plus Allied datasets, but these have independent reporting scopes.
- The merged PR's final core and Chromium browser checks passed. Live publication has not been independently verified in this planning conversation.
- The top of `docs/STATUS_AND_NEXT_STEPS.md` still labels the merged Normandy work as a release candidate. At the next implementation kickoff, reconcile this text with actual PR/deployment state, confirm the live route and establish a release manifest. Do not infer live publication from merge alone.
- The local checkout observed in the preceding status check was an old v7.5 integration branch. Future implementation must start from freshly verified remote state and preserve unrelated local work.

## Release sequence

| Proposed release | Main reader outcome | Principal scope | Release evidence |
|---|---|---|---|
| **v8.6 — Normandy: the campaign unfolds** | Follow an operation as a connected account of plans, geography, air action and consequences. | Five showcase operations; sourced battlefield snapshots; participating formations and airfields; operation-specific figures alongside the story. | Five complete operation journeys, target 15–25 new scoped quantitative observations, verified map/story synchronization and live default route. |
| **v8.7 — Battle of Britain: the battle for air control** | Understand how objectives, defensive organization, raids and losses changed through the campaign. | Apply the shared campaign reader to Britain; RAF/Luftwaffe perspectives; sector organization, dated units/bases, worked raids and meaningful operational comparisons. | A second flagship passes the same reader standard, with explicit campaign phases and at least four deeply worked operation/date cases. |
| **v9.0 — The European campaign atlas** | Explore a useful historical account in every existing campaign, with six flagship journeys spanning contrasting theatres and forms of air warfare. | Bring Bagration, Defence of the Reich, Malta and Sicily to flagship depth; strengthen the remaining campaign accounts; build navigation between related operations/campaigns. | Six flagship campaigns meet the depth contract; all 20 meet the campaign baseline; Western, Eastern, Mediterranean and strategic air-war journeys pass review. |
| **v9.1 — Units, aircraft and airfields through time** | Follow the formations behind events and understand how basing, equipment and deployment changed. | Reusable dated formation and airfield pages, station changes and equipment/service periods; links back to operations; selected documented deployment paths. | Target at least 20 substantial formation histories across the flagship campaigns; linked bases and deployments are dated and sourced; at least one traceable formation journey for each flagship. |
| **v9.2 — The changing balance of air power** | Understand operational effort, attrition, replacement, serviceability and constraints at an appropriate reporting scale. | Connected evidence views for sorties, aircraft/pilot losses, replacements, strength/serviceability, output and fuel; campaign-level explanations and selected longitudinal studies. | Six worked analytical studies tied to campaigns, valid same-scope comparisons, inspectable definitions and reusable sourced exports. |
| **v10.0 — The connected European air war** | Read and explore the wider war as one historical account, while retaining access to operations, formations and original evidence. | Six to eight Europe-wide narrative chapters; campaign connections and cross-front context; integrated guided/open exploration, stable shareable state and final coverage/UX reconciliation. | The full Europe → campaign → operation → formation/source journey works across all 20 entries, with six flagships, six evidence studies and verified live desktop/mobile routes. |

The counts above are proposed scope and depth targets. Research must establish authentic records; record quotas are never grounds for fabrication or for splitting a single observation into artificial extra facts.

## v8.6 — Normandy implementation package

**Historical spine:** existing nine chapters, extended into a map-linked operational experience.

**Five showcase operations:** D-Day; Goodwood; Cobra; Mortain; Falaise. Research may define a multi-day window where that matches the operation better than a single date.

Deliver together:

1. **Battlefield snapshots.** Source-dated areas, objectives and broad fronts/advances where the source supports them. Discrete dated snapshots are sufficient; do not animate continuous front motion between observations as if recorded. Planned axes and actual advances must be distinguishable.
2. **Air operations.** Identify participating formations, aircraft roles and documented bases; link the operation to reconnaissance, interdiction, bombing, air defence or transport as appropriate. Indicate operating areas or intended routes only when sourced.
3. **Operational evidence.** Target 15–25 genuinely new observations across the five showcases: aircraft committed/available, sorties, bombing effort, confirmed own losses or other directly useful operational quantities. Include reporting period, formation/geography, metric definition and source/page.
4. **Explanatory reading.** Plans, execution, opposing response and consequences appear together. Retain the friendly-fire, weather, ground exploitation and disputed-effectiveness findings already researched.
5. **Readable presentation.** Clear hierarchy, map legends and source-linked historic images/maps where rights permit; consistent event selection and useful mobile layout.

**Demonstration:** choose Cobra, inspect the intended attack area and German position, read air preparation and its losses, then advance to the sourced breakthrough/breakout snapshot and participating formations. Each view preserves the selected operation and date.

**Shared foundations introduced here:** stable IDs, provenance records, date/period precision and geography types. Build only what this real campaign needs; later releases extend the same records.

## v8.7 — Britain establishes a reusable pattern

Normandy demonstrates air support for a ground campaign. Britain should demonstrate the same product working for an air-defence campaign.

- Use a sourced campaign progression covering changing objectives, defensive response and operational effects.
- Explain RAF control/sector organization and Luftwaffe objectives through actual operation cases.
- Show relevant bases and documented attack areas. A decorative flight path must never imply a recovered aircraft track.
- Develop at least four substantial cases, including established high-value research dates where evidence is available.
- Present strength, serviceability, own losses and claims with original definitions and dates.
- Extend shared navigation, historical imagery and reading components instead of creating another disconnected standalone preview.

Acceptance is the reader's ability to explain how and why the battle changed using the map, narrative and evidence together.

## v9.0 — Europe-wide coverage with six flagships

This is a deliberately large coverage milestone and can require several implementation/research cycles before one public release.

Additional flagships:

- **Bagration:** Soviet and German operational perspectives; air-army activity, changing ground situation and available dated formation records.
- **Defence of the Reich:** raid/escort/interception relationships and the evolution of the strategic air campaign.
- **Malta:** contested supply, defence and offensive air operations, with the relevant British, Axis and maritime context.
- **Sicily:** an amphibious campaign with RAF/USAAF, German and Italian operational evidence.

Minimum campaign contract for all 20:

- State the situation, objectives, relevant participants and geography.
- Explain a sourced sequence with consequences. One-day operations receive a meaningful operation sequence rather than invented multi-month phases.
- Include useful operational evidence and explain what it measures.
- Link to sources and to relevant preceding/following developments.
- Give opposing perspectives appropriate attention where evidence exists.
- Make the entry useful in its own right without requiring an external research-library detour.

Flagship contract adds multiple deeply worked operations, sustained chapter narratives, dated map states and a stronger set of participant/quantitative records. Event counts follow historical significance rather than a uniform numerical quota.

## v9.1 — Formation and airfield continuity

Turn the formations already appearing in campaigns into a reusable historical layer.

- Keep organizational levels explicit: a squadron, group, wing, Geschwader, Gruppe and air army are not interchangeable.
- Record name/aliases, parent organization, dated equipment, station or operating-area observations and participation links.
- Differentiate arrival, initial use, operational readiness, construction completion and departure for airfields.
- Show only relevant units for the selected date and campaign; unknown positions remain unknown.
- Use documented base moves as dated observations, without an invented continuous flight route between them.
- Target at least 20 substantial formation histories distributed across the flagships, with a traceable journey in every flagship.

Broader roster completeness is not required for this release. Dated relationships and meaningful histories matter more than placeholder entries.

## v9.2 — Operational and strategic balance

Use the research library in the reader's historical investigation through explicit, valid links.

Six proposed analytical studies:

1. Normandy: Allied operational effort and the German response in selected comparable windows.
2. Britain: fighter serviceability, recorded own losses and replacement pressures.
3. Reich defence: raid/escort/interception losses and fighter/pilot availability.
4. Bagration: Soviet operational activity and the German response with available source definitions.
5. Mediterranean: British/Allied and Axis operational effort in selected Malta/Sicily windows.
6. Germany 1944–45: aircraft output, fuel and pilot constraints as separately defined contextual series.

Each study must pose a concrete question, show what the sources establish and explain the relationship to the campaign. Some studies may be juxtaposed contextual series rather than arithmetic comparisons. A ratio requires compatible numerator/denominator, reporting definitions, dates and populations. If evidence changes a proposed study's feasibility, document the change and substitute another useful sourced question within its theatre rather than leave an empty showcase.

Do not convert production directly into operational strength or plot a modeled causal coefficient as historical proof. Pilot casualties, airframe losses, damaged aircraft and claims remain separate.

## v10.0 — A connected historical work

Add a genuinely new Europe-wide narrative layer tying the campaign work together.

Proposed macro chapters, subject to historical editing:

1. Spain and the development of prewar air power.
2. Expansion and the early campaigns, 1939–40.
3. Britain, maritime pressure and the widening air war.
4. The multi-front war, 1941–42.
5. Attrition, industrial scale and changing operational reach, 1943.
6. Air superiority, invasion and offensives across fronts, 1944.
7. Retreat, resource constraints and the end of the war, 1944–45.

These chapter scopes are reading aids, not uniform statistical populations. Explain relationships and competing demands with evidence; do not imply every simultaneous change has a demonstrated causal link.

Reader routes:

- **Guided history:** macro chapter → campaign → operation → map/evidence.
- **Open Atlas:** date/geography/topic → relevant campaign or formation, retaining context.
- **Evidence investigation:** historical question → curated study → original scoped records and sources.

Integrate the routes into one coherent interface with deep links, return navigation and mobile-friendly reading. v10 should let a reader explain both a single operation and its place in the wider war. It is not just an end-of-roadmap cosmetic pass.

## Research and delivery rules applying to every release

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

Planning this sequence does not start implementation of all six releases.

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

Eastern and Mediterranean source acquisitions must be scoped in their own implementation research ledgers. No complete archival accessibility or daily bilateral dataset is asserted by this proposal.
