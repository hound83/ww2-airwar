#!/usr/bin/env python3
"""Preserve D-Day Allied air-unit hierarchy and reported station names.

The source lists *unit locations*, not verified aerodrome geometry, and often
names command posts too. No latitude/longitude is fabricated here.
"""
import json
import re
from pathlib import Path

root = Path(__file__).resolve().parents[1] / "research/transcriptions"
raw = json.loads((root / "specialist-ww2-statistical-tables/specialist-ww2-oobairdday.json").read_text())
rows = raw["tables"][0]["rows"][1:]
parent_at = {}
records = []
explicit_tags = [
    ("RCAF", "Canadian/RCAF"), ("RAAF", "Australian/RAAF"),
    ("RNZAF", "New Zealand/RNZAF"), ("FAA", "Royal Navy/Fleet Air Arm"),
    ("(Polish)", "Polish under RAF command"),
    ("(Dutch)", "Dutch under RAF command"),
    ("(French)", "French under RAF command"),
    ("(Belgium)", "Belgian under RAF command"),
    ("(Czech)", "Czech under RAF command"),
    ("(Norwegian)", "Norwegian under RAF command"),
]
for row in rows:
    cols = row["cells"]
    if len(cols) < 3:
        continue
    raw_name = cols[2]["text"]
    if not raw_name.strip():
        continue
    level = len(re.match(r"^—*", raw_name.strip()).group(0))
    name = re.sub(r"^[—\-\s]+", "", raw_name).strip()
    if not name:
        continue
    for prior in list(parent_at):
        if prior >= level:
            del parent_at[prior]
    ancestors = [parent_at[k] for k in sorted(parent_at)]
    aircraft = cols[3]["text"] if len(cols) >= 4 else ""
    station = cols[4]["text"] if len(cols) >= 5 else ""
    hint = [label for tag, label in explicit_tags if tag.lower() in name.lower()]
    record = {
        "sourceRow": row["row"], "date": "1944-06-06", "depth": level,
        "unitName": name, "parentUnit": ancestors[-1] if ancestors else None,
        "ancestorCommands": ancestors, "aircraftVariantString": aircraft or None,
        "stationNameAsPrinted": station or None,
        "explicitNationalityTagsOnly": hint,
        "classification": ("unit_or_flight_with_type" if aircraft else
                           "headquarters_or_higher_formation_with_station" if station else
                           "unclassified_hierarchy_node"),
    }
    records.append(record)
    parent_at[level] = name

out = {
    "sourceUrl": raw["sourceUrl"], "compiler": raw["compiler"],
    "sourceStudies": raw["reportedUnderlyingSources"],
    "date": "1944-06-06", "operation": "D-Day/Operation Overlord air order of battle",
    "scope": "Allied Air Expeditionary Force and related Allied air formations present in the published order of battle",
    "cautions": [
        "Modern secondary compilation; compare individual squadrons with RAF AIR 27 and USAAF unit records.",
        "Station names are historical strings, not coordinates or confirmed airfield boundaries.",
        "The original lists command stations and squadron airfields; not every location is a runway.",
        "Aircraft types identify equipment, not an aircraft count; source contains no uniform per-squadron aircraft strength.",
        "Parent association is inferred strictly from printed indentation, not external official crosswalk.",
        "A unit may appear more than once as separate flights; records are not unique-unit totals.",
        "Nationality tags are only source-text hints. RAF command affiliation and national ownership must be independent dimensions."
    ],
    "records": records,
    "counts": {"printedRecords": len(records),
               "recordsWithStations": sum(bool(x["stationNameAsPrinted"]) for x in records),
               "recordsWithAircraftType": sum(bool(x["aircraftVariantString"]) for x in records),
               "distinctReportedStationStrings": len(set(x["stationNameAsPrinted"] for x in records if x["stationNameAsPrinted"]))}
}
path = root / "allied-dday-1944-air-unit-types-and-historical-station-names.json"
path.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n")
print(out["counts"])
