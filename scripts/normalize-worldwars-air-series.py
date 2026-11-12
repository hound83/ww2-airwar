#!/usr/bin/env python3
"""Normalize public historical numerical observations from specialist table extracts.

Neither this script nor its output changes live Atlas data. Cross-source
disagreements are recorded, not erased; source dash/unknown remains null.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "research/transcriptions"
RAW = ROOT / "specialist-ww2-statistical-tables"
MONTHS = dict(zip("January February March April May June July August September October November December".split(), range(1, 13)))
SHORT_MONTHS = dict(zip("Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(), range(1, 13)))


def source(slug, table=0):
    obj = json.loads((RAW / f"specialist-ww2-{slug}.json").read_text())
    return obj, obj["tables"][table]["rows"]


def number(cell):
    return cell.get("count", cell.get("decimal"))


def values(row):
    return [number(c) for c in row["cells"][1:]]


def write(filename, data):
    (ROOT / filename).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")


def raf_bomber_monthly():
    src, rows = source("sortieslossrafbc")
    keys = ["sortiesNight", "sortiesDay", "sortiesTotal", "missingNight", "missingDay", "missingTotal", "crashedNight", "crashedDay", "crashedTotal", "averageDailySortiesAsPrinted", "totalLost", "lossRatePercentAsPrinted"]
    monthly, annual, issues = [], [], []
    year = None
    for row in rows[2:]:
        label = row["cells"][0]["text"].strip()
        numeric = values(row)
        if len(numeric) != len(keys):
            issues.append({"sourceRow": row["row"], "issue": "wrong_column_count", "count": len(numeric)})
            continue
        observation = {"sourceRow": row["row"], **dict(zip(keys, numeric))}
        if re.fullmatch(r"19\d\d", label):
            year = int(label)
            annual.append({"year": year, **observation})
        elif label in MONTHS and year:
            monthly.append({"month": f"{year:04d}-{MONTHS[label]:02d}", **observation})
        elif label.upper() == "TOTAL":
            global_total = observation
        else:
            issues.append({"sourceRow": row["row"], "issue": "unclassified_date", "label": label})
            continue
        for lhs, parts in [("sortiesTotal", ["sortiesNight", "sortiesDay"]), ("missingTotal", ["missingNight", "missingDay"]), ("crashedTotal", ["crashedNight", "crashedDay"]), ("totalLost", ["missingTotal", "crashedTotal"])]:
            if observation[lhs] is not None and all(observation[x] is not None for x in parts):
                total = sum(observation[x] for x in parts)
                if total != observation[lhs]:
                    issues.append({"sourceRow": row["row"], "issue": "row_arithmetic", "column": lhs, "printed": observation[lhs], "partsSum": total})
    for yearrow in annual:
        local = [r for r in monthly if r["month"].startswith(str(yearrow["year"]))]
        if len(local) != (4 if yearrow["year"] == 1939 else 5 if yearrow["year"] == 1945 else 12):
            issues.append({"year": yearrow["year"], "issue": "missing_month_rows", "present": len(local)})
        for key in ["sortiesTotal", "missingTotal", "crashedTotal", "totalLost"]:
            total = sum(row[key] or 0 for row in local)
            if total != yearrow[key]:
                issues.append({"year": yearrow["year"], "issue": "annual_vs_monthly", "column": key, "printed": yearrow[key], "sumOfMonthly": total})
    data = {"sourceUrl": src["sourceUrl"], "historicalBook": src["reportedUnderlyingSources"], "force": "RAF Bomber Command", "dateScope": "Sep 1939-May 1945", "population": "bomber_command_sorties_by_day_night_and_aircraft_lost_or_crashed", "cautions": ["Missing and crashed are separate source loss categories, not pilot casualties.", "Missing or dash remain null; no zero substituted in published observations.", "This Max Hastings-derived series reports 373,514 sorties and 10,121 aircraft lost, while a separate Jane's-derived RAF summary reports 392,137 sorties and 9,163 losses; denominators are not verified comparable.", "Source monthly rates are preserved verbatim, but not recomputed from presumed days or missions."], "monthly": monthly, "reportedAnnual": annual, "reportedGrandTotal": global_total, "arithmeticIssues": issues}
    write("raf-bomber-command-sorties-missing-crashes-monthly-1939-1945.json", data)
    return data


def luftwaffe_category_readiness():
    src, strength = source("airavailluft", 0)
    _, ready = source("airavailluft", 1)
    cat = ["singleEngineFighter", "twinEngineFighter", "nightFighter", "groundAttack", "bomber", "transport"]
    on_hand, serviceable = {}, {}
    for records, dest in [(strength, on_hand), (ready, serviceable)]:
        current_year = None
        for row in records[1:]:
            label = row["cells"][0]["text"].strip()
            if re.fullmatch("19\\d\\d", label):
                current_year = int(label)
            elif label in MONTHS and current_year:
                numeric = values(row)
                dest[f"{current_year:04d}-{MONTHS[label]:02d}"] = dict(zip(cat, numeric))
    entries, issues = [], []
    for month in sorted(on_hand):
        item = {"month": month, "onHand": on_hand[month], "serviceable": serviceable.get(month, {})}
        if month == "1945-04":
            item["sourceReportingException"] = "April 1945 transport count is actually from February 1945; no April serviceable returns available."
        for key in cat:
            h = item["onHand"].get(key)
            r = item["serviceable"].get(key)
            if h is not None and r is not None and r > h:
                issues.append({"month": month, "category": key, "issue": "serviceable_exceeds_onhand", "onHand": h, "ready": r})
        entries.append(item)
    data = {"sourceUrl": src["sourceUrl"], "historicalBook": src["reportedUnderlyingSources"], "force": "Luftwaffe", "datePrecision": "month_only_no_exact_day_in_secondary_table", "population": "aircraft_available_by_role_and_serviceability_all_commands_as_reported", "cautions": ["Modern book-derived totals, not primary Bundesarchiv unit returns; reconcile before public aggregation.", "Transport not included in serviceability table.", "1945 April transport is February data per source note.", "An n/a or blank remains null, not zero; source serviceability classes may differ from combat-ready unit-level data."], "monthlySnapshots": entries, "arithmeticIssues": issues}
    write("luftwaffe-available-serviceable-by-role-1939-1945.json", data)
    return data


def usaaf_med_type_strength():
    src, rows = source("airstrusaafmed")
    dates = ["1942-06", "1942-09", "1942-12", "1943-03", "1943-06", "1943-09", "1943-12", "1944-03", "1944-06", "1944-09", "1944-12", "1945-03", "1945-04"]
    assert len(rows[1]["cells"]) - 1 == len(dates)
    records = []
    for row in rows[2:]:
        label = row["cells"][0]["text"].strip()
        if not label:
            continue
        vals = values(row)
        assert len(vals) == len(dates), (label, len(vals))
        records.append({"aircraftTypeOrCategory": label, "sourceRow": row["row"], "onHand": dict(zip(dates, vals))})
    data = {"sourceUrl": src["sourceUrl"], "historicalBook": "Army Air Forces Statistical Digest World War II (secondary derivative of official 1945 original)", "force": "USAAF Mediterranean Theater", "timeBasis": "end_of_calendar_month_as_source_note", "population": "aircraft_on_hand_by_type_or_category_not_serviceable", "dateKeys": dates, "cautions": ["All category and type records overlap hierarchically: do not sum Heavy Bombers with B-17 and B-24.", "ETO source figures in a separate transcript; theater boundaries must be validated when linking Ninth/Fifteenth commands.", "Printed dash or empty remains null, including categories with zero or no data."], "typeOrCategoryRecords": records}
    write("usaaf-mediterranean-aircraft-on-hand-by-type-1942-1945.json", data)
    return data


def raf_summary():
    src, rows = source("rafsummary")
    commands, command, notices = [], None, []
    for row in rows[1:]:
        original_label = row["cells"][0]["text"].strip()
        label = (original_label if re.fullmatch(r"19\d\d(?:-\d\d)?", original_label)
                 else re.sub(r"[0-9]+$", "", original_label).strip())
        vals = values(row)
        if len(vals) != 3 or not label:
            continue
        if label.upper().startswith("TOTAL RAF"):
            grand = {"sorties": vals[0], "bombTonnage": vals[1], "aircraftLost": vals[2]}
            continue
        if re.fullmatch(r"19\d\d(?:-\d\d)?", label):
            if command is None:
                notices.append({"sourceRow": row["row"], "issue": "year_without_command"})
            else:
                commands[-1]["annual"].append({"period": label, "sorties": vals[0], "bombTonnage": vals[1], "aircraftLost": vals[2]})
        else:
            command = label
            commands.append({"command": label, "reportedTotal": {"sorties": vals[0], "bombTonnage": vals[1], "aircraftLost": vals[2]}, "annual": []})
    data = {"sourceUrl": src["sourceUrl"], "historicalBook": src["reportedUnderlyingSources"], "population": "RAF operational sorties and aircraft lost by command, as printed", "cautions": ["No uniform annual end-date for 1945 explicitly supplied in this secondary table.", "Bomber Command aircraft operating under Coastal Command are included per source note: avoid double-counting as command-wide sum.", "Mediterranean and Middle East includes operations geographically outside continental Europe and may have separate national RAF/Commonwealth attributions.", "Tonnage includes sea mines as noted; annual 1939-40 Coastal Command is a combined period.", "Different report from Hastings-based monthly RAF bomber sorties; differences require investigation."], "commands": commands, "reportedGrandTotal": grand, "parseIssues": notices}
    write("raf-command-sorties-tonnage-losses-by-year-1939-1945.json", data)
    return data


def battle_of_britain_claims():
    src, weeks = source("battlebritain", 0)
    _, months = source("battlebritain", 1)

    def collect(rows):
        result = []
        for row in rows[1:]:
            vals = values(row)
            if len(vals) != 3:
                raise ValueError((row["row"], vals))
            result.append({"periodAsPrinted": row["cells"][0]["text"], "sourceRow": row["row"],
                           "rafAircraftLostAsReported": vals[0], "luftwaffeAircraftLostAsReported": vals[1],
                           "rafClaimsAgainstLuftwaffe": vals[2]})
        return result

    w, m = collect(weeks), collect(months)
    issues = []
    for key in ("rafAircraftLostAsReported", "luftwaffeAircraftLostAsReported", "rafClaimsAgainstLuftwaffe"):
        for name, series in [("weekly", w), ("monthly", m)]:
            if sum(x[key] or 0 for x in series[:-1]) != series[-1][key]:
                issues.append({"series": name, "metric": key, "issue": "period_sum_differs_printed_total"})
    data = {"sourceUrl": src["sourceUrl"], "historicalBook": src["reportedUnderlyingSources"],
            "campaign": "Battle of Britain", "dateScope": "1940-07-10/1940-10-31",
            "cautions": ["RAF claimed enemy aircraft are contemporary victory claims, not Luftwaffe actual losses.",
                         "German and British reported aircraft losses here are from a retrospective Churchill-derived secondary table, not independently reconciled individual incidents.",
                         "Weekly and monthly sections are two aggregations of the SAME campaign and must not be added.",
                         "Weeks are source's reporting windows; their printed periods are preserved to avoid inventing dates."],
            "weekly": w, "monthly": m, "reconciliationIssues": issues}
    write("battle-of-britain-1940-raf-german-losses-vs-raf-claims-weekly.json", data)
    return data


def allied_aircraft_engaged():
    src, rows = source("aircraftengaged")
    year = None
    observations, issues = [], []
    columns = ["usaafBombers", "usaafFighters", "usaafTotal", "rafBombers", "rafFighters", "rafTotal", "reportedCombined"]
    for row in rows[2:]:
        label = row["cells"][0]["text"].strip()
        if re.fullmatch("19\\d\\d", label):
            year = int(label)
            continue
        if label not in MONTHS:
            continue
        vals = values(row)
        if len(vals) != len(columns):
            raise ValueError((row["row"], vals))
        item = {"month": f"{year:04d}-{MONTHS[label]:02d}", "sourceRow": row["row"], **dict(zip(columns, vals))}
        for name, lhs, rhs in [("usaafTotal", "usaafBombers", "usaafFighters"),
                                ("rafTotal", "rafBombers", "rafFighters"),
                                ("reportedCombined", "usaafTotal", "rafTotal")]:
            if all(item[x] is not None for x in (name,lhs,rhs)) and item[lhs] + item[rhs] != item[name]:
                issues.append({"month": item["month"], "metric": name, "printed": item[name], "computed": item[lhs] + item[rhs]})
        observations.append(item)
    data = {"sourceUrl": src["sourceUrl"], "historicalReport": src["reportedUnderlyingSources"],
            "datePrecision": "month_only", "sourceMetric": "Aircraft engaged in Europe (not aircraft serviceable)",
            "cautions": ["Original U.S. Strategic Bombing Survey definition must be located before comparing to RAF AIR 22 serviceable airplanes or USAAF end-of-month on-hand series.",
                         "Numbers for RAF far exceed AIR 22 operational serviceable Europe figures; they represent a different denominator and may have a broader geographic scope.",
                         "Does not list French/Soviet air forces. An Allied sum is only the two displayed USAAF+RAF series, not all Allied powers."],
            "monthlyObservations": observations, "arithmeticIssues": issues}
    write("usaaf-raf-allied-aircraft-engaged-europe-monthly-1942-1945.json", data)
    return data


if __name__ == "__main__":
    for name, func in [("RAF Bomber monthly", raf_bomber_monthly), ("Luftwaffe categories", luftwaffe_category_readiness), ("USAAF Mediterranean", usaaf_med_type_strength), ("RAF command yearly", raf_summary), ("Battle of Britain claims vs losses", battle_of_britain_claims), ("USAAF+RAF engaged", allied_aircraft_engaged)]:
        result = func()
        print(name, "saved", len(json.dumps(result)), "bytes")
