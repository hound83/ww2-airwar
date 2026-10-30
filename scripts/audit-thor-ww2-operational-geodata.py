#!/usr/bin/env python3
"""Audit original 2013 US Air Force THOR WW2 CSV without republishing it.

Usage: python scripts/audit-thor-ww2-operational-geodata.py /path/to/THOR_WW2.zip

Rows in THOR are *records*, not independent aircraft sorties. This intentionally
does not add attacking aircraft or aircraft lost across the entire row population.
"""

import collections
import csv
import datetime as dt
import io
import json
import math
import sys
import zipfile
from pathlib import Path


OUTPUT = Path(__file__).resolve().parents[1] / "research/transcriptions/thor-usaf-original-ww2-eto-mto-record-and-map-coverage-audit.json"
NULLS = {"", "NULL", "N/A", "UNKNOWN", "NONE", "-"}


def clean(value):
    value = str(value or "").strip()
    return None if value.upper() in NULLS else value


def number(value):
    value = clean(value)
    if value is None:
        return None
    try:
        result = float(value.replace(",", ""))
    except ValueError:
        return None
    return result if math.isfinite(result) else None


def coord(lat, lon):
    lat = number(lat)
    lon = number(lon)
    if lat is None or lon is None or not (-90 <= lat <= 90 and -180 <= lon <= 180):
        return None
    if lat == 0 and lon == 0:
        return None
    return (round(lat, 5), round(lon, 5))


def sorted_counts(counter):
    return dict(sorted(counter.items(), key=lambda x: (-x[1], x[0])))


def main(archive):
    total = collections.Counter()
    theatre = collections.Counter()
    flying = collections.Counter()
    date_by_year = collections.Counter()
    by_year_and_theatre = collections.Counter()
    by_force = collections.Counter()
    target_countries = collections.Counter()
    air_force = collections.Counter()
    duplicate_flag = collections.Counter()
    base_observations = {}
    target_observations = {}
    observed_units = set()
    invalid_dates = collections.Counter()
    invalid_dates_theater = collections.Counter()
    row_warnings = []
    with zipfile.ZipFile(archive) as zip_file:
        assert len(zip_file.namelist()) == 1, "Expected exactly one THOR CSV"
        with io.TextIOWrapper(zip_file.open(zip_file.namelist()[0]), encoding="utf-8-sig", errors="replace", newline="") as stream:
            reader = csv.DictReader(stream)
            expected = {"Theater", "Year", "Month", "Day", "Lat", "Lon", "Source_Launch_Base", "Source_Launch_Base_Lat", "Source_Launch_Base_Long", "Sortie_Dupe"}
            assert expected.issubset(set(reader.fieldnames)), "Input field list differs from original 2013 THOR"
            for row in reader:
                total["allRecordsInOriginalFile"] += 1
                period = clean(row.get("Theater")) or "unspecified"
                theatre[period] += 1
                flying_name = clean(row.get("Country_Flying_Mission")) or "unspecified"
                flying[flying_name] += 1
                year = clean(row.get("Year"))
                date_by_year[year or "unspecified"] += 1
                try:
                    date = dt.date(int(year), int(row["Month"]), int(row["Day"]))
                except (ValueError, TypeError):
                    invalid_dates[year or "unspecified"] += 1
                    invalid_dates_theater[period] += 1
                    continue
                if period not in {"ETO", "MTO"}:
                    continue
                if not dt.date(1936, 1, 1) <= date <= dt.date(1945, 5, 9):
                    total["ETO_MTO_outsideAtlasEnd"] += 1
                    continue
                total["ETO_MTO_1936_to_1945_05_09_records"] += 1
                key_year = str(date.year)
                by_year_and_theatre[(period, key_year)] += 1
                by_force[(period, flying_name)] += 1
                target_countries[(period, clean(row.get("Country_Name")) or "unspecified")] += 1
                naf = clean(row.get("NAF")) or "unspecified"
                air_force[(period, flying_name, naf)] += 1
                duplicate_flag[clean(row.get("Sortie_Dupe")) or "unmarked"] += 1
                tgt = coord(row.get("Lat"), row.get("Lon"))
                if tgt:
                    total["ETO_MTO_validTargetLatLon_records"] += 1
                    target_name = clean(row.get("Location_Name")) or "unspecified"
                    target_key = (period, target_name, tgt)
                    entry = target_observations.setdefault(target_key, {"records": 0, "yearFirst": date.year, "yearLast": date.year})
                    entry["records"] += 1
                    entry["yearFirst"] = min(entry["yearFirst"], date.year)
                    entry["yearLast"] = max(entry["yearLast"], date.year)
                unit = clean(row.get("Unit_ID"))
                if unit:
                    total["ETO_MTO_nonemptyUnit_records"] += 1
                    observed_units.add((period, flying_name, unit))
                base_name = clean(row.get("Source_Launch_Base"))
                base_coord = coord(row.get("Source_Launch_Base_Lat"), row.get("Source_Launch_Base_Long"))
                if base_name:
                    total["ETO_MTO_namedTakeoffBase_records"] += 1
                if base_coord:
                    total["ETO_MTO_validTakeoffBaseLatLon_records"] += 1
                if base_name and base_coord:
                    total["ETO_MTO_namedGeocodedTakeoffBase_records"] += 1
                    k = (period, base_name, base_coord)
                    item = base_observations.setdefault(k, {
                        "records": 0, "yearFirst": date.year, "yearLast": date.year,
                        "forces": collections.Counter(), "numberedAirForces": collections.Counter(),
                        "unitLabels": collections.Counter(), "takeoffCountriesAsPrinted": collections.Counter(),
                    })
                    item["records"] += 1
                    item["yearFirst"] = min(item["yearFirst"], date.year)
                    item["yearLast"] = max(item["yearLast"], date.year)
                    item["forces"][flying_name] += 1
                    item["numberedAirForces"][naf] += 1
                    if unit:
                        item["unitLabels"][unit] += 1
                    item["takeoffCountriesAsPrinted"][clean(row.get("Source_Launch_Base_Country")) or "unspecified"] += 1
                for field, count_name in (("Total_AC_Lost", "records_with_own_aircraft_loss_value"),
                                          ("Total_AC_Damaged", "records_with_own_aircraft_damaged_value"),
                                          ("Attacking_AC", "records_with_attacking_aircraft_value"),
                                          ("Number_of_AC_Dropping_Bombs", "records_with_bomb_dropping_aircraft_value")):
                    if number(row.get(field)) is not None:
                        total[count_name] += 1
                if len(row_warnings) < 10 and not tgt and base_coord:
                    row_warnings.append({"recordId": row.get("id"), "reason": "takeoff field geocoded, target position missing"})

    base_list = []
    for (period, name, (lat, lon)), item in base_observations.items():
        base_list.append({
            "theater": period, "nameAsPrinted": name, "latCandidate": lat, "lonCandidate": lon,
            "sourceRecordCountNotSorties": item["records"], "firstYear": item["yearFirst"],
            "lastYear": item["yearLast"], "airForcesRecorded": sorted_counts(item["forces"]),
            "numberedAirForces": sorted_counts(item["numberedAirForces"]),
            "unitLabelsAsPrinted": sorted_counts(item["unitLabels"]),
            "takeoffCountriesAsPrinted": sorted_counts(item["takeoffCountriesAsPrinted"]),
            "status": "research_candidate_needs_station_identity_and_date_validation",
        })
    base_list.sort(key=lambda item: (-item["sourceRecordCountNotSorties"], item["nameAsPrinted"]))
    target_examples = sorted(({
        "theater": period, "nameAsPrinted": name, "latCandidate": lat, "lonCandidate": lon,
        "sourceRecordCountNotSorties": item["records"], "firstYear": item["yearFirst"],
        "lastYear": item["yearLast"],
    } for (period, name, (lat, lon)), item in target_observations.items()),
        key=lambda item: (-item["sourceRecordCountNotSorties"], item["nameAsPrinted"]))
    result = {
        "title": "Original THOR WW2 2013 ETO/MTO record and map-data audit",
        "source": "https://www.generalstaff.org/THOR/THOR_WW2.zip",
        "origin": "US Air Force Research Institute Theater History of Operations Reports, original United States Strategic Bombing Survey and AAF Evaluation Board records; rehosted 2013-07-31 CSV",
        "dataDictionary": "https://programminghistorian.org/assets/visualizing-with-bokeh/THOR-draft-data-dictionary-dec-2016.pdf",
        "reuseStatus": "Research-derived metadata, counts, and map coordinate candidates from US government original compilation; full raw CSV not committed",
        "timeWindow": "1936-01-01 through 1945-05-09 inclusive, only ETO/MTO rows",
        "criticalSemantics": [
            "Each source CSV row describes a record, not necessarily a unique sortie or mission; one aircraft striking multiple targets or dropping multiple weapon types can generate multiple records.",
            "This audit NEVER sums attacking aircraft, own losses, claims, or bomb tonnage over all rows; source de-duplication rules and null Sortie_Dupe values need more work.",
            "Target lat/lon may be intended target or approximate documented position rather than observed bomb impact; do not draw as exact explosion footprint.",
            "Takeoff-base lat/lon are candidates for map pins; each original printed name, place, wartime year and military unit requires independent historical station validation.",
            "ETO/MTO includes Mediterranean targets outside Europe; country filtering and time/operation context must precede Europe-only Atlas numbers.",
            "US/RAF bombing-source coverage is extensive but incomplete in RAF MTO; German, Soviet, Italian, Finnish and other-force mission populations are not comprehensively covered.",
            "Loss and aircraft-count fields are sparse and not reliable national rollups from a raw record count. A loss field may relate to a group mission, not an individual bomber row.",
            "Year and theatre time coverage must be treated separately from military airforce/geographical coverage; absence of records is not zero activity.",
        ],
        "allOriginalRecords": total["allRecordsInOriginalFile"],
        "globalSourceCountsByTheater": sorted_counts(theatre),
        "globalSourceCountsByFlyingCountryLabel": sorted_counts(flying),
        "globalSourceCountsByYear": sorted_counts(date_by_year),
        "invalidDatesByYear": sorted_counts(invalid_dates),
        "invalidDatesByTheater": sorted_counts(invalid_dates_theater),
        "selectedRecordFieldCounts": dict(total),
        "selectedETO_MTORecordsByYearAndTheater": [{"theater": p, "year": int(y), "records": n} for (p, y), n in sorted(by_year_and_theatre.items())],
        "selectedRecordsByFlyingForce": [{"theater": p, "forceAsPrinted": f, "records": n} for (p, f), n in sorted(by_force.items())],
        "selectedRecordsByForceAndNumberedAirForce": [{"theater": p, "forceAsPrinted": f, "numberedAirForce": n, "records": v} for (p, f, n), v in sorted(air_force.items())],
        "selectedTargetCountriesByTheater": [{"theater": p, "targetCountryAsPrinted": c, "records": v} for (p, c), v in sorted(target_countries.items())],
        "sortieDupeFlags": sorted_counts(duplicate_flag),
        "distinctRawUnitLabels": len(observed_units),
        "distinctGeocodedTakeoffBaseNameCoordinateTriples": len(base_list),
        "distinctGeocodedTargetNameCoordinateTriples": len(target_observations),
        "takeoffBaseCandidates": base_list,
        "targetLocationCandidates": target_examples,
        "validation": "candidate_geocodes_only; no coordinates promoted to public map without dated corroboration",
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({k: result[k] for k in (
        "allOriginalRecords", "globalSourceCountsByTheater", "selectedRecordFieldCounts",
        "sortieDupeFlags", "distinctRawUnitLabels", "distinctGeocodedTakeoffBaseNameCoordinateTriples",
        "distinctGeocodedTargetNameCoordinateTriples")}, indent=2))
    print(f"Written: {OUTPUT} ({OUTPUT.stat().st_size:,} bytes)")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Usage: audit-thor-ww2-operational-geodata.py THOR_WW2.zip")
    main(sys.argv[1])
