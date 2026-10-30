#!/usr/bin/env python3
"""Transcribe *separate* Soviet air-service human casualty universes.

The RKKA Spanish archive site reproduces Krivosheev's command-personnel
casualty table alongside a combat-aviator loss breakdown. The two populations
must never be added; neither is an aircraft-loss or victory-claims statistic.
"""
import json
from pathlib import Path

SOURCE = "https://www.rkka.es/Estadisticas/Bajas_del_personal_VVS/000_Bajas_del_personal.htm"
OUT = Path(__file__).resolve().parents[1] / "research/transcriptions/rkka-vvs-human-casualty-distinct-populations-1941-1945.json"

# Source order, Russian officer/staff positions translated from source Spanish.
# Killed also includes deaths for miscellaneous causes on the ground, not
# exclusively combat, according to the source's explicit footnote (1).
command_staff = [
    ("air_corps_division_regiment_commanders_and_deputies",464,294),
    ("air_squadron_commanders_and_deputies",1946,2110),
    ("flight_group_zveno_commanders",2792,2587),
    ("aircraft_commanders_and_pilots",7855,10609),
    ("aerial_gunnery_service_leaders",154,181),
    ("division_and_regiment_navigators",51,118),
    ("squadron_navigators_and_political_deputies",258,320),
    ("zveno_navigators",729,878),
    ("gunnery_and_squadron_communications_leaders",44,74),
    ("observer_pilots_gunners_and_bombardiers",1715,2659),
    ("headquarters_chiefs_and_deputies",58,17),
    ("operations_and_reconnaissance_staff_leaders",60,17),
    ("communications_chemical_service_staff_leaders",73,57),
    ("adjutants",32,14),
]
command_records=[{"categoryTranslation":name,"diedAllCauses":died,"missing":missing,"publishedCategoryTotal":died+missing}
                 for name,died,missing in command_staff]
assert sum(x["diedAllCauses"] for x in command_records)==16231
assert sum(x["missing"] for x in command_records)==19935
assert sum(x["publishedCategoryTotal"] for x in command_records)==36166

# Do not equate this with the 18,464 'aircraft commanders and pilots' row.
# Source calls each role a 'piloto', but bomber/attack operations involved
# multi-person crews; denominator ambiguity remains unresolved.
combat_aviator = [
    ("ground_attack_il2",7837),
    ("fighter",11874),
    ("bomber",6613),
    ("reconnaissance",587),
    ("auxiliary_aviation",689),
]
assert sum(x[1] for x in combat_aviator)==27600
result={
  "researchOnly":True,
  "sourceUrl":SOURCE,
  "sourceClass":"Secondary Spanish transcription of declassified Russian wartime personnel-loss archive/Krivosheev commission",
  "period":"Great Patriotic War 1941–1945, original source's inclusion and force boundaries apply",
  "commandStaffKilledMissingAllCauses":{
    "metricDescription":"Command, officer and specialist categories: killed (including noncombat and on-ground causes), and missing",
    "personnelCategories":command_records,
    "publishedKilledAllCauses":16231,"publishedMissing":19935,"publishedKilledPlusMissing":36166,
    "warning":"These are selected command/staff specialties, NOT necessarily every VVS serviceman or all flying personnel; missing does not mean proven dead. Source footnote includes deaths in air and on ground from all causes."
  },
  "separatelyReportedCombatAviatorLosses":{
    "metricDescription":"The source separately reports '27,600 combat losses' partitioned by type of air operations",
    "categories":[{"role":role,"reportedCombatCasualties":n} for role,n in combat_aviator],
    "publishedTotal":27600,
    "warning":"Cannot reconcile persons and service coverage to the 36,166 command-staff killed/missing table. 'Pilots' may be used loosely for multi-crew airmen. Do not add tables together."
  },
  "dataQualityNotes":[
    "Do not infer killed-versus-missing for the separate 27,600 aviation-role statistic; the source does not split them.",
    "The 36,166 category table is killed/missing from all causes, while 27,600 is combat-only, so their scopes are different.",
    "No annual, unit, front, or aircraft-model detail is supplied by this source; such breakdowns must remain unknown.",
    "Needs checking against the full Russian Krivosheev source for unit definitions and whether separate air forces are included."
  ]
}
OUT.write_text(json.dumps(result,indent=2,ensure_ascii=False)+"\n")
print("Soviet human casualties: 14 staff categories, 5 separate combat-aviator categories; independent totals reconcile")
