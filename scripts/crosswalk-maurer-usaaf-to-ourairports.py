#!/usr/bin/env python3
"""Conservative candidate-only geocoding of USAAF group stations against OurAirports.

This script never claims OurAirports' current/closed airports existed or were
used by a given USAAF group in 1940-45. Exact normalized names and current
country merely produce leads for verifying the original dated station sites.
"""

import collections
import csv
import json
import re
import sys
import unicodedata
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE_MAURER = ROOT / "research/transcriptions/usaaf-maurer-public-domain-european-group-station-candidates-1940-1945.json"
DEST = ROOT / "research/transcriptions/usaaf-maurer-ourairports-conservative-station-geocoding-candidates-1940-1945.json"
REGION_COUNTRY = {
    "England": {"GB"},
    "France": {"FR"},
    "Italy": {"IT"},
    "Sicily": {"IT"},
    "Algeria": {"DZ"},
    "Tunisia": {"TN"},
    "Germany": {"DE"},
    "Belgium": {"BE"},
    "Egypt": {"EG"},
    "Holland": {"NL"},
    "Libya": {"LY"},
    "Luxembourg": {"LU"},
}


def normalize_name(name):
    name = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode("ascii").lower()
    name = re.sub(r"\b(?:raf|usaf|usaaf|aaf|air force|airbase|afb|airfield|aerodrome|airport|landing ground|air base|field)\b", " ", name)
    name = re.sub(r"[^a-z0-9]+", " ", name)
    return " ".join(name.split())


def main(ourairports_path):
    stations = json.loads(SOURCE_MAURER.read_text(encoding="utf-8"))
    assert stations["counts"]["candidatesWithPotentiallyWartimeStart"] == 544
    indexed_airfields = collections.defaultdict(list)
    total_ourairports = 0
    with open(ourairports_path, newline="", encoding="utf-8-sig") as stream:
        for airport in csv.DictReader(stream):
            total_ourairports += 1
            name = normalize_name(airport["name"])
            if name and airport["iso_country"] and airport["type"] not in {"heliport", "balloonport", "seaplane_base"}:
                indexed_airfields[(name, airport["iso_country"])].append(airport)

    unique_sites = {}
    for group in stations["groups"]:
        for event in group["europeMediterraneanStationCandidates"]:
            if not event["withinAtlasDateScopeCandidate"]:
                continue
            region = event["printedRegion"]
            place = event["printedAirfieldOrPlace"]
            key = (normalize_name(place), region)
            item = unique_sites.setdefault(key, {
                "siteNameAsPrintedSamples": set(),
                "printedRegion": region,
                "units": set(),
                "datedStationOccurrences": 0,
                "dateStringsAsPrinted": set(),
                "sourceFirstYears": set(),
            })
            item["siteNameAsPrintedSamples"].add(place)
            item["units"].add(group["unitName"])
            item["datedStationOccurrences"] += 1
            item["dateStringsAsPrinted"].add(event.get("printedDate", ""))
            if event["startDateCandidate"]:
                item["sourceFirstYears"].add(int(event["startDateCandidate"][:4]))

    results = []
    unmatched = []
    collisions = []
    for (key, region), item in sorted(unique_sites.items()):
        possible = []
        for country in REGION_COUNTRY.get(region, ()):
            possible.extend(indexed_airfields.get((key, country), []))
        original = {
            "stationNameAsPrinted": sorted(item["siteNameAsPrintedSamples"]),
            "regionAsPrinted": region,
            "unitLabels": sorted(item["units"]),
            "sourceStationEntryCountNotMissions": item["datedStationOccurrences"],
            "originalDateTokens": sorted(item["dateStringsAsPrinted"]),
            "sourceYears": sorted(item["sourceFirstYears"]),
        }
        if not possible:
            unmatched.append(original)
            continue
        matches = []
        for a in possible:
            try:
                latitude = float(a["latitude_deg"])
                longitude = float(a["longitude_deg"])
                if not (-90 <= latitude <= 90 and -180 <= longitude <= 180):
                    continue
            except (ValueError, TypeError):
                continue
            matches.append({
                "ourAirportsId": a["id"],
                "ourAirportsIdent": a["ident"],
                "currentName": a["name"],
                "currentType": a["type"],
                "modernCountryCode": a["iso_country"],
                "latitudeCandidate": latitude,
                "longitudeCandidate": longitude,
                "municipalityModern": a["municipality"],
                "sourceWikipediaLink": a["wikipedia_link"],
            })
        if len(matches) != 1:
            collisions.append({**original, "candidateMatches": matches})
            continue
        results.append({
            **original,
            "candidate": matches[0],
            "matchingRule": "exact normalized site name after removal of generic RAF/USAAF/airfield words + expected modern ISO country",
            "status": "PROVISIONAL_wartime_station_location_NOT_VERIFIED",
        })

    result = {
        "title": "USAAF Maurer dated station names to modern open OurAirports coordinate candidates",
        "sourceStationRegister": str(SOURCE_MAURER.relative_to(ROOT)),
        "publicDomainOurAirportsDownload": "https://davidmegginson.github.io/ourairports-data/airports.csv",
        "ourAirportsPublicDomainTerms": "https://ourairports.com/data/",
        "originalHistoricUSAAFSource": "https://www.ibiblio.org/hyperwar/AAF/AAFHS/AAFHS-140.1.pdf",
        "dateOfOurAirportsSnapshot": "2026-10-29",
        "method": "Station source string normalization and modern ISO country restriction; exact normalized name match only; 1-to-1 matches included, ambiguous/missing separately retained. No point is map-publication-ready.",
        "criticalCaveats": [
            "An OurAirports match proves only a modern/closed named airport location candidate, not that the identified historic USAAF group operated at the same point on its printed date.",
            "Modern country is a crosswalk heuristic, not wartime sovereign control; 1940s borders and battlefield geographies changed.",
            "Original Maurer candidate list is OCR-derived, may have ambiguous/corrupt names/dates, and post-war station entries are excluded by its research-only filters.",
            "Not matching is not proof that a WWII airfield never existed. Forgotten fields, Advanced Landing Grounds and wartime-only bases are especially likely to be absent from OurAirports.",
            "One place name can represent multiple historical airfields; matched candidates require an independent period map or official unit ORB before promotion.",
            "The source entry count here is number of group station references, NOT flights, operations or physical airfields.",
        ],
        "counts": {
            "OurAirportsRawWorldRows": total_ourairports,
            "MaurerCandidateSourceStationOccurrences": 544,
            "MaurerUniqueNormalizedPlaceAndRegionKeys": len(unique_sites),
            "singleExactNameCountryCoordinateCandidates": len(results),
            "ambiguousOrZeroCoordinateMatches": len(collisions),
            "unmatchedHistoricSiteNames": len(unmatched),
        },
        "provisionalCandidates": sorted(results, key=lambda x: (x["regionAsPrinted"], x["stationNameAsPrinted"][0])),
        "ambiguousNamesOrCoordinates": collisions,
        "unmatchedHistoricSiteNames": unmatched,
    }
    assert len(results) + len(collisions) + len(unmatched) == len(unique_sites)
    DEST.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(result["counts"], indent=2))
    print("Research only: " + str(DEST) + f" ({DEST.stat().st_size:,} bytes)")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Usage: crosswalk-maurer-usaaf-to-ourairports.py airports.csv")
    main(sys.argv[1])
