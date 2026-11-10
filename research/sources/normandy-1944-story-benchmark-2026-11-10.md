# Normandy 1944 benchmark: connected history, not a sortie-by-sortie reconstruction

**Research capture:** 10 November 2026. **Scope:** historical narrative in the public Campaign Explorer (6 June–30 August; campaign end 31 August), with a short pre-invasion explanation. **Implementation:** `dist/normandy-1944-story.js` overlays the historical v7.7 campaign data only for the v8 public experience. It preserves the original figures and their source classes.

## Why this milestone exists

Previous default: three near-month-long summaries and three detailed events (6 June, 25 July, 19 August). That obscured the most historically important question: why overwhelming Allied air superiority was compatible with weeks of costly stalemate, how combined air-ground operations changed during July, and why Allied interdiction did not prevent every German survivor escaping Falaise.

New review target: nine continuous chapters, **39 distinct date-and-title narrative episodes** (31 dated operational events and 8 explicitly marked representative-date *period-context* entries), each with event purpose, specific air role, German perspective, consequence and direct research links. The 16-scene v7.6 airfield notebook is cross-linked and its useful forward-basing observations are reflected in the chronological account. Do **not** concatenate those 16 notebook scenes with these 39 into a fictitious 55 unique events; the modules cover overlapping subjects at different levels.

## Source hierarchy and verified retrievals

All links below are retained as source IDs in the dataset, rather than copying large scans/PDFs into GitHub.

| ID | Authority / role | Limit |
|---|---|---|
| `rafAhbNormandyIII` | [RAF Air Historical Branch, NW Europe Vol III](https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/second-world-war-campaign-narratives/liberation-of-north-west-europe-vol-iii-the-landings-in-normandy/) | Official **postwar** air operational synthesis, not an individual combat diary |
| `rafAhbNormandyIV` | [RAF Air Historical Branch, NW Europe Vol IV](https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/second-world-war-campaign-narratives/liberation-of-north-west-europe-vol-iv-the-breakout-and-advance-to-the-lower-rhine-12-jun-30-sep-1944/) | Covers breakout to lower Rhine, not a June–August aircraft-loss ledger |
| `armyCrossChannel` | [U.S. Army CMH, Cross-Channel Attack](https://history.army.mil/Publications/Publications-Catalog/Cross-Channel-Attack/) | Ground/combined-arms landings and first weeks; not daily German air strength |
| `armyStLo` | [U.S. Army CMH, St-Lô 7–19 July](https://history.army.mil/Publications/Publications-Catalog/St-Lo/) | Local ground operation with important weather/Cobra context |
| `armyBreakout` | [U.S. Army CMH, Breakout and Pursuit](https://history.army.mil/Publications/Publications-Catalog/Breakout-And-Pursuit/) | Authoritative broader Army interpretation of July–September operations |
| `armyDailyChronology` | [U.S. Army CMH, Chronology, 1941–1945](https://history.army.mil/portals/143/Images/Publications/catalog/11-1.pdf) | Dated movements and campaign decisions, not independent air-loss records |
| `armyOverlordSummary` / `armyNorthernFrance` | [U.S. Army official Europe overview](https://history.army.mil/Research/Reference-Topics/Army-Campaigns/Brief-Summaries/World-War-II/World-War-II-European-African-Middle-Eastern-Theater/) and [Northern France](https://history.army.mil/portals/143/Images/Publications/catalog/72-30.pdf) | Beware official U.S. campaign-credit distinction: Normandy 6 June–24 July; Northern France from 25 July. Atlas groups the overall Overlord operational story through August; it does **not** claim its scope is the same as the Army campaign medal period |
| `canadaGermanNormandy` | [Canadian Army Historical Report, information from German sources](https://www.canada.ca/en/department-national-defence/services/military-history/history-heritage/official-military-history-lineages/reports/army-headquarters-1948-1959/invasion-battle-normandy-1944.html) | German perspective reconstructed retrospectively; interpretation and individual decisions need care |
| `canadaAugust` / `canadaTotalize` | [Canadian official August operations](https://www.canada.ca/en/department-national-defence/services/military-history/history-heritage/official-military-history-lineages/reports/army-headquarters-1948-1959/canadian-operations-north-west-europe-august-1944.html) / [Victory Campaign](https://www.canada.ca/content/dam/themes/defence/caf/militaryhistory/dhh/official/book-1960-army-ww2-3-en.pdf) | Canadian manoeuvre and bombing plans, not verified losses for every involved air formation |
| `canadaAirSupport` | [Canadian operational air-support study](https://www.canada.ca/en/department-national-defence/services/military-history/history-heritage/official-military-history-lineages/reports/army-headquarters-1948-1959/offensive-air-support-north-west-europe-ww2.html) | Air-ground coordination, not an aircraft kill tally |
| `rafOverlordStudy` | [RAF Historical Society, OVERLORD](https://www.rafmuseum.org.uk/documents/Research/RAF-Historical-Society-Journals/Bracknell-No-5-OVERLORD.pdf) | Retrospective speakers/interpretations; do not treat as uniform contemporary orders |
| `rafForwardControl` / `rafAirEvacuation` | [RAF Museum D-Day control and servicing](https://www.rafmuseum.org.uk/blog/lawn-mowing-on-d-day/) / [medical evacuation](https://www.rafmuseum.org.uk/blog/flying-nightingales/) | Specific infrastructure roles, no extrapolation into a total weekly sortie series |
| existing `navyGermanNormandy`, `murrayNormandy`, `normandyDetail`, `raf1944` | U.S. Navy German-source translation, USAF historian and RAF Museum / existing curated atlas notebook | Retain dated denominators and the known 13,973-vs-13,983 sortie category/headline conflict |

## Chapter outline and episode density

| Chapter | Period | Episodes | Historical connection |
|---|---|---:|---|
| The invasion and the air umbrella | 6–12 Jun | 5 | Airborne assault, D-Day, first ALG, German response, Carentan |
| The Luftwaffe responds; armies cannot break free | 13–18 Jun | 4 | Villers-Bocage, daily tactical support, 366th FG move, Cotentin isolation |
| Storm, airfields and the struggle for a foothold | 19–30 Jun | 4 | Weather, forward bases, Cherbourg/Epsom, failure to break through |
| Caen, Carpiquet and Saint-Lô | 1–17 Jul | 5 | Windsor, Caen bombing, Charnwood, 366th operations, Rommel wounded |
| Goodwood and the road to Cobra | 18–24 Jul | 4 | Major bomber support, limits, storm delay, aborted Cobra strike |
| Cobra transforms the battlefield | 25–31 Jul | 4 | Friendly-fire losses, armour exploitation, Coutances, Avranches |
| A mobile war: Mortain | 1–9 Aug | 4 | Third Army, Lüttich, Totalize, combined air-ground defence |
| Falaise: attack, escape and collapse | 10–21 Aug | 5 | Encirclement, Tractable, German withdrawal, Chambois, collapse |
| From Normandy to the Seine | 22–31 Aug | 4 | Pursuit, Paris as consequence, river crossings, forward air logistics |

The chapters are chronological and non-overlapping. Locations are **indicative**: every event is a historically meaningful geographic reference for reader navigation, not an aircraft track, border, airport survey or precise centroid of losses. Multi-day processes are located by a representative day of a documented operational development and marked `period-anchor` in data and UI, with an explicit no-single-day-claim caution. These anchors are 15, 22 and 29 June; 12, 16, 23, 27 and 30 August. The other 31 records refer to date-specific operations or developments reported by official historians.

## Historical findings and interpretation boundaries

1. **Air superiority versus ground breakthrough.** The Allies controlled much of the operational airspace over the invasion, yet defenders in bocage and near Caen could keep the Allied armies in a relatively shallow lodgement into July. Present air supremacy as *enabling* reinforcement, reconnaissance and interdiction, not automatically winning every ground engagement.
2. **Infrastructure is central.** Air support depended on ALGs, engineering, servicing, radar/ground control, fuel and evacuation. Preserve A-1 geography and the distinction between a strip's first landing, initial operating date, readiness and permanent construction. Connect the older v7.6 notebook rather than duplicating its survey claims as exact points.
3. **Weather was an operational actor.** June storms impeded supplies; July rain postponed Cobra and complicated target identification; battlefield visibility mattered during retreat. Do not ascribe every pause to German fighter resistance.
4. **Heavy bombing was neither magic nor harmless.** Charnwood/Goodwood/Cobra illustrate destructive potential, debris, timing, civilian damage and friendly-fire tragedy. Official descriptions vary in their evaluation of operational effect; the Atlas should present the mechanism and documented limitation, not an unqualified 'bombers caused victory' claim.
5. **Cobra required ground exploitation.** Aerial bombardment contributed to the breach, but the next-day commitment of armour was critical to converting it into a breakout. U.S. Army chronology and Breakout and Pursuit give this sequence.
6. **Mortain was combined-arms defence.** Accounts of Typhoon destruction of German tanks are often overclaimed; attack results require separation into air strike claims, ground-caused destruction, mechanical losses and abandonment. The new episode intentionally supplies no tank kill number.
7. **Falaise was disastrous but not a perfect seal.** The narrowing corridor was contested over days, and many German troops escaped despite severe losses. Never reinterpret burned vehicles photographed on roads as independently verified results of Allied air attacks, or convert destroyed ground vehicles into aircraft losses.
8. **Period convention matters.** The official U.S. Army campaign designation changes on 25 July. This Atlas's 'Normandy: Overlord' June–August story is an editorial **operational narrative scope**, with an explicitly labelled pursuit consequence. It is not a statutory medal-date interval or a numeric theater-wide accounting frame.

## Quantitative evidence kept intentionally unchanged

- 135 source-scoped quantities across the 20-campaign dataset remain untouched. The Normandy German first-week sorties, Luftflotte 3 5 June on-strength and 6 June serviceability, wider 6 June–7 July losses, Allied D-Day sorties and D-Day losses keep original populations.
- No source-independent daily fighter loss count is created for the 36 additional Normandy dates. The bilateral UI should explicitly classify these as lacking matched daily numeric evidence rather than displaying a synthetic zero, campaign-wide total or invented ratio.
- The German published 6 June–1 July operational-category sum 13,973 differs from the printed headline 13,983 by ten sorties. Retain both and the discrepancy; do not 'correct' the source by inference.

## Next archival work, separate from acceptance of narrative depth

Recover and transcribe source-specific RAF AIR 27 squadron ORBs, USAAF Ninth Air Force mission summaries, Luftflotte 3 / Generalquartiermeister daily damage books and Canadian air-ground-control reports for selected 6 June, 18 July, 24–26 July, 7–9 August and 14–21 August windows. The priority is dated formation, theater, serviceable versus on-strength, sortie category, confirmed own-aircraft losses and source page; link these to episodes **only if the local reporting scope matches**. The new historical story need not wait for these exact-day reciprocal attrition studies.
