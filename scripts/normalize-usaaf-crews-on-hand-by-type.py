#!/usr/bin/env python3
"""Normalize USAAF Statistical Digest Tables 55/56 (crews on hand by type).

Aircraft CREWS ≠ aircraft strength ≠ pilot officers. Malformed printed source
cells are retained as null plus an audit notice, never silently repaired.
"""
import json
import re
from pathlib import Path

root = Path(__file__).resolve().parents[1] / "research/transcriptions"
original = json.loads((root / "usaaf-1945-digest-personnel-crew-tables.json").read_text())
months = dict(zip("Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(), range(1, 13)))


def exact_integer(value):
    value = value.strip()
    if re.fullmatch(r"\d+", value):
        return int(value)
    if re.fullmatch(r"\d{1,3}(,\d{3})+", value):
        return int(value.replace(",", ""))
    return None


def parse_table(tableid, theater):
    rows = original["tables"][tableid]["sourceTableSegments"][0]
    group_headers = rows[0][2:]
    subtype_headers = rows[1]
    groups = []
    col = 2
    for group in group_headers:
        width = group.get("colspan", 1)
        members = [c["text"] for c in subtype_headers[col - 2:col - 2 + width]]
        groups.append({"category": group["text"], "typeLabels": members, "start": col, "end": col + width})
        col += width
    data, warnings = [], []
    year = None
    for rowindex, row in enumerate(rows[2:], start=3):
        if len(row) == 2 and re.fullmatch(r"19\d\d", row[0]["text"].rstrip(":")):
            year = int(row[0]["text"].rstrip(":"))
            continue
        if not row or row[0]["text"] not in months or year is None:
            continue
        date = f"{year:04d}-{months[row[0]['text']]:02d}"
        if len(row) != col:
            warnings.append({"sourceRow": rowindex, "date": date, "issue": "unexpected_source_column_count", "columns": len(row), "expected": col})
            continue
        item = {"endOfMonth": date, "reportedAllCrewsOnHand": exact_integer(row[1]["text"]), "sourceRow": rowindex, "byAircraftCategory": {}}
        if item["reportedAllCrewsOnHand"] is None and row[1]["text"]:
            warnings.append({"date": date, "sourceRow": rowindex, "column": "Total Crews", "originalText": row[1]["text"], "issue": "malformed_unparsed_number"})
        for group in groups:
            members = []
            for label, cell in zip(group["typeLabels"], row[group["start"]:group["end"]]):
                raw = cell["text"]
                count = exact_integer(raw)
                if count is None and raw not in ("-", "", "n/a", "N/A"):
                    warnings.append({"date": date, "sourceRow": rowindex, "category": group["category"], "type": label, "originalText": raw, "issue": "malformed_unparsed_number"})
                members.append({"printedTypeOrSummary": label, "crewsOnHand": count, "originalText": raw})
            item["byAircraftCategory"][group["category"]] = members
            if len(members) > 1 and members[0]["printedTypeOrSummary"].lower() == "total":
                sub = [r["crewsOnHand"] for r in members[1:]]
                if all(v is not None for v in sub) and members[0]["crewsOnHand"] is not None and sum(sub) != members[0]["crewsOnHand"]:
                    warnings.append({"date": date, "category": group["category"], "issue": "subtypes_sum_disagrees_reported_group_total", "reported": members[0]["crewsOnHand"], "computed": sum(sub)})
        data.append(item)
    return {"theater": theater, "sourceTable": int(tableid), "aircraftCategoryColumnDefinitions": groups, "monthly": data, "auditIssues": warnings}


out = {
    "sourceUrl": original["hyperWarSourceUrl"],
    "sourceClass": "official_USAAF_Office_of_Statistical_Control_1945_primary_digest",
    "metric": "CREWS_on_hand_by_aircraft_type_or_model_not_aircraft_and_not_pilot_people",
    "dateScope": "1943-06 through 1945-08 inclusive; end of each month",
    "cautions": [
        "A complete bomber crew includes multiple aviators. Crews on hand are NOT pilot headcount, KIA, or serviceable airplane inventories.",
        "One crew may be assigned to an aircraft type, which must not be added again to the summarized category total.",
        "Several official web transcription cells appear malformed (e.g. '4.260' instead of thousands-comma syntax and '1,20'); such values are null and explicitly audited, not repaired.",
        "ETO and MTO command boundaries must be checked by date before combining with another strength/crew series.",
        "Source dashes and blanks are null (unknown or not applicable), not automatically zero."
    ],
    "theaters": [parse_table("55", "ETO"), parse_table("56", "MTO")]
}
outfile = root / "usaaf-eto-mto-crews-on-hand-by-aircraft-type-monthly-1943-1945.json"
outfile.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n")
for theater in out["theaters"]:
    print(theater["theater"], len(theater["monthly"]), "months", len(theater["auditIssues"]), "issues", "Jun 1943", theater["monthly"][0]["reportedAllCrewsOnHand"] if theater["monthly"] else "none")
