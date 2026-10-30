#!/usr/bin/env python3
"""Prepare reproducible research-only numeric transcripts from RKKA.es series 02.

Usage:
  python3 scripts/transcribe-rkka-strength-series.py INPUT_DIR OUTPUT_DIR

INPUT_DIR contains downloaded 02_01.html ... 02_22.html files. No network
access or optional dependencies are needed. This is a transcription of a
secondary Spanish-language presentation of historical Soviet compilations,
not an independently authenticated examination of the archival originals.

We preserve the original column cells/spans because their meanings and the
historical reporting universes vary materially across the 22 pages. Only the
1 June 1941 border-district regiment entries receive normalized fields.
"""

from __future__ import annotations

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path


BASE_URL = "https://www.rkka.es/Estadisticas/VVS_stat/02/"
SERIES = {
    1: ("VVS KA five border military districts, 1 June 1941", "soviet_vvs_ka", "1941-06-01"),
    2: ("VVS KA border military districts, June 1941", "soviet_vvs_ka", "1941-06"),
    3: ("Front air forces, 24 and 30 June 1941", "soviet_vvs_ka", "1941-06"),
    4: ("Front air forces, 1941 winter campaign", "soviet_vvs_ka", None),
    5: ("Front air forces, 1942 summer-autumn campaign", "soviet_vvs_ka", None),
    6: ("Air armies, 1942 German summer offensive", "soviet_vvs_ka", None),
    7: ("Air armies, start of second war period", "soviet_vvs_ka", None),
    8: ("Air armies, 1943 summer campaign", "soviet_vvs_ka", None),
    9: ("Air armies, 1943-44 winter campaign", "soviet_vvs_ka", None),
    10: ("Air armies, 1944 summer campaign", "soviet_vvs_ka", None),
    11: ("Air armies, beginning of European 1945 campaign", "soviet_vvs_ka", None),
    12: ("Air armies, end of Great Patriotic War", "soviet_vvs_ka", "1945-05"),
    13: ("Air armies, war against Japan", "soviet_vvs_ka", "1945-08"),
    14: ("Long Range Aviation ADD/DA, unit and strength snapshots", "soviet_add", "1941-1945"),
    15: ("PVO air-defence fighters, unit and strength snapshots", "soviet_pvo", "1941-1945"),
    16: ("Naval Aviation VMF, organization snapshots", "soviet_vmf", "1941-1945"),
    17: ("Naval Aviation VMF, strength and trained crews", "soviet_vmf", "1941-1945"),
    18: ("Civil Air Fleet, strength and formation snapshots", "soviet_civil_air_fleet", "1941-1945"),
    19: ("Luftwaffe organization by theater", "german_luftwaffe", "1941-1945"),
    20: ("Luftwaffe aggregate fleet at invasion of USSR", "german_luftwaffe", "1941-06"),
    21: ("Luftwaffe aircraft deployed on German-Soviet front", "german_luftwaffe", "1941-1945"),
    22: ("German allied air forces deployed on Soviet front", "axis_allies", "1941-1945"),
}


class TableAndPageText(HTMLParser):
    """Preserve HTML cell span structure and visible text without copied markup."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.table_depth = 0
        self.found_first_table = False
        self.in_row = False
        self.cell = None
        self.row = None
        self.rows = []
        self.text = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "table":
            if not self.found_first_table:
                self.found_first_table = True
                self.table_depth = 1
            elif self.table_depth:
                self.table_depth += 1
        elif tag == "tr" and self.table_depth == 1:
            self.in_row = True
            self.row = []
        elif tag in ("td", "th") and self.in_row and self.cell is None:
            self.cell = {
                "text": [],
                "colspan": max(1, int(attrs.get("colspan", "1"))),
                "rowspan": max(1, int(attrs.get("rowspan", "1"))),
            }

    def handle_data(self, data):
        self.text.append(data)
        if self.cell is not None:
            self.cell["text"].append(data)

    def handle_endtag(self, tag):
        if tag in ("td", "th") and self.cell is not None:
            cell = {
                "value": " ".join("".join(self.cell["text"]).split()),
            }
            if self.cell["colspan"] != 1:
                cell["colspan"] = self.cell["colspan"]
            if self.cell["rowspan"] != 1:
                cell["rowspan"] = self.cell["rowspan"]
            self.row.append(cell)
            self.cell = None
        elif tag == "tr" and self.in_row:
            if self.row:
                self.rows.append(self.row)
            self.in_row = False
            self.row = None
        elif tag == "table" and self.table_depth:
            self.table_depth -= 1


def source_number(value):
    """Parse an unambiguous printed integer; NEVER treat dash or blank as zero."""
    if re.fullmatch(r"\d[\d\s\u00a0]*", value or ""):
        return int("".join(value.split()))
    return None


def parse_page(path, n):
    parser = TableAndPageText()
    parser.feed(path.read_bytes().decode("cp1251", errors="replace"))
    if len(parser.rows) < 6:
        raise ValueError(f"Unexpected table row count in {path}: {len(parser.rows)}")
    content = " ".join(" ".join(parser.text).split())
    # A concise archival provenance reference, not a republication of the prose.
    citation = re.search(r"(?:Fuente|Fuentes)\s*:\s*(.{4,260}?)(?=Simbolog[ií]a\s*:|\bNotas\s*:|\bATRAS\b|$)", content, re.I)
    archival_note = citation.group(1).strip()[:240] if citation else None
    title, formation, dates = SERIES[n]
    return {
        "id": f"RKKA-VVS-02-{n:02d}",
        "topic": title,
        "formationOrForce": formation,
        "dateScopeIndex": dates,
        "atlasEuropeanScope": "excluded_far_eastern_august_1945" if n == 13 else ("requires_theater_filter" if n == 19 else "candidate_european"),
        "sourceUrl": f"{BASE_URL}02_{n:02d}.htm",
        "sourceClass": "secondary_spanish_transcription_of_historical_soviet_staff_material",
        "archiveReferenceAsPrinted": archival_note,
        "reviewStatus": "research_only_unchecked_against_original_archives",
        "nullConvention": "Blank or dash is preserved exactly; neither implies a measured zero.",
        "columnWarning": "These pages use nonuniform column widths/rowspans; align only after reading their specific headers and footnotes.",
        "rows": [
            {"sourceRow": i + 1, "cells": row}
            for i, row in enumerate(parser.rows)
        ],
    }


def district_units(page):
    """Normalize only regiment aircraft rows from five districts (not ADD)."""
    districts = []
    district = None
    division = None
    regiment = None
    regiment_airfield = None
    unit_records = []
    division_headquarters = []
    district_reported_totals = {}
    records_by_regiment = {}
    for row in page["rows"]:
        cells = [cell["value"] for cell in row["cells"]]
        row_id = row["sourceRow"]
        if len(cells) == 1 and cells[0].startswith("Circunscripcion militar"):
            district = cells[0]
            districts.append(district)
            division = regiment = regiment_airfield = None
            continue
        if district is None:
            continue
        if len(cells) == 1 and "Aviación de Largo Alcance" in cells[0]:
            break
        if not cells:
            continue
        # Some source rows contain a leading blank because a division's
        # first cell spans multiple regiments. The source values have distinct
        # physical positions in these cases; do not shift numeric columns.
        shifted = bool(len(cells) >= 13 and not cells[0] and re.match(r"^\d+\s+", cells[1]))
        possible_label = cells[1] if shifted else cells[0]
        if re.match(r"^\d+\s+(?:sad|iad|bad|shad|ad)\*?$", possible_label, re.I):
            division = possible_label
            regiment = regiment_airfield = None
            # Headquarters aircraft appear in their own row, separate from
            # regiment rows. Without these 46 aircraft the five official
            # district subtotals do not reconcile.
            if len(cells) >= 6:
                base = 1 if shifted else 0
                division_headquarters.append({
                    "districtAsReported": district,
                    "divisionAsReported": division,
                    "headquartersLocationAsReported": cells[base + 2] if len(cells) > base + 2 else None,
                    "aircraftTypeAsReported": cells[base + 3] if len(cells) > base + 3 else None,
                    "aircraftTotal": source_number(cells[base + 4]) if len(cells) > base + 4 else None,
                    "aircraftInoperative": source_number(cells[base + 5]) if len(cells) > base + 5 else None,
                    "sourceRow": row_id,
                })
            continue
        is_regiment = bool(re.match(r"^\d+\s+(?:[a-z]*ap\*?(?:\s+de\s+reserva)?)$", possible_label, re.I))
        is_continuation = (
            regiment is not None
            and not is_regiment
            and (
                (len(cells) == 10 and source_number(cells[1]) is not None)
                or (len(cells) == 11 and source_number(cells[2]) is not None and not cells[0].lower().startswith(("total", "dotados")))
                or (len(cells) == 12 and not cells[0] and not cells[1] and source_number(cells[3]) is not None)
            )
        )
        if is_regiment:
            base = 1 if shifted else 0
            if len(cells) < base + 5:
                continue
            regiment = possible_label
            regiment_airfield = cells[base + 1]
            airfield = regiment_airfield
            type_name = cells[base + 2]
            total, unserviceable = source_number(cells[base + 3]), source_number(cells[base + 4])
            raw_total, raw_unserviceable = cells[base + 3], cells[base + 4]
        elif is_continuation:
            # The HTML rowspans used to suppress duplicate regiment/airfield
            # cells produce 10-, 11- and 12-cell continuation records.
            # Only interpret rows with a numeric aircraft total at that offset.
            offset = {10: 0, 11: 1, 12: 2}[len(cells)]
            airfield = (cells[0] if offset == 1 else "") or regiment_airfield
            type_name = cells[offset]
            raw_total, raw_unserviceable = cells[offset + 1], cells[offset + 2]
            total, unserviceable = source_number(raw_total), source_number(raw_unserviceable)
        else:
            if cells[0].startswith("Total VVS en la Circunscripcion militar"):
                district_reported_totals[district] = {
                    "aircraftTotal": source_number(cells[2]),
                    "aircraftInoperative": source_number(cells[3]),
                    "sourceRow": row_id,
                }
                regiment = regiment_airfield = None
            continue
        if not type_name or type_name == "-":
            continue
        if total is not None and unserviceable is not None and unserviceable > total:
            raise ValueError(f"Inoperative > total at source row {row_id}: {cells}")
        record = {
            "districtAsReported": district,
            "divisionAsReported": division,
            "regimentAsReported": regiment,
            "airfieldAsReported": airfield,
            "aircraftTypeAsReported": type_name,
            "aircraftTotal": total,
            "aircraftInoperative": unserviceable,
            "aircraftOperationalDerived": total - unserviceable if total is not None and unserviceable is not None else None,
            "printedRawTotal": raw_total,
            "printedRawInoperative": raw_unserviceable,
            "sourceRow": row_id,
            "aircraftTypeContinuation": bool(is_continuation and not is_regiment),
        }
        unit_records.append(record)
        records_by_regiment.setdefault((district, regiment), []).append(record)

    reconciliation = []
    for listed_district in districts:
        reported = district_reported_totals.get(listed_district)
        if reported is None:
            raise ValueError(f"No published district total: {listed_district}")
        regiments = [r for r in unit_records if r["districtAsReported"] == listed_district]
        headquarters = [r for r in division_headquarters if r["districtAsReported"] == listed_district]
        aircraft_from_regiments = sum(r["aircraftTotal"] or 0 for r in regiments)
        aircraft_from_headquarters = sum(r["aircraftTotal"] or 0 for r in headquarters)
        inoperative_from_regiments = sum(r["aircraftInoperative"] or 0 for r in regiments)
        inoperative_from_headquarters = sum(r["aircraftInoperative"] or 0 for r in headquarters)
        if (aircraft_from_regiments + aircraft_from_headquarters != reported["aircraftTotal"]
                or inoperative_from_regiments + inoperative_from_headquarters != reported["aircraftInoperative"]):
            raise ValueError(f"District reconciliation failed: {listed_district}")
        reconciliation.append({
            "districtAsReported": listed_district,
            "sourcePrinted": reported,
            "sumRegimentAircraft": aircraft_from_regiments,
            "sumHeadquartersAircraft": aircraft_from_headquarters,
            "sumRegimentInoperative": inoperative_from_regiments,
            "sumHeadquartersInoperative": inoperative_from_headquarters,
            "derivedOperational": reported["aircraftTotal"] - reported["aircraftInoperative"],
            "arithmeticMatchesSource": True,
        })

    return {
        "id": "RKKA-VVS-02-01-REGIMENTS",
        "sourceUrl": page["sourceUrl"],
        "sourceClass": page["sourceClass"],
        "originalArchiveReferenceAsPrinted": page["archiveReferenceAsPrinted"],
        "date": "1941-06-01",
        "force": "Soviet VVS KA border district formations",
        "scopeNote": "Five western border districts; the separate Long-Range Aviation block in the source is excluded. Headquarters, reserve totals and military district summaries are not counted as regiments.",
        "airfieldWarning": "Original historical transliterations may refer to multiple sites, changes of location or headquarters; these are strings, not verified geographic coordinates.",
        "columnInterpretationFromSourceFootnote": {
            "I": "All combat aircraft (total inventory)",
            "II": "Inoperative combat aircraft (subset of I)",
            "operationalDerived": "I minus II only when both printed counts are unambiguous; not necessarily airborne or combat-ready",
            "sourceDash": "The footnote says a hyphen means absence; retained as a non-numeric marker to avoid changing missing/absent semantics in derived fields",
        },
        "districtsAsReported": districts,
        "distinctRegiments": len(records_by_regiment),
        "aircraftTypeRows": len(unit_records),
        "rowsWithBothCounts": sum(1 for r in unit_records if r["aircraftOperationalDerived"] is not None),
        "headquartersRows": len(division_headquarters),
        "headquartersRecords": division_headquarters,
        "districtReconciliation": reconciliation,
        "publishedAllFiveDistrictsReconciled": {
            "totalAircraft": sum(row["sourcePrinted"]["aircraftTotal"] for row in reconciliation),
            "inoperativeAircraft": sum(row["sourcePrinted"]["aircraftInoperative"] for row in reconciliation),
            "derivedOperationalAircraft": sum(row["derivedOperational"] for row in reconciliation),
        },
        "totalsOverParsedRegimentsOnly": {
            "totalAircraftKnownRows": sum(r["aircraftTotal"] or 0 for r in unit_records),
            "inoperativeAircraftKnownRows": sum(r["aircraftInoperative"] or 0 for r in unit_records),
            "operationalAircraftCompleteRowsOnly": sum(r["aircraftOperationalDerived"] or 0 for r in unit_records),
            "notNationalTotals": True,
        },
        "records": unit_records,
    }


def main():
    if len(sys.argv) != 3:
        raise SystemExit("Usage: transcribe-rkka-strength-series.py INPUT_DIR OUTPUT_DIR")
    source_dir, output_dir = map(Path, sys.argv[1:])
    output_dir.mkdir(parents=True, exist_ok=True)
    pages = []
    for n in sorted(SERIES):
        page = parse_page(source_dir / f"02_{n:02d}.html", n)
        pages.append(page)
        destination = output_dir / f"rkka-vvs-strength-02-{n:02d}.json"
        destination.write_text(json.dumps(page, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    normalized = district_units(pages[0])
    dest = output_dir / "rkka-vvs-1941-border-district-regiments.json"
    dest.write_text(json.dumps(normalized, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Transcribed {len(pages)} source pages, {sum(len(p['rows']) for p in pages)} source rows")
    print(f"Normalized {normalized['distinctRegiments']} regiments, {normalized['aircraftTypeRows']} aircraft type rows")
    print(json.dumps(normalized["totalsOverParsedRegimentsOnly"], indent=2))


if __name__ == "__main__":
    main()
