#!/usr/bin/env python3
"""Preserve public-domain RCE Dutch historic airfield footprint phases for 1936–45.

Input: entire RCE `landschapsatlas:vliegvelden` GeoJSON WFS export, e.g.:
https://services.rce.geovoorziening.nl/landschapsatlas/wfs?service=WFS&request=GetFeature&version=2.0.0&typeNames=landschapsatlas:vliegvelden&outputFormat=application/json&srsName=EPSG:4326&count=500

Usage: python scripts/extract-rce-historic-dutch-airfields.py original.geojson output.geojson
This is a *research candidate* map layer. Historical start/end years do not prove
daily wartime operating status, unit stations, aircraft strength, or runway use.
"""

import argparse
import json
from collections import Counter
from pathlib import Path

RESEARCH_START = 1936
RESEARCH_END = 1945
SOURCE_URL = "https://data.overheid.nl/dataset/81058-vliegvelden-in-nederland"
WFS_URL = "https://services.rce.geovoorziening.nl/landschapsatlas/wfs"
NIMH_URL = "https://www.nimh.nl/militaire-geschiedenis-van-nederland/historische-overzichten/vliegvelden-in-oorlogstijd"
NIMH_SELECTED_AIRFIELDS = [
    "Beek", "Bergen", "Buiksloot", "De Kluis", "De Kooy", "De Mok",
    "De Rips", "De Vlijt", "Deelen", "Eelde", "Eindhoven", "Gilze-Rijen",
    "Grave", "Haamstede", "Havelte", "Heesch", "Helmond", "Hilversum",
    "Leeuwarden", "Mill", "Peest", "Schellingwoude", "Schijndel",
    "Schiphol", "Soesterberg", "Teuge", "Valkenburg", "Venlo",
    "Vlissingen", "Volkel", "Waalhaven", "Woensdrecht", "Ypenburg",
]


def coordinate_pairs(geometry):
    typ = geometry["type"]
    if typ == "Polygon":
        for ring in geometry["coordinates"]:
            yield from ring
    elif typ == "MultiPolygon":
        for polygon in geometry["coordinates"]:
            for ring in polygon:
                yield from ring
    else:
        raise ValueError(f"Unexpected airfield geometry: {typ}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, help="Unaltered complete RCE GeoJSON WFS response")
    parser.add_argument("output", type=Path, help="Destination filtered RFC7946 GeoJSON")
    args = parser.parse_args()

    source = json.loads(args.source.read_text(encoding="utf-8"))
    if source["type"] != "FeatureCollection":
        raise ValueError("RCE download was not a FeatureCollection")
    features = []
    for feature in source["features"]:
        p = feature["properties"]
        start, end = p.get("actief_van"), p.get("actief_tot")
        if not isinstance(start, int) or not isinstance(end, int):
            continue
        if start > RESEARCH_END or end < RESEARCH_START:
            continue
        if start > end:
            raise ValueError(f"Historical year inversion in {feature['id']}: {start}–{end}")

        geometry = feature["geometry"]
        coordinates = list(coordinate_pairs(geometry))
        # EPSG:4326 in WFS 2.0 can be latitude-first. RCE's GeoJSON output,
        # checked against Alkmaardermeer and Schiphol, is already [lon, lat].
        # Fail closed if an updated service reverses axes or returns projected CRS.
        if not coordinates or any(not (3 <= x <= 8 and 50 <= y <= 54) for x, y, *extra in coordinates):
            raise ValueError(f"Unexpected lon/lat order or outside NL: {feature['id']}")
        west = min(v[0] for v in coordinates)
        east = max(v[0] for v in coordinates)
        south = min(v[1] for v in coordinates)
        north = max(v[1] for v in coordinates)
        features.append({
            "type": "Feature",
            "id": feature["id"],
            "properties": {
                "rceFeatureId": feature["id"],
                "nameAsPublished": p.get("naam"),
                "historicalInfrastructureTypeAsPublished": p.get("type"),
                "historicalUseAsPublished": p.get("gebruik"),
                "runwaySurfaceAsPublished": p.get("type_baan"),
                "icaoAsPublished": p.get("icao_code"),
                "iataAsPublished": p.get("iata_code"),
                "activeYearFromAsPublished": start,
                "activeYearThroughAsPublished": end,
                "overlapsAtlasYears": [max(start, RESEARCH_START), min(end, RESEARCH_END)],
                "approximateBoundingBoxCenterLonLat": [round((west + east) / 2, 6), round((south + north) / 2, 6)],
                "mapStatus": "historical_footprint_phase_unvalidated_for_exact_dates_and_units",
            },
            "geometry": geometry,
        })

    features.sort(key=lambda f: (f["properties"]["nameAsPublished"].lower(), f["properties"]["activeYearFromAsPublished"], f["id"]))
    names = {f["properties"]["nameAsPublished"] for f in features}
    normalized = {n.casefold() for n in names}
    matched = [n for n in NIMH_SELECTED_AIRFIELDS if n.casefold() in normalized or (
        n == "De Kluis" and "Malden / 'De Kluis'" in names
    ) or (n == "Grave" and "Keent / Grave" in names)]
    missing = [n for n in NIMH_SELECTED_AIRFIELDS if n not in matched]

    output = {
        "type": "FeatureCollection",
        "name": "RCE Netherlands historic airfield landscape polygons, overlapping Atlas 1936–1945",
        "source": {
            "owner": "Rijksdienst voor het Cultureel Erfgoed (Netherlands)",
            "dataset": SOURCE_URL,
            "service": WFS_URL,
            "typeName": "landschapsatlas:vliegvelden",
            "license": "Publiek domein (public domain), as listed by Dutch government open data",
            "geometryCoordinateOrder": "longitude, latitude (GeoJSON / EPSG:4326)",
            "rawFeaturesAllEras": len(source["features"]),
            "filter": "actief_van <= 1945 and actief_tot >= 1936",
        },
        "audit": {
            "historicalFootprintPhases": len(features),
            "distinctNamesAsPublished": len(names),
            "geometryTypes": dict(sorted(Counter(f["geometry"]["type"] for f in features).items())),
            "nimhIndependentWartimeAirfieldList": {
                "url": NIMH_URL,
                "listedSites": len(NIMH_SELECTED_AIRFIELDS),
                "exactOrExplicitAliasNameMatches": matched,
                "unmatchedListNames": missing,
                "warning": "NIMH selected website list is not an exhaustive list; exact name match is NOT verified station identity, and NIMH's 1940–45 scope differs from this 1936–45 filter.",
            },
            "warnings": [
                "191 RCE features span all historical eras; 1936–1945 filter returns phased footprints, NOT a count of active WWII airbases.",
                "Multiple polygons and time phases may describe one site; do not sum all phases as different airfields.",
                "Year-only start/end fields do not confirm site operational on a specific day or even month of a partial year.",
                "Historical polygons are infrastructure extent, not exact wartime runway, aircraft position, command assignment, or air operations.",
                "Approximate bounding-box centers are for geographic discovery and may lie outside irregular or multipart site footprints.",
                "Modern ICAO/IATA values may be retrospective and MUST NOT be assumed to apply in a 1940–45 view.",
            ],
        },
        "features": features,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(output, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"RCE historic phases: {len(features)}; distinct names: {len(names)}; independent NIMH website list: {len(matched)}/33 name matches; missing: {missing}")


if __name__ == "__main__":
    main()
