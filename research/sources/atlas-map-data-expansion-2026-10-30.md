# European Air War Atlas — map-first source and data expansion

**Research started:** 30 October 2026  
**Target period:** 1936–May 1945  
**Status:** verified *discovery and triage*, **not** a claim that the sources have been fully transcribed or their maps georeferenced.

This is a standing research register. Keep discovering and preserving relevant leads in Chat, including adjacent countries, forces and years. Do not change the physics repository. The current Atlas has an illustrative Natural Earth coast-and-campaign-pin map, **not** dated deployments or front lines. Source-backed data and map layers should take priority over cosmetic work.

## Source-use labels

- **Primary record**: original wartime report/map, often served by an archive. Its map or intelligence estimate describes what its author believed **at that date**; it is not automatically correct ground truth.
- **Official retrospective**: postwar national-service history or official statistical compilation based on archival material.
- **Secondary / source-compiled**: published scholarly interpretation, edited transcript or specialist synthesis. Independent check against original encouraged where feasible.
- **Discoverable ≠ extracted**: an index, PDF description or catalogue entry is not a verified numeric observation or a latitude/longitude point.
- **Reuse gate**: bibliographic citations and independently checked individual historical facts may be recorded; embedding scans, reproducing whole tables, or systematically ingesting copyrighted compilations requires a separate rights review. No source's unspecified blanks may be represented as zero.

## A. Geographic and map evidence — highest immediate priority

| ID / priority | Source and record identity | Original dates / area | What it could provide | Stage / obstacle |
| --- | --- | --- | --- | --- |
| MAP-00 · **P0 extracted** | [Rijksdienst voor het Cultureel Erfgoed (RCE), *Vliegvelden in Nederland*](https://data.overheid.nl/dataset/81058-vliegvelden-in-nederland), [original WFS](https://services.rce.geovoorziening.nl/landschapsatlas/wfs?request=GetCapabilities) | Source phases from earlier/later years; **101 records overlap 1936–45**, the Netherlands | **Actual WGS84 airfield footprint polygons**, source name/type/use and start/end **year**; **64 unique site names**, 73 source records tagged purely `militair`. Imported in `research/transcriptions/airfields-netherlands-rce-1936-1945.geojson`, 89 Polygon + 12 MultiPolygon. | **Government public-domain data.** All 191 original records retrieved, dated overlap filtered (101) and validated with `scripts/import-rce-airfields.cjs` and `tests/rce-airfields.cjs`. Multiple records may be different phases of the **same** field, not 101 airfields; no unit deployments inferred. |
| MAP-00B · P0 crosscheck | [Nederlands Instituut voor Militaire Historie, *Vliegvelden in oorlogstijd*](https://www.nimh.nl/militaire-geschiedenis-van-nederland/historische-overzichten/vliegvelden-in-oorlogstijd) | 1940–45, Netherlands | **33 individually linked WWII-era airfields**; authoritative contextual crosscheck for facility identity, war service and alternate names. | Official linked history list found; not yet fully cross-matched to RCE polygons. Different list scope, not an inconsistency in counts. |
| MAP-01 · P0 | [US Library of Congress, *World War II Military Situation Maps*](https://www.loc.gov/collections/world-war-ii-maps-military-situation-maps-from-1944-to-1945/about-this-collection/) | 6 Jun 1944–26 Jul 1945, northwestern Europe | **416 original situation maps** plus **115 reports**; daily Western *ground* front-line positions and unit symbols. Strong source for a dated background layer, **not** air-group deployments. | Collection checked; images not georeferenced. [LOC rights notice](https://www.loc.gov/item/2006577707/) allows research access but requires item-level reuse judgment and credit. |
| MAP-02 · P0 | [Russian MoD, *Pamyat Naroda* operational maps](https://pamyat-naroda.ru/ops/) and [unit documents](https://pamyat-naroda.ru/documents/) | 1941–45, Eastern Front | Interactive historic front lines, operations, strike directions; original unit journals, maps, operational reports and orders searchable by formation. Strong starting point for East. | Catalog / interface discovered; historical points and trajectories **not** independently extracted. Russian-language material; website reuse and access conditions need review. |
| MAP-03 · P0 | [Bundesarchiv Luftwaffe airfield records](https://www.bundesarchiv.de/im-archiv-recherchieren/archivgut-recherchieren/nach-themen/flugplaetze-und-fliegerhorste-der-deutschen-luftwaffe-und-deren-uebergeordnete-organisation-im-zweiten-weltkrieg/) | 1939–45, Germany and occupied Europe | Airfield command documents and dated changes in basing/administration. The archive identifies digitized **RL 7, RL 2-III, RL 19 and RL 21** groups. | Original collections found; must resolve individual file and scan before assigning a dated airfield/unit. |
| MAP-04 · P0 research / rights hold | [Henry L. deZeng IV, *Luftwaffe Airfields 1935–1945*](https://www.ww2.dk/lwairfields.html) | 1935–45, most European countries plus North Africa | Country PDFs explicitly include historic airfield coordinates, named units, operational periods and airfield histories, ideal **discovery/reference** material. | **Copyrighted, all rights reserved.** General fair-use permission for personal research is **not** permission to bulk copy the authored compilation into a public dataset. Research individual claims and seek an independent/authorized basis for web publication. |
| MAP-05 · P0 | [USAF History, *USAAF Bases in the United Kingdom*](https://www.dafhistory.af.mil/Portals/16/documents/Timelines/World%20War%20II/usaaf_bases_in_united_kingdom.pdf?ver=2016-08-30-150752-303) | 1941–45, United Kingdom | Official historical station-number ↔ name ↔ county ↔ principal-unit crosswalk. E.g. Station 102 Alconbury, 106 Grafton Underwood; important to avoid basing-location ambiguity. | Official PDF found. Station number is **not** coordinate; geocode and verify exact operational airfield and assigned date separately. |
| MAP-06 · P0 | [NARA captured German microfilm T971 finding aid](https://www.archives.gov/files/research/captured-german-records/microfilm/t971.pdf) | 1943–44, Soviet fronts | Captured German intelligence maps: T971/4406/484 (Feb 1943, Soviet air-regiment disposition), /485–486 (15 Nov 1943, north/south), /487 (1 Jun 1944, personnel/strategic concentrations). | **Original captured enemy intelligence**, not independently verified Soviet positions. Finding aid located; originals/scans not yet retrieved. |
| MAP-07 · P0 | [German documents in Russian archives, f. 500 op. 12452 d. 129](https://wwii.germandocsinrussia.org/ru/nodes/6384-akte-129-standorte-der-su-fliegertruppe-und-ihre-belegung-mit-erkannten-verb-nden-im-europ-ischen-russland-stand-13-04-1941) and [d. 145](https://wwii.germandocsinrussia.org/ru/nodes/6389) | 13 Apr / 10 Jun 1941, western USSR | Contemporary **German assessment** of Soviet air-unit/airfield dispositions; useful 1941 map anchors and contrast against Soviet records. | Catalog verified, archive access terms must be accepted; dated reconnaissance/intelligence **estimates**, not Soviet certified counts. Do not reproduce protected scans without checking terms. |
| MAP-08 · P1 | [RAF Air Historical Branch WWII campaign narratives](https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/second-world-war-campaign-narratives1/) | 1936–45, Norway, France, UK, Mediterranean, Italy, NW Europe | Official postwar histories, multiple appendices and **maps**, including France/Low Countries 1939–40 and Italy/Normandy; may plot airfields, air commands, operations and routes. | Index checked; extract only dated/map-specific locations with report and page. |
| MAP-09 · P1 | [US Army Center of Military History, 40 WWII campaign booklets](https://history.army.mil/Publications/Publications-Catalog/Campaigns-of-World-War-II-A-World-War-II-Commemorative-Series/) | 1939–45, relevant European theaters | High-level campaign geography and vetted timelines; mostly **land** campaigns and context for air war. | Official retrospective. Review map dates and rights. |
| MAP-10 · P1 | [LOC WWII military intelligence map collection finding aid](https://findingaids.loc.gov/repositories/7/resources/435) | 1931–45, many nations | Catalog describes **21,231** maps and related materials, US/British/German military intelligence. Could unlock other years/theaters. | Most access needs in-person archive handling; **not** a ready-to-import digital dataset. |
| MAP-11 · P1 | [NARA cartographic WWII research guide](https://www.archives.gov/files/research/cartographic/cartographic-ww2-guide.pdf) | 1944–49 world airfield maps; other wartime cartography | Series NAID **6857720**, about **250 airfield maps** showing location/name, often runways. | Listed as **not digitized**. A possible deeper archival route, not immediate web layer. |
| MAP-12 · P1 | [Historic England wartime airfield survey](https://historicengland.org.uk/research/current/discover-and-understand/military/historic-military-airfields/) and [USAAF photo archive](https://historicengland.org.uk/images-books/archive/collections/photographs/usaaf-collection/) | UK, primarily 1940–45 | Historic airfield catalog, spatial corroboration, dated base photographs; pair with MAP-05. | Survey/report identified; source and imagery rights distinct. |
| MAP-13 · P1 | [USAF *A Pattern for Joint Operations: WWII Close Air Support, North Africa*](https://media.defense.gov/2010/May/26/2001330296/-1/-1/0/AFD-100526-044.pdf) | North Africa, especially Dec 1942 | Original-history map explicitly distinguishes Allied/Axis airfields and fair/all-weather landing grounds near Tunisia. | Historical **single-date** illustrated map; not a general-purpose continuous airfield database. |

**Map integrity rule:** a front line (ground war), an airfield (infrastructure), a unit deployment (one formation at a dated location), a mission/raid (path or target), a campaign (area/date range), and a claim/loss position (incident of uncertain location) are **different feature types**. Never display one as though it documents another.

### First actual map dataset delivered (RCE, 30 October 2026)

The RCE WFS returned **191** polygon records. A **calendar-year overlap** test for Atlas 1936–45 retained **101** dated footprint records for **64 unique names** (not 101 independent operating fields). Geometry was retained in longitude/latitude coordinates. The derived file is in `research/transcriptions/airfields-netherlands-rce-1936-1945.geojson`, accompanied by a repeatable importer and a test. It is deliberately **research data only**, not switched on in the public Atlas yet: named airfields can have multiple phase polygons, some sites are civilian, and no date-exact unit deployment is encoded. Source timestamps, year precision, license, original WFS record IDs and the original Dutch use/type values are preserved. Attribution is still included though the catalogue calls the dataset public domain.

**Independent Dutch source-name crosscheck:** of the NIMH wartime list's 33 names, **31 match an RCE source name literally**. The remaining two appear as likely aliases in RCE: NIMH **De Kluis** vs RCE **Malden / 'De Kluis'**, and NIMH **Grave** vs RCE **Keent / Grave**. These are **identity-mapping candidates**, not automatically proof that every NIMH airfield maps to one exact dated footprint.

## B. Quantitative aviation evidence — expand without redoing existing transcriptions

| ID / priority | Source | Resolution and useful missing fields | Current status / cautions |
| --- | --- | --- | --- |
| DATA-01 · P0 | [USAAF, *Statistical Digest: WWII*](https://www.ibiblio.org/hyperwar/AAF/StatDigest/) | Official 1945 compilation. **Table 84** monthly aircraft on hand **by type/principal model**, 1941–Aug 1945; **119/120** ETO/MTO combat sorties by aircraft class; **143/144** ETO/MTO tons bombed; broader personnel, flying hours and loss tables. | Major Atlas portions already imported from Tables 74, 76, 104, 128, 159, 167. Prioritize **not-yet-extracted tables** and reconcile with the original table definitions. Table 84 is **USAAF worldwide**, *not* Europe-based P-51 count. Transcription site has occasional OCR errors. |
| DATA-02 · P0 | [UK National Archives, AIR 22 periodical returns](https://www.nationalarchives.gov.uk/help-with-your-research/research-guides/royal-air-force-operations/) | Weekly official intelligence, force strengths, operations, Allied/enemy losses and statistical returns, 1939–45. Potential RAF aircraft/pilot series. | Existing Atlas has RAF AIR 22/262, /293, /296 partial 1940 transcriptions; pursue **other dates, commands, theaters** before assuming monthly continuity. |
| DATA-03 · P0 | [RAF AHB *Despatches and Reports*](https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/despatches-and-reports/) | Bomber Command quarterly reviews 1942–44; **Coastal Command monthly reviews 1942–May 1945**; campaign commander reports. Missing Atlantic/naval, bomber and Mediterranean dimensions. | Official archival publications indexed; inspect tables, date/command and reporting denominator. These are particularly good branches beyond fighter-only view. |
| DATA-04 · P0 | [RAF AHB *Second World War Campaign Narratives*](https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/second-world-war-campaign-narratives1/) | Official regional/period studies: Defence of Britain, Norway, France, Greece/Crete/Malta, North Africa, Italy, NW Europe, maritime war; appendices and serviceability/operational tables. | Index verified; published postwar synthesis, though based on original records; country/air-command scope varies. Also a map source. |
| DATA-05 · P0 | [Bundesarchiv German Luftwaffe central staff](https://www.bundesarchiv.de/im-archiv-recherchieren/archivgut-recherchieren/nach-themen/deutsche-streitkraefte-1933-bis-1945/) and [RL 2-III/700–734 source trail](https://www.ww2.dk/oob/statistics/gobintro.html) | *Soll, Istbestand, Einsatzbereitschaft, Verluste*: establishment / actual / serviceable / losses by unit; returns 1938–Jan 1945, first weekly then roughly ten-day. | Original German record groups verified, individual scan transcription incomplete. Not all aircraft types or theaters are interchangeable with RAF AHB VII/107. |
| DATA-06 · P0 | [Russian MoD *Pamyat Naroda* unit documents](https://pamyat-naroda.ru/documents/) | Soviet operational reports and war diaries may give air-army/front aircraft, sorties, pilots, readiness, losses and raid-by-raid dates. | Original source hub located; **structured numerical extraction not started**, coverage very uneven. **Soviet Air Forces (VVS)** must remain distinct from PVO (air defence), naval and long-range forces. |
| DATA-07 · P1 | [USSR air-war specialist monthly research](https://www.soviet.airforce/home/english-2/vvs-air-operations-1941-45) | Secondary archive-backed monthly/daily VVS order of battle, Soviet + German loss reports, industry, evacuation and tactical notes for 1941–45. | Useful bibliography and contradictions; **commercial books / proprietary tables**, no systematic republication or treating self-reported verification as a scan audit. |
| DATA-08 · P1 | [UK National Archives AIR 27 unit ORBs](https://www.nationalarchives.gov.uk/help-with-your-research/research-guides/royal-air-force-operations-record-books-1911-1963/) / [AIR 50 combat reports](https://www.nationalarchives.gov.uk/help-with-your-research/research-guides/raf-combat-reports-1939-1945/) | RAF squadron daily units, aircraft types, missions, aircrew, locations; combat claims including **place/height/date/time**, enemy type and claimed outcome. | Original squadron records, often paid access; **combat claim ≠ independently confirmed loss**; many reports incomplete. Good event-map candidate if sampled and verified. |
| DATA-09 · P1 | [Buffotot & Ogier (1975), French Air Force archival reconstruction](https://www.persee.fr/doc/rharm_0035-3299_1975_num_2_3_7869) | France 10 May–25 Jun 1940: dated aircraft totals by status/category and replacement/delivery flows; derived from French GQGA records, original archive references **SHAA carton D1-115/D1-116**. | **Secondary archival research**, rare useful France dataset. Important explicit denominators below; source warns daily returns deteriorate after 9 Jun. |
| DATA-10 · P1 | [Italian Air Force official historical overview](https://www.aeronautica.difesa.it/2023/09/07/historical-timeline-world-war-ii/) | At Italian entry 10 Jun 1940: **approximately** 3,000 aircraft, about two-thirds operational. Points to Regia Aeronautica in Africa, Mediterranean, Balkans and USSR. | Official institutional **approximation**, not exact frontline strength or a month-by-month census. Seek archival series before drawing charts. |
| DATA-11 · P1 | [Spanish Defence Ministry air force historical archive](https://patrimoniocultural.defensa.gob.es/en/centros/archivo-ejercito-aire/colecciones/) | **1936–39 Spanish Civil War**, official aircraft/operations/foreign support and aerial-unit archives for Spanish air forces and German/Italian participation. | Official original collection route identified; no figures transcribed. 1936–39 coverage is otherwise very thin in Atlas. |
| DATA-12 · P1 | [US Strategic Bombing Survey evidence](https://www.ibiblio.org/hyperwar/AAF/USSBS/ETO-Summary.html) | German production, service restrictions, fuel/oil, bomber effects, industrial breakdowns. | Some industrial evidence already in Atlas. Seek individual aircraft and fuel production exhibits; production is not operational strength. |
| DATA-13 · P2 | RAF [*Maritime War* statistics volume](https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/second-world-war-campaign-narratives1/) | Atlantic/Bay of Biscay, North Sea and Mediterranean: Coastal Command, anti-submarine patrols, losses and sorties by period. | Official statistics index exists, original tables not yet evaluated. Could fill large missing maritime dimension. |
| DATA-14 · P1 | [NIMH open data, *Oorlogsvliegers*](https://opendata.archieven.nl/dataset/72A9846F5BEE4603A23B44C14CC6C945), archival access **726.1224** | **Nearly 900 Netherlands-origin RAF / Fleet Air Arm personnel** who served 1940–45, underlying Erwin van Loo research dataset. | Official NIMH dataset marked **CC0 1.0**, strong pilot/personnel lead. Source catalogue inspected; downloadable XML could not be retrieved in this pass (web access returned 403). **Not yet extracted**; check exact fields before comparing to any fighter-pilot roster. |

### A concrete new numeric lead: French 10 May 1940

Buffotot & Ogier, *Revue historique des Armées* 1975, pp. 88–117, using French Air Staff archival returns:

| Source statement | Aircraft | Population / meaning |
| --- | ---: | --- |
| Total French Air Force inventory | **5,026** | Includes overseas, training, reserve and non-front aircraft. **Not** fighters available over France. |
| At metropolitan field forces | **2,176** | Aircraft *aux armées*, in the metropolitan operational armies, several readiness categories. |
| Frontline aircraft stated as available / in first line | **1,368** | Different denominator from 2,176; requires table-level check before import. |
| Unavailable aircraft reported | **717** | Source says 33% unavailability in context of its military-force reporting categories; do **not** sum with 1,368 and assume complete partition without verifying the tables. |
| Aircraft delivered to field forces 10 May–10 Jun | **1,024** | Administrative deliveries, not all operational at squadrons. |
| Aircraft actually received by units by 5 Jun | **581** | **Different cutoff date** from 1,024; no direct subtraction as a 10 Jun unit-delivery deficit. |

These are **source-compiled observations, not yet website data**. A contemporary 10 May snapshot is promising, but flight-ready, first-line, in-repair and in-store classifications need verification at the article's Tables 1–3.

### Current source coverage is not ground truth for the whole war

- RAF Fighter Command and 2nd TAF sample data are **not all RAF theaters**. USAAF Eighth/Ninth are not Fifteenth/Italian-based fleets. Luftwaffe *Reich* is not its entire force. Soviet front aviation is not all Soviet military aviation.
- Current v7.3/v7.4 includes 27 German fighter stock snapshots, 30 German command-month all-aircraft loss totals, selected RAF 1940 operational statistics, selected USAAF digest tables, and five 1943–45 Soviet front/reserve fighter checkpoints. **Do not re-ingest or re-count these as discoveries.** See `DATA_NOTES.md`, `SOURCE_AUDIT.md` and `research/sources/lead-inventory.md`.
- Historical reports often provide *aircraft type* but not **variant**, and *claims* but not matched losses. Keep them distinct. Do not turn missing country-months into modeled historical figures.

## C. Research queue by highest marginal Atlas value

1. **Map contract first:** choose selectable dated *operations/campaigns*, *airfields*, *air-unit deployments* and *ground front lines* as separate overlays. Give each visible feature `date_from`, `date_to`, `geometry_kind`, `force`, `confidence`, `source_id` and a citation/rights field. Label modern coastline explicitly; historical boundaries only if independently verified.
2. **Source-backed first map test:** 1944–45 Western ground front line from LOC MAP-01 (a small number of selected dates), an independently verified subset of UK/Western airfields from MAP-05/03, and an **Eastern pilot slice** around June 1941 from MAP-02/07. Avoid implying these are complete theater surveys.
3. **Expand inventory beyond fighter-centric data:** USA(A)F Table 84, new AIR 22 / AHB Command returns, Soviet front-air-army reports; explicitly measure completeness by force x period x metric x theater.
4. **Fill overlooked theaters:** Spain 1936–39; France 1939–40; Norway/Scandinavia; Malta/Mediterranean/Italy/North Africa; Eastern front 1941–45; Atlantic/Coastal. Keep entries for Italian, French, Finnish, Romanian, Hungarian and other relevant air services even where sources remain missing.
5. **Preserve every useful cross-lead:** record original report call number, date and source page, unit, location certainty, source vs scan, type/variant, claimed vs actual status, competing figures, copyright and a potential Atlas screen/layer. Return from each branch to the main geographic/quantitative question.
6. **No silent production data import:** source discovery and the trial transcription can proceed in Chat; only publish a public map layer or model-specific comparative chart after a reproducible audit and a review of displayed definitions.

## Suggested data schema for the first map research export

```json
{
  "id": "stable_source_and_feature_id",
  "feature_type": "airfield | air_unit_position | campaign | air_operation | incident | ground_frontline",
  "geometry": null,
  "geometry_precision": "exact | approximate | regional | not_located",
  "observed_on": "YYYY-MM-DD or null",
  "valid_from": "YYYY-MM-DD or null",
  "valid_to": "YYYY-MM-DD or null",
  "force_display": "Soviet Air Force",
  "force_original": "VVS",
  "formation": null,
  "location_name_as_reported": null,
  "evidence_status": "recorded | source_compiled | derived | estimated | disputed | missing",
  "source_id": "MAP-xx",
  "citation_location": "file/page/table",
  "reuse_status": "clear | review_required | no_republication"
}
```

**English-facing label:** `Soviet Air Force` in compact labels; on detail pages first occurrence `Soviet Air Forces (VVS)`. PVO, Soviet Naval Aviation and Long-Range Aviation must remain separately identified when statistical populations require it. “Soviet” alone identifies a country/political entity, **not** an air arm or exact reporting population.

## Checks before next phase

- Verify LOC per-item map dates, rights and georeferencing method; do not equate 416 *ground* maps with 416 air-war position records.
- Inspect RAF AHB narrative/map appendices for first **air-specific** map layer, not just land front lines.
- Check original French 1940 table headings and dates before numerically importing the provisional figures above.
- Review licenses and citation conditions for Russian archive web maps and copyrighted deZeng airfield guides.
- Inspect whether a chosen source contains coordinates or just names; resolve historical name changes and duplicated station identifiers before geocoding.
- Revisit this register as sources are evaluated. A source is not “done” merely because its URL is listed.
