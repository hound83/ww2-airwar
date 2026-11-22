#!/usr/bin/env python3
"""Normalize USAAF 1945 official theater personnel and battle-casualty tables.

Usage: python3 scripts/normalize-usaaf-1945-eto-mto.py RAW_DIGEST_JSON OUTPUT_JSON

Tables 24/25 are monthly commissioned-officer personnel by occupational
specialty, NOT aircrew in operations or pilot deaths. Tables 36/37 are battle
casualties among ALL AAF personnel by fate and officer/enlisted categories.
"""

import json
import re
import sys
from pathlib import Path


MONTH = {name: i + 1 for i, name in enumerate("Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split())}
SPECIALTY = [
    "totalOfficers", "pilots", "bombardiers", "navigators", "otherAircrew",
    "administration", "armamentOrdnance", "communications", "engineering",
    "medical", "operationsStaff", "supply", "otherSpecialty",
]
CASUALTIES = [
    "allPersonnelTotal", "allPersonnelDied", "allPersonnelWoundedEvacuated", "allPersonnelMissingInternedCaptured",
    "officersTotal", "officersDied", "officersWoundedEvacuated", "officersMissingInternedCaptured",
    "enlistedTotal", "enlistedDied", "enlistedWoundedEvacuated", "enlistedMissingInternedCaptured",
]


def numeric(value):
    return int(value.replace(",", "")) if re.fullmatch(r"\d[\d,]*", value or "") else None


def rows(payload, table_id):
    return [[cell["text"] for cell in row] for segment in payload["tables"][str(table_id)]["sourceTableSegments"] for row in segment]


def specialty_records(source_rows):
    records = []
    year = None
    for row in source_rows:
        if len(row) != 14:
            continue
        if row[0] in ("1944", "1945") and all(not v for v in row[1:]):
            year = int(row[0])
        elif row[0][:3] in MONTH and year:
            month = MONTH[row[0][:3]]
            # Multiple repeated HTML table segments have the same year and
            # month headings; de-duplicate exact month keys if needed.
            record = {
                "period": f"{year:04d}-{month:02d}",
                "sourceLabel": row[0],
                "officerPersonnelOnStrengthBySpecialty": dict(zip(SPECIALTY, [numeric(x) for x in row[1:]])),
            }
            if not any(r["period"] == record["period"] for r in records):
                records.append(record)
    records.sort(key=lambda r: r["period"])
    if len(records) != 15:
        raise ValueError(f"Expected Jun1944-Aug1945 (15 rows), got {len(records)}")
    return records


def casualties_records(source_rows):
    records, annual, unknown = [], {}, None
    year = None
    monthly_section = False
    grand = None
    for row in source_rows:
        if len(row) != 13:
            continue
        label = row[0].strip()
        if label == "Grand Total":
            grand = dict(zip(CASUALTIES, [numeric(x) for x in row[1:]]))
        elif label == "Monthly":
            monthly_section = True
        elif not monthly_section:
            if re.fullmatch(r"194[1-5]", label):
                annual[label] = dict(zip(CASUALTIES, [numeric(x) for x in row[1:]]))
            elif label.startswith("1945("):
                annual["1945"] = dict(zip(CASUALTIES, [numeric(x) for x in row[1:]]))
            elif label == "Date Unknown":
                unknown = dict(zip(CASUALTIES, [numeric(x) for x in row[1:]]))
        elif re.fullmatch(r"194[1-5]", label) and all(not x for x in row[1:]):
            year = int(label)
        elif label[:3] in MONTH and year:
            values = dict(zip(CASUALTIES, [numeric(x) for x in row[1:]]))
            records.append({"period": f"{year:04d}-{MONTH[label[:3]]:02d}", "reportedBattleCasualties": values})
    if not grand or not records or not unknown:
        raise ValueError("Expected grand, monthly and unknown casualty records")
    records.sort(key=lambda x: x["period"])
    reconciliation = []
    for y, published in annual.items():
        subset = [r for r in records if r["period"].startswith(y)]
        if not subset:
            continue
        for column in CASUALTIES:
            expected = published[column]
            if expected is None:
                continue
            summation = sum(r["reportedBattleCasualties"][column] or 0 for r in subset)
            if expected != summation:
                reconciliation.append({"year": y, "column": column, "printed": expected, "sumOfMonths": summation})
    return {"monthly": records, "annual": annual, "dateUnknown": unknown, "grandTotal": grand, "monthlyToAnnualDiscrepancies": reconciliation}


def main():
    if len(sys.argv) != 3:
        raise SystemExit("Usage: normalize-usaaf-1945-eto-mto.py RAW_DIGEST_JSON OUTPUT_JSON")
    source, destination = map(Path, sys.argv[1:])
    raw = json.loads(source.read_text(encoding="utf-8"))
    theater_tables = {}
    for code, label, specialty_table, casualty_table in [("ETO", "European Theater of Operations", 24, 36), ("MTO", "Mediterranean Theater of Operations", 25, 37)]:
        sp = specialty_records(rows(raw, specialty_table))
        ca = casualties_records(rows(raw, casualty_table))
        theater_tables[code] = {
            "theater": label,
            "officerSpecialtyTable": specialty_table,
            "battleCasualtyTable": casualty_table,
            "monthlyOfficersBySpecialty": sp,
            "battleCasualties": ca,
        }
    payload = {
        "id": "USAAF-1945-ETO-MTO-OFFICER-AND-CASUALTY-MONTHLY",
        "sourceUrl": "https://www.ibiblio.org/hyperwar/AAF/StatDigest/aafsd-2.html",
        "originalUSAAFDocument": "Army Air Forces Statistical Digest: World War II, Office of Statistical Control, December 1945, Tables 24,25,36,37",
        "primaryScan": "https://archive.org/details/ArmyAirForcesStatisticalDigestWorldWarII",
        "researchStatus": "historical_official_statistics_secondary_html_transcription_not_checked_against_pdf",
        "scope": "USAAF only. ETO and MTO as defined in original Dec1945 digest. Officer pilot count = headcount serving, not casualties.",
        "battleCasualtiesDenominator": "All AAF personnel (officers and enlisted); includes statuses 'missing, interned and captured', not all fatalities and not necessarily pilots.",
        "afterAtlasCutoff": "June-August 1945 in source records are preserved for audit but excluded from historical Atlas May1945 end.",
        "tables": theater_tables,
    }
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    for code, data in theater_tables.items():
        ca = data["battleCasualties"]
        print(code,"officer months",len(data["monthlyOfficersBySpecialty"]),"casualty months",len(ca["monthly"]),"grand battle casualties",ca["grandTotal"]["allPersonnelTotal"],"reconciliation issues",len(ca["monthlyToAnnualDiscrepancies"]))


if __name__ == "__main__":
    main()
