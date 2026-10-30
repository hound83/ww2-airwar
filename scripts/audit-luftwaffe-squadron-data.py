#!/usr/bin/env python3
"""Produce an *aggregate*, audit-only summary from a third-party Luftwaffe dataset.

The original CSV compilation is NOT copied into this repository. Download both
of its cited `data/*.csv` files separately for local research; pass their paths
as argv. Its geographical coordinates are explicitly guesses, not certified
period airfield positions. Summaries below are NOT Luftwaffe national totals.
"""
import csv
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

if len(sys.argv) != 3:
    raise SystemExit("Usage: python3 scripts/audit-luftwaffe-squadron-data.py <sizes_losses.csv> <locations.csv>")

with open(sys.argv[1], newline="", encoding="utf-8-sig") as fh:
    raw_losses = list(csv.DictReader(fh))
with open(sys.argv[2], newline="", encoding="utf-8-sig") as fh:
    raw_locations = list(csv.DictReader(fh))

numeric_columns = ["total", "add", "add_new", "add_maintenance", "add_other_units",
                   "lost", "lost_enemy", "lost_accident", "lost_maintenance", "lost_other_units", "total_eom"]
loss_input_columns = list(raw_losses[0])
location_input_columns = list(raw_locations[0])
required_unit = ["group_type", "squadron_number", "group_number", "subgroup"]
assert all(key in loss_input_columns for key in numeric_columns + required_unit + ["date", "model"])
assert all(key in location_input_columns for key in required_unit + ["lat", "lon", "locations", "date"])


def unit_key(row):
    return tuple(row[c].strip() for c in required_unit)


def integer(s):
    return int(s.strip()) if re.fullmatch(r"\d+", s.strip()) else None


unique_rows = list({tuple(row.items()): row for row in raw_losses}.values())
loss_field_errors = Counter()
strict_issues = Counter()
summaries = defaultdict(lambda: {"sourceRows": 0, "auditedModelMonths": 0,
                                 **{key: 0 for key in numeric_columns}})
units = defaultdict(lambda: {"sourceRows": 0, "auditedModelMonths": 0,
                             **{key: 0 for key in numeric_columns}})

for row in unique_rows:
    date = row["date"].strip()
    if not re.fullmatch(r"194[234]-\d\d-15", date):
        strict_issues["invalid_source_month"] += 1
        continue
    key = unit_key(row)
    group = key[0] or "UNSPECIFIED_SOURCE_CATEGORY"
    month = date[:7]
    monthly = summaries[(month, group)]
    grouping = units[key]
    for agg in (monthly, grouping):
        agg["sourceRows"] += 1
    counts = {col: integer(row[col]) for col in numeric_columns}
    for col, val in counts.items():
        if val is None:
            loss_field_errors[col] += 1
    if any(x is None for x in counts.values()):
        strict_issues["one_or_more_source_cells_non_numeric"] += 1
        continue
    if counts["total"] + counts["add"] - counts["lost"] != counts["total_eom"]:
        strict_issues["monthly_aircraft_stock_flow_mismatch"] += 1
        continue
    if counts["add"] != counts["add_new"] + counts["add_maintenance"] + counts["add_other_units"]:
        strict_issues["monthly_additions_breakdown_mismatch"] += 1
        continue
    if counts["lost"] != sum(counts[k] for k in ["lost_enemy", "lost_accident", "lost_maintenance", "lost_other_units"]):
        strict_issues["monthly_losses_breakdown_mismatch"] += 1
        continue
    for agg in (monthly, grouping):
        agg["auditedModelMonths"] += 1
        for col, val in counts.items():
            agg[col] += val


def summarize_items(store, names, sort):
    return [dict(zip(names, key), **values) for key, values in sorted(store.items(), key=sort)]


monthly_summary = summarize_items(summaries, ["sourceMonth", "originalGroupCategory"], lambda x: x[0])
unit_summary = summarize_items(units, required_unit, lambda x: x[0])
location_keys = {unit_key(r) for r in raw_locations}
unit_keys = {unit_key(r) for r in unique_rows}

out = {
    "sourceTitle": "samcarlos/luftwaffe_locations, based on ww2.dk original Luftwaffe unit records",
    "sourceUrl": "https://github.com/samcarlos/luftwaffe_locations",
    "lossSourceCsvUrl": "https://github.com/samcarlos/luftwaffe_locations/blob/main/data/luftwaffe_sizes_losses.csv",
    "stationSourceCsvUrl": "https://github.com/samcarlos/luftwaffe_locations/blob/main/data/luftwaffe_locations.csv",
    "status": "RESEARCH-ONLY aggregate/quality audit, not approved for national totals or geospatial plotting",
    "samplingPeriod": "February 1942–December 1944 monthly, loss data only where original rows pass strict audit",
    "sourceStatementOnLocationAccuracy": "Original author says geocoding used approximations and, when location was unknown, prior station was sometimes carried forward; date is midpoint of reporting month.",
    "sourceRights": "This third-party GitHub repository has no obvious open data license. Original source CSVs are not bundled; this file provides derived aggregate audit metrics, not a raw database replica.",
    "inputCensus": {
        "lossSourceRows": len(raw_losses),
        "lossUniqueExactRows": len(unique_rows),
        "exactDuplicateLossRows": len(raw_losses) - len(unique_rows),
        "distinctRawUnitKeyStrings": len(unit_keys),
        "sourceRowsWithoutGroupCategory": sum(not x["group_type"].strip() for x in unique_rows),
        "distinctAircraftModelStrings": len({x["model"] for x in unique_rows}),
        "sourceMonths": sorted({x["date"] for x in unique_rows}),
        "stationSourceRows": len(raw_locations),
        "stationExactDuplicateRows": len(raw_locations)-len({tuple(x.items()) for x in raw_locations}),
        "stationDistinctFreeTextLabels": len({x["locations"] for x in raw_locations}),
        "stationRowsWithoutNumericCoordinates": sum(integer(x["lat"]) is None and not re.fullmatch(r"-?\d+(?:\.\d+)?", x["lat"].strip()) or not re.fullmatch(r"-?\d+(?:\.\d+)?", x["lon"].strip()) for x in raw_locations),
        "unitKeysInBothInputCollections": len(unit_keys & location_keys)
    },
    "sourceNumericCellIssuesByColumn": dict(sorted(loss_field_errors.items())),
    "strictExclusionsByReason": dict(sorted(strict_issues.items())),
    "strictAuditedRows": sum(s["auditedModelMonths"] for s in summaries.values()),
    "sourceRoleByMonthAggregate": monthly_summary,
    "unitGroupAggregateAcrossReportedMonths": unit_summary,
    "aggregationCautions": [
        "The word 'lost' describes a unit-account outflow; it includes transfers to other units and maintenance, NOT just destroyed aircraft.",
        "Enemy-caused lost_aircraft, accident outflow, maintenance and transfers are four distinct source categories, NOT independently verified incident counts.",
        "The dataset itself includes duplicated rows, nonnumeric source annotations, and mismatches of aircraft stock flow; only strictly reconciled unique rows contribute to numeric aggregates.",
        "Published model-level rows may refer to different organizational echelons or partially overlap; adding all unit rows is NOT a complete audited Luftwaffe wartime force/loss total.",
        "Unit aggregate covers 1942–44 only and is missing months/models whose original cells were malformed or did not reconcile; it is NOT a full lifetime loss history.",
        "Original unit keys containing empty/NA fields remain unchanged and must not be merged with neighboring similar number units.",
        "Coordinates are a secondary author's inferred approximations rather than verified wartime airfield coordinates; none are copied to this extract.",
        "Original month dates are display midpoints, not necessarily actual station arrival/departure or aircraft incident dates.",
        "Without explicit open license, avoid bundling the original derivative database or verbatim source descriptions. Archive links and this summary for research cross-checking."
    ]
}

path = Path(__file__).resolve().parents[1] / "research/transcriptions/luftwaffe-third-party-unit-loss-station-data-audit-1942-1944.json"
path.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n")
print("source unique", len(unique_rows), "strict numeric", out["strictAuditedRows"],
      "units", len(unit_summary), "monthly role buckets", len(monthly_summary),
      "location labels", out["inputCensus"]["stationDistinctFreeTextLabels"])
print("exclusion breakdown", json.dumps(out["strictExclusionsByReason"]))
