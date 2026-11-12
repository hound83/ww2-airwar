#!/usr/bin/env python3
"""Normalize distinct Soviet air-service sortie/loss/claim universes in RKKA 06.

All input tables are already archived. Claims of enemy aircraft reported by
the Soviet side are NEVER labeled actual German aircraft losses. Pacific
August/September 1945 is segregated from the European Atlas cutoff.
"""
import json
import re
from pathlib import Path

root = Path(__file__).resolve().parents[1] / "research/transcriptions"
source_dir = root / "rkka-operations-06"
file_out = root / "rkka-combined-vmf-pvo-add-missions-losses-claims-1941-1945.json"


def number(cell):
    cell = re.sub(r"\{\d+\}", "", cell).strip().replace("\u00a0", "")
    return int(cell.replace(" ", "")) if re.fullmatch(r"\d[\d\s]*", cell) else None


def load(n):
    p = source_dir / f"rkka-operations-06-{n:02d}.json"
    data = json.loads(p.read_text())
    return data, data["tables"][0]["rows"]


def as_cells(row):
    return [x["value"] for x in row["cells"]]


def normalize_wide_fleets(n):
    data, source_rows = load(n)
    category, records, exceptions = None, [], []
    fleets = ["black_sea", "baltic", "northern"]
    for row in source_rows[3:]:
        cells = as_cells(row)
        if len(cells) == 1:
            category = cells[0].strip()
            continue
        if len(cells) != 23 or cells[0] == "1":
            continue
        values = [number(x) for x in cells[1:]]
        if not cells[0].strip():
            continue
        first_three = []
        for index, wartime_year in enumerate(["1941-06-22_to_1942-06-21",
                                               "1942-06-22_to_1943-06-21",
                                               "1943-06-22_to_1944-06-21"]):
            batch = values[index*4:index*4+4]
            first_three.append({"period": wartime_year, "byFleet": dict(zip(fleets, batch[:3])),
                                "printedTotal": batch[3]})
        final_batch = values[12:17]
        first_three.append({
            "period": "1944-06-22_to_1945-05-09_Europe__with_1945-08_Pacific_column",
            "byFleet": dict(zip(fleets + ["pacific_aug_sep_1945"], final_batch[:4])),
            "printedTotalIncludingPacific": final_batch[4],
            "derivedEuropeanFleetTotal": (final_batch[4] - (final_batch[3] or 0)) if final_batch[4] is not None else None,
        })
        all_fleets = dict(zip(fleets + ["pacific_aug_sep_1945"], values[17:21]))
        grand = values[21]
        derived_euro = grand - (all_fleets["pacific_aug_sep_1945"] or 0) if grand is not None else None
        rec = {
            "sourceRow": row["sourceRow"],
            "sectionAsPrinted": category, "itemAsPrinted": cells[0],
            "isPublishedSubtotal": bool(re.match(r"^(?:total|suma)\s*:", cells[0].strip(), re.I)),
            "periodByFleet": first_three,
            "publishedWarPeriodGrandByFleet": all_fleets,
            "printedAllWarTotalIncludingPacific": grand,
            "derivedEuropeanSubtotalExcludingPacific": derived_euro,
        }
        for p in first_three:
            original_total = p.get("printedTotal", p.get("printedTotalIncludingPacific"))
            if original_total is not None:
                known = [v for v in p["byFleet"].values() if v is not None]
                if sum(known) != original_total:
                    exceptions.append({"sourceRow": row["sourceRow"], "issue": "fleet_period_components", "period": p["period"], "sum": sum(known), "printed": original_total})
        if grand is not None and sum(v for v in all_fleets.values() if v is not None) != grand:
            exceptions.append({"sourceRow": row["sourceRow"], "issue": "war_total_fleet_components", "sum": sum(v for v in all_fleets.values() if v is not None), "printed": grand})
        records.append(rec)
    return {
        "sourceUrl": data["sourceUrl"], "sourceTable": n,
        "metricClass": {14:"Soviet naval aviation sorties by mission",25:"Soviet naval aviation own aircraft losses by type",30:"Soviet naval aviation enemy aircraft CLAIMS",31:"Soviet naval aviation ship damage/destruction CLAIMS"}[n],
        "scope": "Four war-year periods, by Black Sea/Baltic/Northern fleets; source additionally includes Pacific Aug-Sep 1945 outside European cutoff",
        "records": records, "sourceArithmeticDiscrepancies": exceptions
    }


vmf = {str(n): normalize_wide_fleets(n) for n in [14, 25, 30, 31]}

# PVO 06_24. Columns 0–12 are one ordinal/formation and 12 measures. This
# report mixes independently aggregated front/army subtotals with child units.
pvo_source, pvo_rows = load(24)
pvo_records = []
section = None
for row in pvo_rows[3:]:
    cells = as_cells(row)
    if len(cells) == 1:
        section = cells[0]
        continue
    if len(cells) != 13:
        continue
    group = cells[0].strip()
    if not group:
        continue
    values = [number(x) for x in cells[1:]]
    pvo_records.append({
        "sourceRow": row["sourceRow"], "groupingAsPrinted": section,
        "formationAsPrinted": group,
        "aggregationType": ("overall_total" if group.lower().startswith("total ia") else
                            "section_subtotal" if group.lower().startswith("total") else "named_unit_or_formation"),
        "combatSorties": values[0], "nightCombatSorties": values[1],
        "flyingHours": values[2], "nightFlyingHours": values[3],
        "aerialEngagements": values[4], "nightAerialEngagements": values[5],
        "claimedEnemyAircraftShotDown": values[6], "claimedAtNight": values[7],
        "ownAircraftLost": values[8], "cannonAndRocketRoundsExpended": values[9],
        "sortiesPerClaimReported": values[10], "roundsPerClaimReported": values[11]
    })
pvo_total = next(r for r in pvo_records if r["aggregationType"] == "overall_total")
assert pvo_total["combatSorties"] == 269565
assert pvo_total["ownAircraftLost"] == 1588
assert pvo_total["claimedEnemyAircraftShotDown"] == 3930

# Long-range DA/ADD source 06_09 sorties by mission × calendar year,
# and 06_23 losses by aircraft type × year (1941 type breakdown missing).
def normalize_year_rows(n, value_label):
    data, rows = load(n)
    output = []
    for row in rows[2 if n == 9 else 1:]:
        cells = as_cells(row)
        if len(cells) != 7:
            continue
        nums = [number(x) for x in cells[1:]]
        rec = {
            "sourceRow": row["sourceRow"], "itemAsPrinted": cells[0],
            "byYear": dict(zip(["1941", "1942", "1943", "1944", "1945_Jan_May"], nums[:5])),
            "publishedGrandTotal": nums[5],
            "isPublishedTotal": cells[0].strip().lower().startswith("total"),
        }
        # Only compute sum if all year cells unambiguous. In 1941 source 06_23
        # supplies total aircraft losses, but no loss breakdown by model.
        annual = [n for n in nums[:5] if n is not None]
        if len(annual) == 5 and nums[5] is not None and sum(annual) != nums[5]:
            rec["rowYearSumException"] = {"sum":sum(annual), "printed":nums[5]}
        output.append(rec)
    return {"sourceUrl": data["sourceUrl"], "sourceTable": n,
            "metricClass": value_label, "records": output}


add_sorties = normalize_year_rows(9, "Long-range aviation sorties BY MISSION, not aircraft or crew deaths")
add_losses = normalize_year_rows(23, "Long-range aviation combat aircraft losses BY AIRCRAFT MODEL")
assert next(r for r in add_sorties["records"] if r["isPublishedTotal"])["publishedGrandTotal"] == 219788
assert next(r for r in add_losses["records"] if r["isPublishedTotal"])["publishedGrandTotal"] == 2776

# The PVO methods table 06_13 independently prints 269,465 sorties, while
# the PVO unit table 06_24 prints 269,565, a discrepancy of precisely 100.
pvo_methods_source, pvo_methods_rows = load(13)
pvo_methods = []
for row in pvo_methods_rows[2:]:
    cells = as_cells(row)
    if len(cells) != 7:
        continue  # skip rows of percentages, not to be combined with counts
    values = [number(x) for x in cells[1:]]
    pvo_methods.append({"sourceRow":row["sourceRow"], "methodAsPrinted":cells[0],
                        "byYear":dict(zip(["1941", "1942", "1943", "1944", "1945"], values[:5])),
                        "total":values[5]})
pvo_methods_total = next(r for r in pvo_methods if r["methodAsPrinted"].lower() == "total")
assert pvo_methods_total["total"] == 269465

out = {
    "sourceClass": "Soviet archival references, Spanish secondary republication (RKKA.es part 06)",
    "researchOnly": True,
    "chronologyCaveat": "Many VMF source headings end 9May1945 but incorporate explicit Pacific naval aviation Aug-Sep1945 columns; these are isolated and excluded from derived European totals.",
    "measurementCautions": [
        "VVS KA, PVO, DA/ADD and VMF are overlapping historically restructured Soviet armed services and cannot be blindly summed.",
        "Soviet reports of enemy aircraft shot down and naval targets destroyed are reporting-side CLAIMS, not cross-verified German losses.",
        "Published PVO front/army subtotals and their child units overlap; do not add both.",
        "The source 06_24 PVO 269,565 sorties conflicts by 100 with 06_13 PVO 269,465; both original totals are retained.",
        "The original 06_25 VMF aircraft-loss report excludes economy/wear writeoffs, and includes Pacific August–September 1945 aircraft in grand totals.",
        "ADD 1941 aggregate 1,150 aircraft lost has NO aircraft-model breakdown, unlike 1942–45; blank type-year cells are unknown, not zero.",
        "Bomb sorties, aircraft losses, enemy claims, human casualties and aircraft strength are separate denominators."
    ],
    "vmfWideFleetTables": vmf,
    "pvoFighterOperationsByUnit": {"sourceUrl":pvo_source["sourceUrl"], "records":pvo_records,
                                  "printedOverall":pvo_total,
                                  "publishedOwnAircraftLossesByCalendarYearFromFootnote2":{"1941_Jun_Dec":662,"1942":513,"1943":278,"1944":131,"1945_Jan_May":4}},
    "pvoFighterSortiesByActionMethod": {"sourceUrl":pvo_methods_source["sourceUrl"], "records":pvo_methods,
                                      "printedOverall":pvo_methods_total},
    "pvoIndependentTableTotalDiscrepancy": 100,
    "longRangeADDCombatSortiesByMissionAndYear": add_sorties,
    "longRangeADDCombatAircraftLossesByTypeAndYear": add_losses,
}
file_out.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n")
print("VMF source rows", {k: len(v["records"]) for k,v in vmf.items()},
      "PVO units/subtotals",len(pvo_records),"PVO methods",len(pvo_methods),
      "ADD sortie types",len(add_sorties["records"]),"ADD loss types",len(add_losses["records"]))
print("VMF source discrepancies",{k:len(v["sourceArithmeticDiscrepancies"]) for k,v in vmf.items()})
