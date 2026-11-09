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
Twenty paired campaign evidence panels, and a daily-status panel when each of 83 dated events is selected. Facts are assigned explicitly to reporting sides (the 69 older records without a declared side are classified in a reviewed per-campaign registry; the 72 records with a declared side keep their declared source side). Opponent claims live with their reporter's figures, not in verified enemy losses. Each selected event shows **same-date observations** separately from **monthly or longer-period context** (the latter may be opened as context but is not counted as that day's losses).

Like-period aircraft loss totals, when both exist, are shown with a warning about differing aircraft classes/causes; the UI never calculates a numerical exchange ratio. Different times, disputed Allied totals and source gaps remain visible. A claim of 'all events compared' means **complete transparent coverage classification**, not **complete paired loss figures**.

## Remaining primary research to do
- Transcribe and independently validate Luftwaffe Gen.Qu. original aircraft-loss ledgers, including fighter/bomber, damaged/total write-off, cause and unit, for matched theater periods.
- RAF squadron AIR 27 Form 540 and 541 and Fighter Command daily returns; U.S. Army Air Forces squadron mission reports; Soviet TsAMO / VVS own-loss and readiness diaries.
- Confirm French vs Canadian Dieppe 106/108 and older RAF 106 unit inclusion by individual airframe; secure verified German opponent counterpart.
- Distinguish the British Battle of Britain claims vs German German Quartermaster losses, and fit German 18 August beyond-repair aircraft to RAF lost definitions.
- Germany's Eastern Front 1941 and 1944 daily losses and Soviet operational air army serviceability are still incomplete. No impossible daily fighter ratios are generated.
