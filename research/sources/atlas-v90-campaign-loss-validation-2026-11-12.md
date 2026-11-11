# Campaign claims, losses and estimate validation

## Battle of Britain

The campaign ran from 10 July through 31 October 1940. The Atlas compares 17 reporting weeks and five phases across all 114 days. The two source series each give 1,733 German aircraft destroyed. The weekly publication gives 2,698 British claims, including anti-aircraft guns and balloons, and the postwar phase comparison gives 2,692 RAF claims. The phase loss total includes all causes. The sources use separate accounting definitions, and each display uses its published denominator. The first and last weeks are partial. [Full source reconciliation and machine-readable transcription](atlas-battle-of-britain-claims-over-campaign-2026-11-11.md).

The reverse direction shows 3,058 Luftwaffe claims and 915 RAF fighter losses at campaign scale, together with seven dated comparisons from a separate study. The dated comparisons have 444 claims and 144 RAF losses in total. A consistent German weekly or phase claim series is needed to validate a weekly or phase model in this direction. The seven intensive RAF days are available as a selected-raid calculator, with their own dates and sources.

## Normandy, 1–18 July 1944

The RAF Air Historical Branch narrative gives 18 daily comparisons. It reports 355 German losses against 329 Allied aircraft-destruction claims and 312 Allied losses against 314 German claims. The Allied claim total shown here excludes 17 additional ground-gunner claims recorded separately for the period. The narrative includes several Allied air forces, day and night activity and losses from multiple causes. The forecasts target the aggregate loss counts in that publication. [RAF Air Historical Branch, Liberation of North-West Europe, vol. IV, ch. 3, pp. 31–32](https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/second-world-war-campaign-narratives/liberation-of-north-west-europe-vol-iv-the-breakout-and-advance-to-the-lower-rhine-12-jun-30-sep-1944/) · [Daily source audit](atlas-v891-normandy-claims-audit-2026-11-11.md).

## Whole-period checks

Each fold withholds the complete loss outcome for one week, phase or day. The remaining periods select the method with lower mean absolute error in their own leave-one-period-out checks. The claims-only method multiplies claims by the training losses divided by training claims. The second method fits losses per day to claims per day, weighting by period length and constraining the intercept and slope to be nonnegative. The fitted count is the duration times the intercept plus claims times the slope. A zero-claim training set uses its recorded loss rate per day. Ties favor the claims-only method. Each published reporting series trains independently.

For each withheld period, the range uses the nearest-rank 80th percentile of the chosen method’s inner absolute errors per day, multiplied by the held-out duration. Round that margin up to whole aircraft and use zero as the lower limit if needed. Both the estimate and its range are independent of that period’s recorded loss count. The errors and coverage below are retrospective and use other periods in the same campaign, including later periods. Coverage is measured on the shown checks.

| Series | Complete held-out periods | Average absolute miss | Claims-only miss | Worst miss | Recorded totals inside range |
| --- | ---: | ---: | ---: | ---: | ---: |
| Battle of Britain, British weekly claims | 17 | 16.5 | 30.0 | 36 | 14 of 17 |
| Battle of Britain, RAF phase claims | 5 | 59.2 | 114.4 | 103 | 3 of 5 |
| Normandy, Allied claims and German losses | 18 | 9.8 | 9.8 | 29 | 14 of 18 |
| Normandy, German claims and Allied losses | 18 | 8.4 | 10.4 | 30 | 14 of 18 |

For example, the 15–21 September weekly check predicts 153 German losses with a range of 131–175. The source records 120. The test exposes the miss and retains the recorded figure. The five British phase checks show particular uncertainty at that larger scale. A new range should use a comparable date window, reporting population and accounting definition. Recorded loss totals take precedence. An independent inventory can constrain a range when it covers the same losses. [Inventory method and Bobruisk reconciliation](atlas-aircraft-inventory-loss-ceilings-2026-11-11.md).

## Cobra source check, 25 July 1944

The captured Luftflotte 3 situation report covers the American attacks west of St-Lô, British attacks around Abbeville, and German night operations. The air situation spans a wider set of engagements than the Mission 494 escorts. The separate Luftflotte 3 cause-of-loss return has columns for air combat, missing aircraft, antiaircraft fire, ground losses and other causes. Its 25 July page is inverted and the OCR scatters the figures across the columns. It groups aircraft by type, so mission-specific attribution still requires airframe or unit records tied to the US escort encounters. The 10 losses in the German calendar cover its own wider daily scope. The Cobra calculator displays its existing low-confidence estimate of about eight with the 7–9 sensitivity to selected engagements and links the additional German reports. [Luftflotte 3 situation reports, translation 127, pp. 31–33](https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/ahb-translations-from-captured-german-documents/situation-reports-issued-by-luftflotte-3-france-july-1944/) · [Luftflotte 3 aircraft losses, translation 144, PDF p. 22](https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/ahb-translations-from-captured-german-documents/luftwaffe-losses-on-the-western-front-luftflotte-3-1st-july-31st-august-1944/#page=22) · [German calendar, translation 84, pp. 44–45](https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/ahb-translations-from-captured-german-documents/calendar-of-operations-in-north-west-europe-july-1944/#page=46).
