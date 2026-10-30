#!/usr/bin/env python3
"""Summarize (but do not reproduce) unlicensed secondary German unit-month CSVs.

The two CSVs are by samcarlos/luftwaffe_locations and derived from ww2.dk.
They have no identified reuse license; preserve aggregate QA statistics only,
not original rows, locations, names, or reissued numerical unit observations.

Usage: python scripts/audit-secondary-luftwaffe-unit-months.py locations.csv strengths.csv audit.json
"""

import argparse
import csv
import json
from collections import Counter, defaultdict
from pathlib import Path

LINK_KEYS = ("group_type", "squadron_number", "group_number", "subgroup", "date")
AUTHOR_REPO = "https://github.com/samcarlos/luftwaffe_locations"
SOURCE_INTRO = "https://ww2.dk/oob/statistics/gobintro.html"


def year_from_date(value):
    if len(value) < 10 or value[4] != "-" or value[7] != "-":
        raise ValueError(f"Unexpected date field: {value!r}")
    return value[:4]


def safe_number(value):
    try:
        return int(value)
    except (ValueError, TypeError):
        return None


def join_key(row):
    return tuple(row[col] for col in LINK_KEYS)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("locations_csv", type=Path)
    ap.add_argument("sizes_csv", type=Path)
    ap.add_argument("output", type=Path)
    args = ap.parse_args()

    with args.locations_csv.open(newline="", encoding="utf-8-sig") as inp:
        locations = list(csv.DictReader(inp))
    with args.sizes_csv.open(newline="", encoding="utf-8-sig") as inp:
        strength = list(csv.DictReader(inp))

    loc_years = Counter(year_from_date(r["date"]) for r in locations)
    strength_years = Counter(year_from_date(r["date"]) for r in strength)
    loc_keys = Counter(join_key(r) for r in locations)
    strength_keys = Counter(join_key(r) for r in strength)
    bad_lonlat = 0
    missing_lonlat = 0
    for row in locations:
        try:
            lat, lon = float(row["lat"]), float(row["lon"])
            if not -90 <= lat <= 90 or not -180 <= lon <= 180:
                bad_lonlat += 1
        except (ValueError, TypeError):
            missing_lonlat += 1

    mismatch = Counter()
    incomplete = Counter()
    for row in strength:
        nums = {k: safe_number(row[k]) for k in (
            "total", "add", "add_new", "add_maintenance", "add_other_units",
            "lost", "lost_enemy", "lost_accident", "lost_maintenance",
            "lost_other_units", "total_eom",
        )}
        if any(v is None for v in nums.values()):
            incomplete["any_not_numeric"] += 1
            continue
        if nums["total"] + nums["add"] - nums["lost"] != nums["total_eom"]:
            mismatch["opening_plus_additions_minus_losses_vs_end_of_month"] += 1
        if nums["add_new"] + nums["add_maintenance"] + nums["add_other_units"] != nums["add"]:
            mismatch["additions_subcategories_vs_total"] += 1
        if nums["lost_enemy"] + nums["lost_accident"] + nums["lost_maintenance"] + nums["lost_other_units"] != nums["lost"]:
            mismatch["loss_subcategories_vs_total"] += 1

    matchable = [key for key in strength_keys if key in loc_keys]
    strength_rows_matchable = sum(strength_keys[key] for key in matchable)
    map_rows_joined_naively = sum(strength_keys[key] * loc_keys[key] for key in matchable)
    # The source has multiple aircraft models at a single unit-month, so a
    # relational join without preaggregation repeats the station for each model.
    # Duplicate station rows also cause potential row multiplication.
    output = {
        "status": "secondary_lead_audit_only_NOT_REISSUED_SOURCE_DATA",
        "sourceAuthorProject": AUTHOR_REPO,
        "upstreamOriginalStrengthDocumentResearchLead": SOURCE_INTRO,
        "rights": "No explicit license observed in GitHub repository; original CSV records are deliberately NOT published, excerpted, or imported.",
        "counts": {
            "allLocationRows": len(locations),
            "allModelStrengthLossRows": len(strength),
            "distinctLocationUnitMonthKeys": len(loc_keys),
            "distinctStrengthUnitMonthKeys": len(strength_keys),
            "locationKeysWithMoreThanOneRow": sum(v > 1 for v in loc_keys.values()),
            "strengthKeysWithMoreThanOneModelRow": sum(v > 1 for v in strength_keys.values()),
            "strengthUnitMonthKeysFoundInLocationKeys": len(matchable),
            "strengthRowsWithAtLeastOneMatchingLocationKey": strength_rows_matchable,
            "naiveInnerJoinResultRowsFromKeyMultiplication": map_rows_joined_naively,
            "locationRowsMissingCoordinates": missing_lonlat,
            "locationRowsInvalidCoordinateRanges": bad_lonlat,
            "strengthRowsWithMissingOrNonnumericFlowFields": incomplete["any_not_numeric"],
            "monthlyFlowArithmeticMismatchRowsByTest": dict(sorted(mismatch.items())),
        },
        "locationRowsByYear": dict(sorted(loc_years.items())),
        "modelStrengthLossRowsByYear": dict(sorted(strength_years.items())),
        "criticalLimitations": [
            "Historical locations are volunteer approximations, and sometimes deliberately inherited from the last known station; neither precise runway coordinates nor verified time-specific occupancy.",
            "Each date is synthetically set at the fifteenth of a month; it does not establish actual arrival/departure day.",
            "Location dataset can include North Africa and other global theaters: filter by historically justified theater, not naive modern European bounding box.",
            "Several aircraft-model rows exist per unit-month; strength records cannot join 1-to-1 to location records without aggregation and collision checks.",
            "End-of-month on-hand is not automatically serviceable or combat-ready aircraft; losses need definition/cause verification against original German files.",
            "Original Bundesarchiv RL 2-III/700-734 and USAAF captured-document HRA137.306-14 contain original strength/operational returns; re-extract there for public Atlas evidence.",
            "Unlicensed secondary CSVs are research leads, NOT licensed data assets for redistribution or deployment.",
        ],
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(output["counts"], indent=2))


if __name__ == "__main__":
    main()
