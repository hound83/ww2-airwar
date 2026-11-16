#!/usr/bin/env python3
"""Normalize Soviet-compiled opposing Luftwaffe/Axis geographic snapshots.

RKKA.es secondary transcription of Soviet historical records: never conflate
reported German, Axis-allied, and mixed totals or turn reported combat aircraft
numbers into serviceable/ready estimates. Original rows remain available.
"""
import json
import re
from pathlib import Path

root = Path(__file__).resolve().parents[1] / "research/transcriptions/rkka-strength-02"
page21 = json.loads((root / "rkka-vvs-strength-02-21.json").read_text())
page22 = json.loads((root / "rkka-vvs-strength-02-22.json").read_text())
months = {"enero": 1, "febrero": 2, "marzo": 3, "abril": 4, "mayo": 5, "junio": 6, "julio": 7, "agosto": 8, "septiembre": 9, "octubre": 10, "noviembre": 11, "noviebre": 11, "diciembre": 12}


def number(text):
    t = (text or "").strip()
    m = re.fullmatch(r"([\d\s]+)(?:\{\d+\})?", t)
    return int("".join(m.group(1).split())) if m else None


def extract_date(label):
    label = label.lower()
    m = re.search(r"(?:a fecha de |a )?(\d{1,2})\s+de?\s*([a-záé]+)\s+de?\s*(19\d\d)", label)
    if not m:
        m = re.search(r"(?:a fecha de |a )?(\d{1,2})\s+([a-záé]+)\s+(19\d\d)", label)
    if m and m.group(2) in months:
        return f"{int(m.group(3)):04d}-{months[m.group(2)]:02d}-{int(m.group(1)):02d}"
    return None


def all_numbers(row):
    cells = [c["value"] for c in row["cells"]]
    first = next((i for i, x in enumerate(cells) if number(x) is not None), None)
    if first is None:
        return None
    digits = cells[first:first + 4]
    if len(digits) < 4:
        # Rows with no three role breakdowns are padded with explicit unknowns.
        digits += [""] * (4 - len(digits))
    labels = [v for v in cells[:first] if v.strip()]
    return labels, digits


def main():
    dated = []
    date = None
    branch = "german_or_unspecified"
    issues = []
    for row in page21["rows"]:
        index = row["sourceRow"]
        cells = [c["value"] for c in row["cells"]]
        combined_label = " ".join(cells[:3]).strip()
        row_date = extract_date(combined_label)
        if index == 4:
            date = "1941-06-22"
        elif row_date and ("a fecha" in combined_label.lower() or combined_label.lower().startswith("a ")) and index not in (5, 175):
            date = row_date
            branch = ("axis_allies_only" if "aliados de alemania" in combined_label.lower() else "german_or_unspecified")
        if index == 5:  # original invasion-day report explicitly specifies date
            date = "1941-06-22"
        numeric = all_numbers(row)
        if numeric is None or date is None:
            continue
        labels, printed = numeric
        if not labels:
            continue
        label = labels[-1]
        total = number(printed[0])
        if total is None:
            continue
        effective_date = ("1944-06-10" if index == 175 else date)
        if 75 <= index <= 82 or 100 <= index <= 108 or 116 <= index <= 123 or 132 <= index <= 139:
            population = "axis_allies_only"
        elif index in (5, 24, 83, 124, 140, 174, 180):
            population = "mixed_axis_and_german_or_unresolved"
        elif index in (166, 167, 168):
            population = "specific_axis_ally"
        else:
            population = branch
        item = {
            "sourceRow": index, "asOfDate": effective_date,
            "geographicRegionAsPrinted": label,
            "contextLabels": labels,
            "reportedPopulation": population,
            "combatAircraftOnHandReported": total,
            "byRole": {"bombers": number(printed[1]), "fighters": number(printed[2]), "reconnaissance": number(printed[3])},
            "printedOriginalCounts": printed,
        }
        if index == 83:
            item["sourceDateWarning"] = "Approximate sum of 15 Apr German and 1 May allied snapshots (15-day mismatch explicitly acknowledged by secondary editor)."
        if index == 180:
            item["sourceDateWarning"] = "Printed as Germany's total although its 3,247 Eastern-front subtotal includes 415 Axis allied aircraft; examine footnote and separate before using national total."
        if index == 5:
            item["sourceDateWarning"] = "Printed 4,942 includes Finland 506 and Romania 504; separate allied Table 02-22 also lists Hungary 90 not itemized here."
        role_numbers = list(item["byRole"].values())
        if all(x is not None for x in role_numbers) and total != sum(role_numbers):
            issues.append({"sourceRow": index, "issue": "role_sum_disagrees_reported_total", "reported": total, "roleSum": sum(role_numbers)})
        dated.append(item)

    # Source table 02-22 has different dates and reporting inclusion from 02-21.
    nation_cols = ["finland", "romania", "hungary", "italy"]
    axis_snapshots = []
    axis_issues = []
    for row in page22["rows"][1:]:
        vals = [c["value"] for c in row["cells"]]
        asof = extract_date(vals[0])
        if not asof:
            raise ValueError((row["sourceRow"], vals[0]))
        by_force = {name: number(val) for name, val in zip(nation_cols, vals[1:5])}
        total = number(vals[5])
        known_sum = sum(v for v in by_force.values() if v is not None)
        if total != known_sum:
            axis_issues.append({"sourceRow": row["sourceRow"], "reported": total, "knownCountrySum": known_sum})
        axis_snapshots.append({"sourceRow": row["sourceRow"], "asOfDate": asof,
                               "aircraftOnStrengthByNation": by_force,
                               "reportedAlliedCombatAircraftTotal": total,
                               "originalTextValues": vals[1:]})
    out = {
        "sources": [page21["sourceUrl"], page22["sourceUrl"]],
        "sourceClass": "secondary_RKKA_es_transcription_of_Soviet_staff_statistical_compilations",
        "dateScope": "1941-06-22 to 1945-05-09; Soviet-German front and select other European theaters",
        "cautions": [
            "Soviet-side estimates of opposing combat aircraft strength, not original Luftwaffe unit ledgers or counts of serviceable aircraft.",
            "Source Table 02-21 contains nested geographic subtotals. Do not sum a front total with its subregional rows.",
            "German, Finnish, Romanian, Hungarian and Italian forces are mixed in some top-level rows. Population tags are cautious, not independently resolved.",
            "The original 1943 April/May combined return has a 15-day date mismatch and is approximate.",
            "The 1941 invasion border snapshot 02-21 includes Finland/Romania but does not itemize Hungary 90 reported separately in 02-22. These are not interchangeable source populations.",
            "A dash/no habia/blank remains null: no silent zero imputation.",
            "Other 1941-era strength series in the Atlas may use different geographic and combat categories: crosscheck before chart import."
        ],
        "geographicTheaterRows": dated,
        "alliedNationSnapshotsFromTable0222": axis_snapshots,
        "roleArithmeticIssues": issues, "alliedNationArithmeticIssues": axis_issues,
    }
    (root / "rkka-axis-german-aircraft-strength-by-theater-1941-1945.json").write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n")
    print("geographic observations", len(dated), "allied snapshots", len(axis_snapshots), "role issues", len(issues), "ally total issues", len(axis_issues))
    if issues:
        print("Role disagreements", issues[:10])


if __name__ == "__main__":
    main()
