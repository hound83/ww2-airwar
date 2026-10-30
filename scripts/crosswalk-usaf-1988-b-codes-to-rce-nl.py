#!/usr/bin/env python3
"""Crosswalk 15 1945 British B-airfield reference codes to RCE historic Dutch phases.

This is a *source identity/name* candidate crosswalk, not proof of an RAF base
operating at an exact date, and not a station/unit/aircraft strength dataset.

Usage: python scripts/crosswalk-usaf-1988-b-codes-to-rce-nl.py b-codes.json rce.geojson output.json
"""

import argparse
import json
from collections import defaultdict
from pathlib import Path

NAMES = {
    "B-77": "Gilze-Rijen",
    "B-78": "Eindhoven",
    "B-79": "Woensdrecht",
    "B-80": "Volkel",
    "B-82": "Keent / Grave",
    "B-84": "De Rips",
    "B-85": "Schijndel",
    "B-86": "Helmond",
    "B-88": "Heesch",
    "B-89": "Mill",
    "B-91": "Malden / 'De Kluis'",
    "B-93": "Valkenburg",
    "B-95": "Teuge",
    "B-97": "Schiphol",
    "B-106": "Twente",
}


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("official_b_code_index", type=Path)
    p.add_argument("rce_historic_polygons", type=Path)
    p.add_argument("output", type=Path)
    args = p.parse_args()
    b = json.loads(args.official_b_code_index.read_text())
    rce = json.loads(args.rce_historic_polygons.read_text())
    rce_by_name = defaultdict(list)
    for feature in rce["features"]:
        rce_by_name[feature["properties"]["nameAsPublished"]].append(feature)
    dutch = [r for r in b["records"] if r["countryAsPrintedMapped"] == "Netherlands"]
    if {r["code"] for r in dutch} != set(NAMES):
        raise ValueError("The complete Dutch B-code index or manual name crosswalk changed")
    output_rows = []
    for item in dutch:
        matched = rce_by_name[NAMES[item["code"]]]
        if not matched:
            raise ValueError(f"RCE candidate not found for {item['code']}: {NAMES[item['code']]}")
        output_rows.append({
            "britishAirfieldCode": item["code"],
            "usafOriginalTablePrintedPage": item["originalTablePrintedPage"],
            "usaf1988OCRSiteName": item["siteNameOCRAsPrinted"],
            "candidateRceHistoricSiteName": NAMES[item["code"]],
            "rceHistoricalPhaseIds": [f["id"] for f in matched],
            "rceHistoricalPhaseYearsFromTo": [[f["properties"]["activeYearFromAsPublished"], f["properties"]["activeYearThroughAsPublished"]] for f in matched],
            "locationValidationStatus": "historical_airfield_name_candidate_only_NOT_verified_wartime_B_code_period",
        })

    output = {
        "status": "cross_source_map_research_candidate_not_operational_map_layer",
        "sourceOfficialAmerican1988": b["source"],
        "sourceRcePublicDomain": rce["source"],
        "indexAsOf": "1945-07-01",
        "atlasEndDate": "1945-05-09",
        "count": len(output_rows),
        "criticalCaveats": [
            "The source B-code reference date is 1 July 1945, 53 days after the Atlas's 9 May 1945 cutoff; some B-code allocations/airfield uses can be postwar.",
            "Original 1988 scan contains variant spellings and OCR artifacts (Woensdrecht, Valkenberg, Amsterdam/Schipol); matched site names are distinct original RCE evidence, not copied corrections to the USAF source.",
            "RCE historic polygons are phase-level infrastructure geometry, not coordinates proven to be the 1944–45 runway in use.",
            "Do not infer date, flying-unit occupancy, operator, serviceability or aircraft losses from a B-code/site crosswalk.",
        ],
        "records": output_rows,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Crosswalked {len(output_rows)} independent American B-code Dutch sites to RCE historic phase identities")


if __name__ == "__main__":
    main()
