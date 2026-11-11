# v8.8 aircraft claims and losses

## Battle of Britain, August to September 1940

The [14 May 1947 Parliamentary return](https://hansard.parliament.uk/Commons/1947-05-14/debates/fa295090-0de7-4cfe-bf9a-7cf2739a70b4/RoyalAirForce) pairs RAF destruction claims with German records for seven selected days of intensive fighting. The published destruction category is used as given. Damaged aircraft and the overlapping phase totals stay outside the fit. The model reuses the seven daily rows in the Atlas campaign data.

| Date | RAF claims | German recorded destroyed | Destroyed per 100 claims | Range from the other six days |
| --- | ---: | ---: | ---: | ---: |
| 15 Aug 1940 | 183 | 76 | 41.5 | 55–95 |
| 18 Aug 1940 | 155 | 71 | 45.8 | 46–80 |
| 31 Aug 1940 | 94 | 39 | 41.5 | 28–49 |
| 2 Sep 1940 | 66 | 34 | 51.5 | 19–31 |
| 7 Sep 1940 | 100 | 40 | 40.0 | 30–52 |
| 15 Sep 1940 | 185 | 56 | 30.3 | 66–96 |
| 27 Sep 1940 | 153 | 55 | 35.9 | 46–79 |

The pooled rate is 371 ÷ 936, or 39.6 recorded destructions per 100 claims. Forecasts use the pooled rate from the training days and round to the nearest aircraft. The range uses the lowest and highest daily training rates and rounds outward. The seven whole-day checks cover five records. The pooled point forecast has mean absolute error of 7.7 aircraft. The selected-day sample is small, and its spread describes this cohort. On 15 September the recorded loss remains 56. The earlier three-September-day experiment used only two training days and gave 66–74 for the same held-out day.

## Cobra, 25 July 1944

The estimate covers German aircraft destroyed in air combat attributable to Eighth Air Force Mission 494 escorts on the Cobra support mission. A broader German day report and evidence about other sorties and claims constrain two plausible allocations. The transcribed inputs are in [claims-losses-v88.json](../transcriptions/claims-losses-v88.json).

| Input | Value | Reporting scope and source |
| --- | ---: | --- |
| Mission 494 claims of destruction in the air | 12 | Eighth Air Force escorts over the Cobra support mission, which also covered Ninth Air Force B-26s. The chronology lists 1 probable, 3 damaged and 2 ground claims in separate categories. [Carter and Mueller, 25 July](https://aircrewremembered.com/USAAFCombatOperations/Jul.44.html) · [Original mission report catalogue](https://cgsc.contentdm.oclc.org/digital/collection/p4013coll8/id/4574) |
| Escort aircraft | 483 | Mission 494 P-38s, P-47s and P-51s that provided escort. Used as a sortie proxy. [Carter and Mueller, 25 July](https://aircrewremembered.com/USAAFCombatOperations/Jul.44.html) |
| German aircraft reported lost | 10 | Own losses in the wider North-West Europe daily calendar. The entry includes night and day operations. It supplies no split by cause or opposing unit. [German calendar, RAF AHB translation, pp. 44–45](https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/ahb-translations-from-captured-german-documents/calendar-of-operations-in-north-west-europe-july-1944/#page=46) |
| US and British fighter and fighter-bomber sorties | About 2,500 and 1,400 | German estimates for wider activity that day. Attacks were concentrated around Caen and St-Lô, with sorties farther afield. [Luftflotte 3 situation report, RAF AHB translation, pp. 32–33](https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/ahb-translations-from-captured-german-documents/situation-reports-issued-by-luftflotte-3-france-july-1944/#page=33) |
| Ninth Air Force claims of destruction in the air | 4 | 406th Fighter Group over Lisieux on the same day. The official account also describes Second Tactical Air Force operations and several other Ninth Air Force missions. [Craven and Cate, vol. III, ch. 8, p. 237](https://www.ibiblio.org/hyperwar/AAF/III/AAF-III-8.html) |

The sortie-share scenario allocates 10 × 483 ÷ (2,500 + 1,400) = 1.24 aircraft, assuming equal opportunity per sortie. The claim-share scenario allocates 10 × 12 ÷ (12 + 4) = 7.50, assuming a similar relationship between claims and losses for the two documented claim groups. It leaves other Allied formations out of the allocation. Both calculations treat all ten report entries as candidates. How many belonged to air combat during the escorts' window remains uncertain. The briefing shows **1–8 aircraft**, rounded outward, as a low-confidence sensitivity range. The endpoints describe the chosen assumptions. Losses outside this range remain possible.

The [Luftflotte 3 July–August loss tables](https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/ahb-translations-from-captured-german-documents/luftwaffe-losses-on-the-western-front-luftflotte-3-1st-july-31st-august-1944/) contain daily cause columns. The 25 July scan is inverted and its searchable text loses column positions. A visual transcription and aircraft-level reconciliation would improve the estimate. The [RAF operational narrative, ch. 11](https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/second-world-war-campaign-narratives/liberation-of-north-west-europe-vol-iv-the-breakout-and-advance-to-the-lower-rhine-12-jun-30-sep-1944/) illustrates the same scope problem on 27 July. It gives 23 IX TAC air claims and 19 Luftflotte 3 losses across the West, including ten in night operations. That comparison remains contextual.

The Atlas displays the working range on Cobra’s 25 July map briefing and in the operation evidence. Export stores the range, original claim ID, assumptions and source records under `estimates`, with sourced observations under `observations`. A dated full-coverage observation with `measure: "losses"` and `lossScopeId: "cobra-494-german-air-combat"` takes precedence. Apply that scope ID to complete Mission 494 opponent air-combat destruction coverage. Partial unit tallies remain scoped observations.

## Bagration and the reverse comparison

The [16th Air Army history, ch. 3](https://militera.lib.ru/h/16va/03.html) gives 13 claimed German aircraft shot down in 29 air engagements, 19 Soviet own aircraft lost and 2,950 Soviet sorties on 26 June 1944 on the Bobruisk axis. The 19 describes the claimant's own loss population. A published [Luftflotte 6 order of battle for 26 June](https://www.ww2.dk/Changes%20Log%202019-2020%20Officer%20Career%20Summaries%20%282%29.pdf) is a lead to units' records. The [Jagdwaffe Eastern Front study](https://www.scribd.com/document/699609505/Jagdwaffe-Volume-Five-Section-2-War-in-The-East-1944-1945) discusses eight III./JG 14 Fw 190s lost in air combat on 29 June. That formation and date need their own Soviet comparison. The Cobra and Battle of Britain settings are tied to their own data, and the Eastern case has no scoped loss allocation in this release.

For German claims against US fighters, Caldwell's [JG 26 history](https://electronicsandbooks.com/edt/manual/Publischer/G/German%20Miltary%20WW2/JG%2026-Top%20Guns%20Of%20The%20Luftwaffe%20c20091007%20%5B255%5D.pdf) describes the 25 August 1944 afternoon engagement. II./JG 26 filed 12 P-38 claims, with eight eventually credited by the German Air Ministry. The 474th Fighter Group lost 11 P-38s from two squadrons in a fight involving multiple German formations. This makes 11 a US loss total for the encounter. Attribution to individual Gruppen requires the combat reports. The same-day late-afternoon Mustang combat belongs to a separate engagement.
