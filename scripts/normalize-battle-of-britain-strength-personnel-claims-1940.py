#!/usr/bin/env python3
"""Small, independently checked wartime-facts extraction from 1940 appendices.

Source is Wood/Dempster's secondary historical study, which explicitly cites
the original German Quartermaster General returns and RAF records. Do not
copy the book's pilot roll, unpublished images, or entire reference catalogue.
"""
import json
from pathlib import Path

URL="https://erenow.org/ww/narrow-margin-battle-britain-rise-air-power-1930-1940/21.php"
OUT=Path(__file__).resolve().parents[1]/"research/transcriptions/battle-of-britain-raf-luftwaffe-strength-pilot-losses-victory-claims-1938-1940.json"

# RAF Fighter Command, Appendix 7: week-ending daily averages.
weekly_aircraft=[
 ("1940-06-22",814,565),("1940-06-29",814,587),
 ("1940-07-06",871,644),("1940-07-13",901,666),("1940-07-20",1052,658),("1940-07-27",1052,651),
 ("1940-08-03",1061,708),("1940-08-10",1106,749),("1940-08-17",1113,704),
 ("1940-08-24",1169,758),("1940-08-31",1181,764),
 ("1940-09-07",1161,746),("1940-09-14",1046,725),("1940-09-21",1048,715),
 ("1940-09-28",1048,732),
 ("1940-10-05",1048,734),("1940-10-12",1054,735),("1940-10-19",1056,734),
 ("1940-10-26",1064,747),("1940-11-02",1064,721)
]
weekly_pilots=[
 ("1940-06-15",1456,1094),("1940-06-30",1482,1200),
 ("1940-07-06",1456,1259),("1940-07-13",1456,1341),
 ("1940-07-20",1456,1365),("1940-07-27",1456,1377),
 ("1940-08-03",1588,1434),("1940-08-10",1588,1396),
 ("1940-08-17",1588,1379),("1940-08-24",1588,1377),("1940-08-31",1588,1422),
 ("1940-09-07",1588,1381),("1940-09-14",1662,1492),
 ("1940-09-21",1662,1509),("1940-09-28",1662,1581),
 ("1940-10-05",1714,1703),("1940-10-12",1714,1752),
 ("1940-10-19",1700,1737),("1940-10-26",1727,1735),
 ("1940-11-02",1727,1796)
]
pilot_casualties=[("1940-07",74,49),("1940-08",148,156),("1940-09",159,152),("1940-10",100,65)]
assert sum(n[1] for n in pilot_casualties)==481
assert sum(n[2] for n in pilot_casualties)==422

# RAF combat victory claims versus *actual German QM returns* Appendix 16.
# Parenthesized numbers are NOT missing: propaganda admissions during battle.
claims_actual=[
 ("1940-07-10","1940-08-07",188,192,63,77),
 ("1940-08-08","1940-08-23",755,403,213,127),
 ("1940-08-24","1940-09-06",643,378,243,115),
 ("1940-09-07","1940-09-30",846,435,243,161),
 ("1940-10-01","1940-10-31",260,325,134,163)
]
assert [sum(r[i] for r in claims_actual) for i in (2,3,4,5)] == [2692,1733,896,643]

# Source Appendix 20 distinguishes whole Luftwaffe strength vs only forces
# assigned to operate against Britain as of 10 August 1940.
luftwaffe={
 "1938-09-19_all_flying_units":{
  "fields":["strength","serviceable"],
  "aircraftRoles":{"long_range_recon":[222,111],"close_recon":[289,238],"ground_attack":[195,164],"fighters":[810,717],"bombers":[1235,1019],"dive_bombers":[247,227],"transports":[317,293]},
  "publishedTotalIncludingTransports":[3315,2835]
 },
 "1939-09-02_all_flying_units":{
  "fields":["authorized_establishment","strength","serviceable"],
  "aircraftRoles":{"close_recon_Luftwaffe":[183,190,146],"close_recon_army":[297,285,164],"long_recon_Luftwaffe":[192,297,235],"long_recon_army":[120,115,109],"ground_attack":[39,40,36],"heavy_fighters":[438,408,377],"single_engine_fighters":[811,771,676],"bombers":[1239,1180,1008],"dive_bombers":[381,366,318],"transports":[554,552,540]},
  "publishedTotalIncludingTransports":[4254,4204,3609]
 },
 "1940-05-11_all_flying_units":{
  "fields":["strength","serviceable"],
  "aircraftRoles":{"close_recon":[304,253],"long_recon_army":[153,124],"long_recon_Luftwaffe":[180,105],"ground_attack":[50,45],"heavy_fighters":[355,263],"single_engine_fighters":[1346,1076],"bombers":[1615,1031],"dive_bombers":[414,345],"transports":[408,285]},
  "publishedTotalIncludingTransports":[4825,3527]
 },
 "1940-08-10_operating_against_Britain_ONLY":{
  "fields":["authorized_establishment","strength","serviceable"],
  "aircraftRoles":{"close_recon":[120,95,80],"long_recon":[126,100,71],"fighters":[1011,934,805],"heavy_fighters":[301,289,224],"bombers":[1569,1481,998],"dive_bombers":[348,327,261],"ground_attack":[40,39,31],"coastal":[94,93,80]},
  "publishedTotal":[3609,3358,2550]
 }
}
for date,sample in luftwaffe.items():
    values=list(sample["aircraftRoles"].values())
    got=[sum(row[i] for row in values) for i in range(len(sample["fields"]))]
    published=sample.get("publishedTotalIncludingTransports",sample.get("publishedTotal"))
    sample["calculatedSumOfPublishedAircraftCategories"]=got
    sample["printedTotalMinusCategorySum"]=[a-b for a,b in zip(published,got)]
    # The 19 September 1938 source contradicts itself by 66 serviceable
    # aircraft. Preserve the 2,835 printed, and the 2,769 sum of its rows.
    if date=="1938-09-19_all_flying_units":
        assert sample["printedTotalMinusCategorySum"]==[0,66]
    else:
        assert sample["printedTotalMinusCategorySum"]==[0]*len(got),(date,got)

out={
 "researchOnly":True,"sourceUrl":URL,
 "sourceClass":"Wood/Dempster, The Narrow Margin, secondary compilation citing RAF and original German Generalquartiermeister returns",
 "scope":"Selected source appendices 7, 10, 11, 16 and 20; no copyrighted pilot roster or graphical tables reproduced",
 "rafFighterCommandWeeklyAircraftAvailability":{
   "sourceAppendix":7,"measurement":"Weekly daily average operationally equipped fighter squadron aircraft vs aircraft actually available for sorties",
   "records":[{"weekEnding":d,"nominalInOperationalSquadrons":n,"availableForOperations":a} for d,n,a in weekly_aircraft]},
 "rafFighterCommandPilotEstablishmentAndOnHand":{
   "sourceAppendix":11,"records":[{"date":d,"establishment":e,"onHandPilots":p,"deficiencyOrSurplus":p-e} for d,e,p in weekly_pilots]},
 "rafFighterCommandMonthlyPilotCasualties":{
   "sourceAppendix":10,
   "definition":"Casualties caused by combat, enemy action on ground, and flying accidents; killed/POW/missing not decomposable into death vs captivity",
   "records":[{"month":m,"killedCapturedOrMissing":km,"woundedOrInjured":inj} for m,km,inj in pilot_casualties],
   "publishedTotals":{"killedCapturedOrMissing":481,"woundedOrInjured":422}},
 "germanBattleOfBritainAircraftLossesVersusRafClaims":{
   "sourceAppendix":16,
   "definition":"RAF British claims vs actual German destroyed and damaged aircraft from Luftwaffe Quartermaster General returns; public official admitted figures in a third separate column",
   "records":[{"from":lo,"through":hi,"rafClaimedDestroyedGermanAircraft":c,"germanActuallyDestroyedFromOwnReturns":a,"germanPubliclyAdmittedDestroyedDuringBattle":p,"germanActuallyDamagedFromOwnReturns":d} for lo,hi,c,a,p,d in claims_actual],
   "publishedTotals":{"rafClaimedDestroyedGermanAircraft":2692,"germanActuallyDestroyed":1733,"germanPubliclyAdmittedDestroyed":896,"germanActuallyDamaged":643}},
 "luftwaffeFourStrengthServiceabilitySnapshots":luftwaffe,
 "interpretationCautions":[
   "1940-08-10 Luftwaffe is Battle of Britain force only, not entire Luftwaffe; other three strength snapshots are national.",
   "Luftwaffe 1938/1939/May1940 snapshots have shifting force/type taxonomy; compare serviceability ratios without assuming identical composition.",
   "Luftwaffe September 1938 source printed overall 2,835 serviceable, but its seven printed aircraft-class rows total only 2,769 (66 unexplained difference). Both recorded; do not silently fix.",
   "RAF pilot casualty table contains killed, POW, missing combined. Not all those 481 died.",
   "RAF fighter availability in a week is a daily average and not an aircraft stock independent of the nominal squadron strength.",
   "RAF victory credits in Appendix 16 are overclaims against German own-loss returns; no causal one-to-one reconciliation can be inferred."
 ]}
OUT.write_text(json.dumps(out,indent=2)+"\n")
print("20 RAF aircraft weeks, 20 RAF pilot dates, 4 casualty months, 5 battle-claims periods and 4 German strength snapshots")
