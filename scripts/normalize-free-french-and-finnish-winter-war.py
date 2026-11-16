#!/usr/bin/env python3
"""Specialist unit-level Free French figures and Finnish war-readiness snapshots.

The 40% vs 60% FAFL flight-personnel loss statements, and 353 vs 409
credited aircraft victories, are unresolved dissimilar secondary series.
No interpolation or invented pilot killed classifications is permitted.
"""
import json
from pathlib import Path

OUT=Path(__file__).resolve().parents[1]/"research/transcriptions/free-french-units-and-finnish-winter-war-strength-losses-1939-1945.json"
french_units=[
 {"unit":"GC_1_Alsace_RAF_341","founded":"1941-09-01","reportedCombatMissions":4500,"combatFlyingHours":9000,
  "accreditedEnemyAircraftDestroyedClaims":67,"probableClaims":16,"enemyAircraftDamagedClaims":14,
  "cumulativePilotsEngaged":108,"pilotsKilledOrMissing":30,
  "sourceNote":"No surviving written records for first Libyan campaign 1942; reports say archive ship torpedoed. Figures may be incomplete or reconstructed."},
 {"unit":"GC_2_Ile_de_France_RAF_340","founded":"1941-10-20","reportedCombatMissions":7485,"combatFlyingHours":10072,
  "accreditedEnemyAircraftDestroyedClaims":69,"probableClaims":6,"enemyAircraftDamagedClaims":35,
  "cumulativePilotsEngaged":87,"pilotsKilledOrMissing":37},
 {"unit":"GC_3_Normandie_Niemen_Soviet_Eastern_Front","founded":"1942-09-01","reportedCombatMissions":5240,"combatFlyingHours":4354,
  "reportedAirCombats":869,"accreditedEnemyAircraftDestroyedClaims":273,"probableClaims":37,"enemyAircraftDamagedClaims":47,
  "cumulativePilotsEngaged":96,"pilotsKilledOrMissing":42}
]
assert sum(r["accreditedEnemyAircraftDestroyedClaims"] for r in french_units)==409
assert sum(r["reportedCombatMissions"] for r in french_units)==17225
finnish=[
 ("1939-11-30",119,8,111),
 ("1939-12-31",110,9,101),
 ("1940-02-01",122,10,112),
 ("1940-03-01",153,36,117),
 ("1940-03-15",166,38,128)
]
assert all(a-b==c for _,a,b,c in finnish)

result={
 "researchOnly":True,
 "freeFrenchFighterGroups":{
  "sourceUrl":"https://memorial-normandie-niemen.fr/accueil/les-victoires-et-les-pertes/",
  "sourceClass":"Normandie-Niémen commemorative museum archival compilation, secondary, refers to FAFL French fighter groups and RAF/Soviet service",
  "groupRecords":french_units,
  "groupDerivedSumOfClaimedDestroyed":409,
  "groupDerivedSumOfCombatMissions":17225,
  "separateFAFLCollectiveSourceObservations":{
    "memorialFAFLRegistrantsThrough1943":4850,
    "memorialAllFAFLWartimeReportedDead":500,
    "memorialAllFAFLWartimePrisoners":152,
    "memorialReportedNavAircrewDisappearedPercent":40,
    "memorialReportedWarMissionsAllUnits":30000,
    "memorialReportedHomologatedFighterClaims1941toMay1945":409,
    "frenchMinistryOfDefenceFoundationNarrativeReportedClaims":353,
    "frenchMinistryOfDefenceFoundationNarrativeNavAircrewDisappearedPercent":60
  },
  "conflictsAndCautions":[
   "The Memorial's 409 credited victories is 67+69+273 among its three fighter group histories. French Ministry of Defence reproduces Foundation Free France total 353. Resolve force/period/claims-approval definitions; both are reporting claims, never confirmed German losses.",
   "Memorial publishes 40% aircrew 'disappeared', Ministry reproduces 60%. Definitions/time window are not matched. The 500 dead and 152 prisoners in one museum account are not pilot-only casualties.",
   "FAFL organizational legal end date is July or August 1943; units continue fighting and are attributed to RAF/Soviet operations after formal merger. Host force statistics overlap.",
   "French 30,000 cumulative missions include units beyond just the three fighter groups. Their 17,225 missions cannot be considered all FAFL combat output.",
   "Three distinct role fates: killed or missing not guaranteed killed; probable and damaged claims kept separate from credited destruction."
  ],
  "crossReferenceUrls":["https://www.defense.gouv.fr/chemins-memoire/histoire-memoires/ressources-historiques/seconde-guerre-mondiale/resister/france-libre/forces-0",
    "https://www.ordredelaliberation.fr/en/french-air-force"]
 },
 "finnishWinterWar":{
  "sourceUrl":"https://www.oocities.org/finnmilpge/fmp_faf39_40.html",
  "sourceClass":"Specialist secondary historical summary attributed to Atso Haapanen and original Finnish squadron daily readiness reports",
  "period":{"from":"1939-11-30","through":"1940-03-13"},
  "datedCombatAircraftUnitReadiness":[{"date":d,"combatAircraftInUnits":a,"underRepairOrOverhaulInUnits":b,"workingCombatAircraftInUnits":c} for d,a,b,c in finnish],
  "allAircraftSnapshotsIncludingTrainingReserveStorage":{
    "1939-12-01":{"allAircraftOnBooks":301,"allAircraftServiceable":220,"allAircraftUnavailable":81,
        "combatAircraftServiceable":114,"trainingLiaisonServiceable":106,"combatAircraftUnavailable":31,"trainerLiaisonUnavailable":50},
    "1940-03-15":{"allAircraftOnBooks":409,"allAircraftServiceable":225,"allAircraftUnavailable":184}
  },
  "reportedWinterWarCombatAircraftWrittenOffAllCauses":58,
  "contradictingSecondaryReportedAllAircraftLosses":62,
  "otherReportedWinterWarOperationalSortiesFromAcademicStudy":5993,
  "otherSourceUrl":"https://ndl.ethernet.edu.et/bitstream/123456789/70320/1/34.pdf.pdf",
  "cautions":[
   "Five dated snapshots are COMBAT AIRCRAFT IN FLYING UNITS, excluding liaison/trainer and stocks at depots. All-plane 301/409 are differently defined and not comparable to the unit combat-only rows.",
   "58 refers writeoffs of combat planes for all reasons; secondary academic 62 refers a separately classified aircraft loss tally. Do not silently choose one as authoritative.",
   "March 15 snapshot is two days AFTER the 13 March peace; do not report as wartime stock on 13 March.",
   "Finnish Navy aviation also operated LLv 36 under naval staff; must validate whether included in combat strength source.",
   "The 5,993 sortie figure is a *different* secondary source and should be verified against contemporary Finnish operations logs."
  ]
 }
}
OUT.write_text(json.dumps(result,indent=2,ensure_ascii=False)+"\n")
print("Three Free French fighter unit numerical histories plus 5 Finnish combat-readiness snapshots; 1940 and FAFL conflicts retained")
