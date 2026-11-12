#!/usr/bin/env python3
"""Normalize official USAAF ETO/MTO *crews lost*, including combat/accidents.

Critical: These are CREWS, not pilots or all crew-members killed. The official
Digest tracks administrative retirements, net-other adjustments and negative
flows as well. Never use its overall 'Total Losses' as death/casualty counts.
"""
import json
import re
from pathlib import Path

root = Path(__file__).resolve().parents[1] / "research/transcriptions"
original = json.loads((root / "usaaf-1945-digest-personnel-crew-tables.json").read_text())
tables = original["tables"]
roles = {"67": "heavy_bomber", "68": "medium_or_light_bomber", "69": "day_fighter", "70": "night_fighter", "71": "reconnaissance", "72": "troop_carrier", "73": "communications"}
theaters = {"European Theater of Operations": "ETO", "Mediterranean Theater of Operations": "MTO"}
dates = ([f"1943-{i:02d}" for i in range(6, 13)]
         + [f"1944-{i:02d}" for i in range(1, 13)]
         + [f"1945-{i:02d}" for i in range(1, 9)])


def number(text):
    t = (text or "").strip().replace(",", "")
    if re.fullmatch(r"\d+", t):
        return int(t)
    m = re.fullmatch(r"\((\d+)\)", t)
    return -int(m.group(1)) if m else None


def metrics_from_rows(rows, section_start, has_months):
    parsed = {}
    for row in rows[section_start + 1:section_start + 5]:
        if len(row) < 5:
            continue
        label = row[0]["text"]
        if label not in ("Total Losses", "Combat & Accident Losses", "Retirements", "Net Other Losses"):
            continue
        parsed[label] = {"total": number(row[1]["text"]),
                         "1943JunDec": number(row[2]["text"]),
                         "1944": number(row[3]["text"]),
                         "1945JanAug": number(row[4]["text"])}
        if has_months:
            if len(row) < 5 + len(dates):
                raise ValueError((label, len(row)))
            parsed[label]["monthly"] = {date: number(cell["text"]) for date, cell in zip(dates, row[5:5 + len(dates)])}
    if len(parsed) != 4:
        raise ValueError("incomplete loss category rows: " + str(parsed.keys()))
    return parsed


def read_table(table_number, has_months=True):
    lines = tables[table_number]["sourceTableSegments"][0]
    found = {}
    for idx, row in enumerate(lines):
        if row and row[0]["text"] in theaters:
            found[theaters[row[0]["text"]]] = metrics_from_rows(lines, idx, has_months)
    if set(found) != {"ETO", "MTO"}:
        raise ValueError((table_number, list(found)))
    return found


baseline = read_table("65", has_months=False)
role_metrics = {name: read_table(table) for table, name in roles.items()}
crosscheck = []
annual_keys = ["total", "1943JunDec", "1944", "1945JanAug"]
for theater in theaters.values():
    for annual in annual_keys:
        computed = sum(role_metrics[role][theater]["Combat & Accident Losses"][annual] or 0 for role in roles.values())
        reported = baseline[theater]["Combat & Accident Losses"][annual]
        if computed != reported:
            crosscheck.append({"theater": theater, "period": annual, "category": "combatAndAccidentCrews", "sumOfSevenRoles": computed, "allCrewTypesTable65": reported})
for role in roles.values():
    for theater in theaters.values():
        x = role_metrics[role][theater]
        for annual in annual_keys:
            vals = [x[k][annual] for k in ("Combat & Accident Losses", "Retirements", "Net Other Losses")]
            if x["Total Losses"][annual] != sum(v or 0 for v in vals):
                crosscheck.append({"role": role, "theater": theater, "period": annual, "issue": "crew_administrative_flow_disagrees", "parts": vals, "total": x["Total Losses"][annual]})
        for year, months, key in [(1943, dates[:7], "1943JunDec"), (1944, dates[7:19], "1944"), (1945, dates[19:], "1945JanAug")]:
            for category in x:
                total = sum(x[category]["monthly"][month] or 0 for month in months)
                reported = x[category][key]
                if reported is not None and reported != total:
                    crosscheck.append({"role": role, "theater": theater, "period": str(year), "category": category, "issue": "sum_of_monthly_differs_annual", "sumOfMonths": total, "reported": reported})

out = {
    "sourceUrl": original["hyperWarSourceUrl"],
    "originalCreator": original["originalCreator"],
    "sourceClass": "official_1945_USAAF_Statistical_Digest_primary_published_aggregate",
    "timeBasis": "1943 Jun-Dec; 1944 Jan-Dec; 1945 Jan-Aug",
    "dateKeys": dates,
    "unitsOfMeasure": "number_of_flight_CREWS_lost_or_removed_not_number_of_pilots_or_people",
    "cautions": [
        "Combat & Accident Losses is one administrative crew-loss category; it combines combat and accidents and does NOT mean killed aircrew/pilots.",
        "Total Losses includes retirements and net-other flow, sometimes negative, and is not a casualty fatality series.",
        "The source uses (x) for negative numbers, preserved as signed integers; dashes and blanks remain null.",
        "Only ETO/MTO columns were extracted here from a wider all-theater original; ETO and MTO administrative boundaries change with Ninth Air Force transfer.",
        "Monthly observations and annual returns cover exactly June 1943 through August 1945, not the entire war.",
        "All seven aircraft role tables reconcile in aggregate against original Table 65 unless discrepancies are documented."
    ],
    "sourceTables": [65, 67, 68, 69, 70, 71, 72, 73],
    "allTypeBaselineByTheater": baseline,
    "aircraftCrewRoleTables": role_metrics,
    "arithmeticDiscrepancies": crosscheck,
}
(root / "usaaf-eto-mto-crew-losses-combat-accident-by-role-monthly-1943-1945.json").write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n")
print("Roles", len(roles), "theaters", len(theaters), "months", len(dates), "discrepancies", len(crosscheck))
print("ETO combat+accident crews:",baseline["ETO"]["Combat & Accident Losses"])
print("MTO combat+accident crews:",baseline["MTO"]["Combat & Accident Losses"])
