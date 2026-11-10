# Reciprocal air-war evidence: campaign and event source audit
Date: 10 November 2026. Applies to public European Air War Atlas `hound83/ww2-airwar`.

## Purpose and honest denominator
Comparing the same war from opposing air forces is a primary Atlas goal, but it cannot be achieved by placing unrelated dates, pilots, claims, aircraft destroyed on the ground, damaged airframes, and operational sorties in one ratio. The new code reports, for **every existing campaign and dated event**, (a) what numeric evidence exists by side, (b) the date and unit class of the observations, (c) whether there are *same-date* figures, and (d) what is missing. No zero is invented. A source citation on the same day is not proof that the counted unit participated in a particular engagement.

This is a research coverage *framework* for all 20 campaigns and 83 events. It is NOT a claim of complete bilateral loss accounting in all 20 theaters.

## Newly recovered official source studies

### Battle of Britain, 18 August 1940 and 26 August–6 September
[RAF Museum, *The Hardest Day*](https://www.rafmuseum.org.uk/our-collection/supporting-research/online-exhibitions/the-hardest-day/) documents **68 RAF/Fleet Air Arm aircraft lost**, **31** of them in air combat (SUBSET), compared with **69 German aircraft destroyed OR damaged beyond repair**. These are the same day but **different loss criteria**; German write-offs are not strictly identical to all British aircraft reported lost. Event added for 18 August in the airfield offensive phase.

[RAF Museum, Battle of Britain Phase Three](https://www.rafmuseum.org.uk/research/online-exhibitions/history-of-the-battle-of-britain/the-battle-of-britain-phase-three) reports RAF **248** aircraft losses and Luftwaffe **322** aircraft losses **26 August–6 September 1940** (reporting-window figures, not each day). No extra losses may be counted by adding these totals to the 18 August totals without respecting overlap and different reporting periods.

Existing complete 10 July–31 October Luftwaffe **1,733** aircraft destroyed and **643** damaged and RAF **2,692 victory claims** are a separate population: [RAF Museum commentary on German archival revision](https://www.rafmuseum.org.uk/blog/citizen-airman-2-ray-holmes/). These are NOT directly a one-to-one actual opposing loss comparison.

### Dieppe/Jubilee, 19 August 1942
[Royal Canadian Air Force, Department of National Defence, Major William March, *In the skies above: Dieppe*](https://www.canada.ca/en/department-national-defence/maple-leaf/rcaf/2019/08/in-the-skies-above-dieppe-august-19-1942.html) explicitly calls approximately **106 Allied aircraft lost** and **48 German aircraft lost** in the 16-hour battle. This is a Canadian official retrospective with the caveat that exact historical totals are debated.

[French Ministry of the Armed Forces, Operation Jubilee](https://www.defense.gouv.fr/chemins-memoire/histoire-memoires/ressources-historiques/seconde-guerre-mondiale/operations-militaires/1941-12) reports **108 Allied aircraft lost** and **48 German aircraft lost**. Do NOT add 106 + 108 or claim that both are exact. The older Atlas's '106 RAF aircraft' label is likely a narrower/ambiguous population than the Canadian's 'Allied aircraft'; pending aircraft-by-aircraft original loss register reconciliation it is retained with a visible ambiguity note. German 48 agrees across these secondary official accounts, but this is NOT independently transcribed German loss books.

### Big Week/Operation Argument, 20–25 February 1944
[USAF Air University History Office, Silvano Wueschner, *Operation Argument (Big Week): The beginning of the end of the German Luftwaffe*, 2019](https://www.airuniversity.af.edu/News/Display/Article/1754049/operation-argument-big-week-the-beginning-of-the-end-of-the-german-luftwaffe/) reports coalition operations of approximately **6,000 sorties**, loss of **357 Allied bombers** and **28 Allied escort fighters**, compared with **262 German fighter losses** and **250 German aircrew killed/wounded**, including **100 pilots**. The pilot count is a SUBSET of the aircrew casualties, not additional. Allied bomber and escort-fighter airframes differ from German fighter-only airframes; these figures do not represent equal aircraft classes.

The Atlas already retains **~4,000 USAAF heavy-bomber sorties** and **more than 200 heavy bombers lost** from another USAF historical page. Those figures have a narrower USAAF / heavy-bomber population and must NOT be added to the broader coalition figures, and should not automatically be interpreted as a contradiction.

## Known previous opposing-return sources retained
- [RAF Air Historical Branch translated captured German original aircraft-loss records](https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/ahb-german-translations/): records for German Reich, Western Front and Mediterranean theaters. Original tables are not yet all independently transcribed.
- [RAF Air Historical Branch, Norway campaign reports](https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/second-world-war-campaign-narratives1/), especially Nos. 263 and 46 Squadron original ORB references; aircraft claimed by RAF are not audited German actual losses.
- [16th Soviet Air Army history, Bobruisk June 1944](https://militera.lib.ru/h/16va/03.html): original-unit-history-based secondary day counts (2,319 serviceable fighters/bombers/attack aircraft, 19 Soviet own losses on 26 June; 13 claimed German aircraft not verified in original German entries).
- Sicily British official histories and contemporaneous HQ Mediterranean Allied Air Forces published returns: German/Italian first-week air losses cannot be compared directly with Allied whole-campaign 10 July–17 August losses.
- All other campaigns retain the previous source-scoped facts. Missing opponent numbers and incomplete sub-event coverage are stated, never filled by interpolation.

## Scope of comparison implementation
Twenty paired campaign evidence panels, and a daily-status panel when each of 83 dated events is selected. Facts are assigned explicitly to reporting sides (75 legacy source observations without a declared side are mapped by their exact historical fact label (not dataset order); 89 new/existing observations carry an explicit reporting side). Opponent claims live with their reporter's figures, not in verified enemy losses. Each selected event shows **same-date observations** separately from **monthly or longer-period context** (the latter may be opened as context but is not counted as that day's losses).

Like-period aircraft loss totals, when both exist, are shown with a warning about differing aircraft classes/causes; the UI never calculates a numerical exchange ratio. Different times, disputed Allied totals and source gaps remain visible. A claim of 'all events compared' means **complete transparent coverage classification**, not **complete paired loss figures**.

## Remaining primary research to do
- Transcribe and independently validate Luftwaffe Gen.Qu. original aircraft-loss ledgers, including fighter/bomber, damaged/total write-off, cause and unit, for matched theater periods.
- RAF squadron AIR 27 Form 540 and 541 and Fighter Command daily returns; U.S. Army Air Forces squadron mission reports; Soviet TsAMO / VVS own-loss and readiness diaries.
- Confirm French vs Canadian Dieppe 106/108 and older RAF 106 unit inclusion by individual airframe; secure verified German opponent counterpart.
- Distinguish the British Battle of Britain claims vs German German Quartermaster losses, and fit German 18 August beyond-repair aircraft to RAF lost definitions.
- Germany's Eastern Front 1941 and 1944 daily losses and Soviet operational air army serviceability are still incomplete. No impossible daily fighter ratios are generated.


## Additional reciprocal evidence incorporated during the same milestone

### Poland 1939: German and Polish order-of-battle and aircraft losses
**USAF Office of Air Force History**, John F. Kreis, *Air Warfare and Air Base Air Defense, 1914–1973* (1988), printed Tables 1 and 2, pp. 59–60:
https://media.defense.gov/2010/Sep/22/2001330044/-1/-1/0/AFD-100922-032.pdf
The accessible official PDF text includes these original tables citing the British Air Ministry translation of captured German original report VII/33 (*The Luftwaffe in Poland*), Sikorski Institute and Kurowski Polish records:
- Polish aircraft in operational units **397** and separate training/reserve planes **348**; the operational-unit total is NOT demonstrated serviceability, and it differs from the older rounded RAF estimate 300 due to reporting definition.
- German Luftflotte 1 **824** serviceable + Luftflotte 4 **676** serviceable = **1,500**. German other-force aircraft such as home defence and army units are excluded. The 824 and 676 are non-additive SUBSETS of the 1,500 in Atlas.
- German 1–28 September aircraft lost **285**: 63 reconnaissance + 67 single-engine fighters + 12 twin-engine fighters + 78 bombers + 31 dive bombers + 12 transports + 22 miscellaneous. **279** additional aircraft were damaged >10% yet repairable: NOT written-off aircraft.
- Polish aircraft lost on operations **333**, including Bomber Brigade **82** as a subset; **116** serviceable Polish planes escaped and were interned in Romania, not counted as enemy-destroyed by default. The older RAF Museum figure **114** is not directly reconcilable to 333 without an explicit underlying aircraft-class and loss-definition audit. Do not average these values or add them as independent losses.

### Norway 1940: competing German loss totals
**Deutsches Historisches Museum** LeMO *Besetzung von Norwegen 1940* https://www.dhm.de/lemo/kapitel/der-zweite-weltkrieg/kriegsverlauf/besetzung-von-norwegen-1940: German Luftwaffe **242** aircraft lost in Norway; secondary official national museum.
**Colin S. Gray**, *Airpower for Strategic Effect*, Air University Press (2012), p. 128, https://www.airuniversity.af.edu/Portals/10/AUPress/Books/B_0122_GRAY_AIRPOWER_STRATEGIC_EFFECT.PDF: **260** German planes and **169** British aircraft lost by a possibly different campaign definition. The 242 and 260 are **contradictory alternatives**, not additional separate losses. Only the two German source values have been entered until the RAF/FAA 169-reporting population is independently reconciled with original Norwegian campaign claims and individual ship/airfield losses.

### France and Low Countries 1940: German destruction versus RAF fighter losses
**USAF historian Williamson Murray, chapter 2** in Benjamin F. Cooling, *Case Studies in the Achievement of Air Superiority* (1994), Table 2-1, pp.85–86:
https://www.govinfo.gov/content/pkg/GOVPUB-D301-PURL-LPS47633/pdf/GOVPUB-D301-PURL-LPS47633.pdf
This gives **1,428 Luftwaffe aircraft destroyed** across all aircraft types in May–June and **474 RAF fighters** lost in the wider France campaign. The German 1,428 consists of 1,345 destroyed on operations and 83 destroyed not on operations. The German all-types figure and RAF fighter-only losses are **not a matched cross-side exchange ratio**.
For German aircraft **488 damaged**, the primary archival compilation is reproduced in **Williamson Murray, *Strategy for Defeat*, Table III, p.40**: https://www.airuniversity.af.edu/Portals/10/AUPress/Books/B_0012_MURRAY_STRATEGY_FOR_DEFEAT.pdf . This is explicitly a damaged count, not another 488 destroyed. The PDF's optical transcription of category subheadings has some apparent inconsistencies; do not derive damaged type splits from it without checking the original image or alternative copy.

### Stalingrad airlift, late 1942–early 1943
Air & Space Forces, *Turning Point at Stalingrad*: https://www.airandspaceforces.com/article/turning-point-at-stalingrad/
Reports **266 Ju 52** and **165 He 111** German aircraft lost in the airlift. These are two German type-level subpopulations during the wider airlift and are not a complete Luftwaffe theater total. No independently verified Soviet aircraft-loss counterpart was found in this run, so this remains a one-sided airframe loss ledger.

### Operation Market Garden, September 1944
**RAF Museum**, Chapter 4 https://www.rafmuseum.org.uk/blog/the-royal-air-force-and-operation-market-garden-chapter-4/ records **9 RAF resupply transports lost on 20 September** and **23 on 21 September**. Their original daily conditions differ: 20 Sep 162 dispatches, 152 drops, captured landing zones; 21 Sep 117 dispatches and 91 reported drops. The day losses are INCLUDED in later whole-campaign returns, not additive new campaign casualties.
RAF Museum Chapter 6 https://www.rafmuseum.org.uk/blog/the-royal-air-force-and-operation-market-garden-chapter-6/ gives **125 Allied aircraft lost** over the overall support effort and **160 enemy aircraft CLAIMED destroyed**. The earlier 57 RAF Transport Command aircraft losses are a subset or different command window, NOT another 57 aircraft in addition to 125. German original losses missing, so the 160 claims cannot become an Axis loss figure.

### Spanish Civil War, Republican aircraft supplied (not operational strength)
The original USAF-published history *Case Studies in the Achievement of Air Superiority*, Soviet/Republican Spain section, reports approximately **1,500 Soviet aircraft cumulatively delivered** during the civil war: https://www.govinfo.gov/content/pkg/GOVPUB-D301-PURL-LPS47633/pdf/GOVPUB-D301-PURL-LPS47633.pdf . This is a cumulative delivered population, not simultaneously serviceable Republican fighter strength and not Republican losses. It is the first recorded Republican-side aircraft quantitative observation in the Spain dossier.

### Reich Defence March 1944 and Schweinfurt October 1943
**USAF historian Richard Davis**, *Bombing the European Axis Powers* (March 1944 section): https://media.defense.gov/2025/Jun/10/2003736234/-1/-1/0/DAVIS_BOMBING_EUROPEAN.PDF : **349 Eighth Air Force heavy bombers written off in March 1944**. The existing **662 Luftflotte Reich aircraft destroyed** also relates to March, but one source is Eighth USAAF heavy bombers across targets and the other German command all types; overlapping month alone is NOT evidence that their geographic or aircraft populations match.

**National WWII Museum**, *Black Thursday, 14 October 1943*: https://www.nationalww2museum.org/war/articles/black-thursday-october-14-1943-second-schweinfurt-bombing-raid, citing German records: **31 German fighters destroyed**, **12 written off**, **34 damaged**. This allows comparison to **60 Eighth Air Force B-17s shot down on 14 October**, not a fighter-to-fighter causal kill ratio. Whether 12 extra written-offs are mutually exclusive of the 31 destroyed is not established from the online summary, so no arithmetic summing those categories is used.

### Archival verification and presentation rules
The USAF Poland tables and France Table 2-1 were checked in the accessible digitized PDF extracted text, including explicit type subdivisions and footnote source trails. The PDF page screenshot provider could not fetch the scan on attempt, so original pixel-level independent table inspection remains unverified. The 488 German damaged France figure was cross-checked in Murray's separate Table III and an independent USAF historical account. All derived sum checks are regression-tested. Conflicting sources are labelled alternate estimates or incomplete rather than interpolated.

**Coverage after all research:** 20/20 campaign coverage panels, 16/20 campaigns with at least one numeric observation on BOTH sides, and all 83 dated event panels show day-level evidence status. Only 9 event dates currently have same-date quantitative observations from both reporting sides; that is a genuine remaining archival coverage gap, not a UI failure.
