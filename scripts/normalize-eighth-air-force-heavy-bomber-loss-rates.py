#!/usr/bin/env python3
"""Transcribe official USAAF historical studies of 8th AF monthly sortie-loss rates.

These are 8th Air Force *credit sorties*, not entire USAAF ETO sorties and not
all losses in 8th AF; the bomber numerator includes MIA and Cat. E writeoffs.
"""
import json
from pathlib import Path

months_1942 = ["08", "09", "10", "11", "12"]
months_1943 = [f"{x:02d}" for x in range(1, 13)]
months_1944 = [f"{x:02d}" for x in range(1, 13)]
rates = {
    "1942": {"months": months_1942, "bomber": [0.0,1.9,4.5,2.9,5.8],
             "fighter": [0.9,0.0,0.5,0.5,0.0]},
    "1943": {"months": months_1943, "bomber": [7.5,8.1,3.2,7.8,5.4,6.4,5.5,6.0,3.9,9.2,3.9,3.6],
             "fighter": [1.7,1.1,0.8,1.2,0.6,0.5,0.6,0.5,0.5,0.5,1.6,0.8]},
    "1944": {"months": months_1944, "bomber": [3.8,3.5,3.3,3.6,2.2,1.1,1.5,1.5,2.2,1.1,2.2,1.2],
             "fighter": [1.1,1.1,1.6,1.3,1.4,1.0,0.9,1.5,1.9,1.0,1.8,1.2]},
}
credit_sorties_1943 = [279,298,716,373,1340,1447,2334,2058,2561,2159,2916,5618]
lost_mia_category_e_1943 = [21,24,23,29,73,93,128,124,101,198,114,200]
records, discrepancies = [], []
for year, data in rates.items():
    for i, month in enumerate(data["months"]):
        rec = {"month": f"{year}-{month}", "eighthAfHeavyBomberPercentOfCreditSortiesLost": data["bomber"][i],
               "eighthAfFighterPercentOfCreditSortiesLost": data["fighter"][i],
               "creditSortiesHeavyBomber": None, "aircraftLostMiaOrCategoryE": None}
        if year == "1943":
            rec["creditSortiesHeavyBomber"] = credit_sorties_1943[i]
            rec["aircraftLostMiaOrCategoryE"] = lost_mia_category_e_1943[i]
            calculated = round(100 * lost_mia_category_e_1943[i] / credit_sorties_1943[i], 1)
            if calculated != data["bomber"][i]:
                discrepancies.append({"month": rec["month"], "issue": "rounded_rate_mismatch", "reported": data["bomber"][i], "calculated": calculated})
        records.append(rec)
assert len(records) == 29
assert sum(credit_sorties_1943) == 22099
assert sum(lost_mia_category_e_1943) == 1128

out = {
    "sources": [
        {"url": "https://ibiblio.org/hyperwar/AAF/AAF-Luftwaffe/AAF-Luftwaffe-App4.html",
         "title": "Strategy for Defeat: The Luftwaffe 1933–1945, Appendix 4",
         "provenance": "Official USAF historical analysis quoting Statistical Summary of Eighth Air Force Operations, 17 Aug 1942–8 May 1945; printed through December 1944"},
        {"url": "https://www.dafhistory.af.mil/Portals/16/documents/Studies/101-150/AFD-090522-058.pdf",
         "title": "USAF Historical Study, 1943 Eighth AF Heavy Bomber Loss Rates on Combat Operations, Appendix 7",
         "provenance": "Official retrospective 1943 source for actual credited sorties and missing/Category E lost aircraft; independent of later tabulation only as document, data are related"}
    ],
    "theater": "Eighth Air Force only, based in England, operations over Europe",
    "population": "Heavy bomber CREDIT sorties and losses (MIA or Cat E), with parallel fighter CREDIT-sortie loss percentage, August 1942–December 1944",
    "measurementWarnings": [
        "A percent of credit sorties is not percentage of a formation or of on-hand aircraft lost and cannot be multiplied by all-USAAF ETO sorties.",
        "Actual 1943 bomber aircraft losses include missing in action and Category E damaged beyond economical repair; this is not a pilot/crew killed measure.",
        "Fighter figures are independently printed loss percentages; without fighter credit sortie denominators, fighter aircraft counts cannot be inferred.",
        "The original 1942 and 1944 table reports rounded percentages only; do not invent lost aircraft counts for those months.",
        "This is the Eighth Air Force, not RAF, Ninth AF, or Mediterranean Fifteenth AF; do not use it as total American European losses.",
        "Only 1942–44 months actually printed are transcribed; 1945 is absent rather than presumed zero."
    ],
    "monthly": records,
    "reported1943GrandHeavyBomber": {"creditSorties": 22099, "missingAndCategoryEAircraft": 1128, "printedLossRatePercent": 5.1},
    "crossSourceRateDiscrepancies": discrepancies
}
outfile = Path(__file__).resolve().parents[1] / "research/transcriptions/usaaf-eighth-air-force-combat-sortie-loss-rates-monthly-1942-1944.json"
outfile.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n")
print("Eighth AF", len(records), "monthly rate records; 1943", sum(credit_sorties_1943), "credit sorties", sum(lost_mia_category_e_1943), "MIA/CatE", len(discrepancies), "rate discrepancies")
