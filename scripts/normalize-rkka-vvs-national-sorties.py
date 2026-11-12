#!/usr/bin/env python3
"""Cross-audit Soviet VVS KA national mission sorties by year and period.

Known original source disagreement is documented instead of averaged:
Part 06_02 2,904,778; 06_03 2,904,777; 06_07 1944 817,047.
"""
import json
import re
from pathlib import Path

root=Path(__file__).resolve().parents[1]/"research/transcriptions"
input_dir=root/"rkka-operations-06"


def rows(n):
    file=json.loads((input_dir/f"rkka-operations-06-{n:02d}.json").read_text())
    return file["sourceUrl"],file["tables"][0]["rows"]


def number(text):
    text=text.strip().replace("\u00a0", "")
    return int(text.replace(" ","")) if re.fullmatch(r"\d[\d\s]*",text) else None


url_annual,rows_annual=rows(3)
annual=[]
for row in rows_annual[2:]:
    cells=[x["value"] for x in row["cells"]]
    if len(cells)!=13:
        continue
    values=[number(cells[k]) for k in [1,3,5,7,9,11]]
    annual.append({"sourceRow":row["sourceRow"],"missionAsPrinted":cells[0],
                   "calendarYearSorties":dict(zip(["1941_from_June22","1942","1943","1944","1945_to_May9"],values[:5])),
                   "publishedGrandTotal":values[5],
                   "publishedPercentByYear":dict(zip(["1941_from_June22","1942","1943","1944","1945_to_May9","all"],[cells[k] for k in [2,4,6,8,10,12]]))})

url_period,rows_period=rows(2)
period=[]
for row in rows_period[3:]:
    cells=[x["value"] for x in row["cells"]]
    if len(cells)!=9:
        continue
    values=[number(cells[k]) for k in [1,3,5,7]]
    period.append({"sourceRow":row["sourceRow"],"missionAsPrinted":cells[0],
                   "strategicPeriodSorties":dict(zip(["1941-06-22_to_1942-11-18", "1942-11-19_to_1943-12-31",
                                                      "1944-01-01_to_1945-05-09"],values[:3])),
                   "publishedGrandTotal":values[3]})

ann_total=next(x for x in annual if x["missionAsPrinted"].strip().lower()=="total")
period_total=next(x for x in period if x["missionAsPrinted"].strip().lower()=="total")
assert ann_total["publishedGrandTotal"]==2904777
assert period_total["publishedGrandTotal"]==2904778
assert ann_total["calendarYearSorties"]["1944"]==817064
by_army_1944=json.loads((root/"rkka-vvs-air-army-sorties-by-mission-1944.json").read_text())
assert by_army_1944["printedTotals"]["totalSorties"]==817047

period_by_grand={x["missionAsPrinted"].strip():x["publishedGrandTotal"] for x in period}
comparisons=[]
for a in annual:
    # Spanish wording sometimes differs, so pair row numbers/ordinal position
    # rather than fusing by translated category strings.
    corresponding=next((p for p in period if p["sourceRow"]==a["sourceRow"]+1),None)
    if corresponding and a["publishedGrandTotal"] is not None and corresponding["publishedGrandTotal"] is not None:
        delta=corresponding["publishedGrandTotal"]-a["publishedGrandTotal"]
        if delta:
            comparisons.append({"missionAsPrintedAnnual":a["missionAsPrinted"],
                                "missionAsPrintedPeriod":corresponding["missionAsPrinted"],
                                "annualSource":a["publishedGrandTotal"],"strategicPeriodSource":corresponding["publishedGrandTotal"],
                                "deltaPeriodMinusAnnual":delta})

out={
    "sourceType":"Soviet archival derived secondary Spanish-language tables",
    "sourceUrlAnnual":url_annual,"sourceUrlStrategicPeriods":url_period,
    "population":"VVS KA (Red Army Air Force) front / air-army sorties 22 June 1941–9 May 1945; excludes separate DA/ADD naval and PVO returns unless original population explicitly includes them",
    "recordType":"combat aircraft sorties, NOT missions/aircraft/crews killed",
    "calendarYearMissionRows":annual,
    "strategicPeriodMissionRows":period,
    "independentOriginalSourceDiscrepancies":{
        "overallPart06_02Minus06_03":period_total["publishedGrandTotal"]-ann_total["publishedGrandTotal"],
        "calendar1944Part06_03MinusPart06_07AirArmy":ann_total["calendarYearSorties"]["1944"]-by_army_1944["printedTotals"]["totalSorties"],
        "sourceNote":"Same website, distinct source summaries; differences of 1 and 17 sorties should not be silently resolved or summed."
    },
    "ordinalAlignedMissionComparisonWarnings":comparisons,
    "cautions":[
        "The annual and strategic-period datasets are alternative views of the same broad VVS KA sortie population, not additive independent outputs.",
        "1941 starts 22 June and 1945 ends 9 May; neither is a full year.",
        "A printed blank is null, not a measured zero; source percentage strings remain as printed.",
        "The 1944 air-army 817,047 and annual 817,064 disagree; further cross-check of original operational staff files is necessary.",
        "Source 06_02 and 06_03 also disagree by one in national grand totals and in attack-on-ground-force class."
    ]
}
(root/"rkka-vvs-ka-combat-sorties-by-year-period-and-mission-1941-1945.json").write_text(json.dumps(out,ensure_ascii=False,indent=2)+"\n")
print("VVS KA",len(annual),"annual mission rows",len(period),"period mission rows; discrepancies",out["independentOriginalSourceDiscrepancies"],"mission order differences",len(comparisons))
