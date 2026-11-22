#!/usr/bin/env python3
"""Preserve Soviet PVO and long-range (DA/ADD) unit strength returns separately.

Source tables are archival-derived Spanish transcriptions. In the source HTML,
nominal aircraft and the unserviceable denominator of the same printed cell
were flattened into adjacent JSON cells. The denominator is NOT a second force.
"""
import json
import re
from pathlib import Path

directory = Path(__file__).resolve().parents[1] / "research/transcriptions/rkka-strength-02"
months = {"enero": 1, "febrero": 2, "marzo": 3, "abril": 4,
          "mayo": 5, "junio": 6, "julio": 7, "agosto": 8,
          "septiembre": 9, "octubre": 10, "noviembre": 11, "diciembre": 12}


def numeric(raw):
    stripped = re.sub(r"\{\d+\}", "", raw).strip()
    return int(stripped) if re.fullmatch(r"\d+", stripped) else None


def is_heading(cells):
    return bool(cells and cells[0] and (len(cells) == 1 or all(not c for c in cells[1:])))


def dated_heading(heading, prior_year):
    clean = re.sub(r"\{\d+\}", "", heading.lower())
    m = re.search(r"(\d{1,2})\s+de\s+(" + "|".join(months) + r")", clean)
    if not m:
        raise ValueError("No calendar date in heading: " + heading)
    day, month = int(m.group(1)), months[m.group(2)]
    explicit = re.search(r"\b(?:19\d{2})\b", clean[m.end():])
    if explicit:
        year = int(explicit.group())
    else:
        years = [int(y) for y in re.findall(r"\b19\d{2}\b", clean)]
        if len(years) >= 2 and month >= 10:
            year = years[0]  # e.g. the December 1941 campaign named 1941–42
        elif years:
            year = years[-1]
        elif prior_year:
            year = prior_year
        else:
            raise ValueError("No year in heading or context: " + heading)
    return f"{year:04d}-{month:02d}-{day:02d}", year


def normalize_pvo():
    raw = json.loads((directory / "rkka-vvs-strength-02-15.json").read_text())
    result, exceptions = [], []
    date = previous_year = heading = None
    block_index = -1
    for row in raw["rows"][2:]:
        cells = [v["value"] for v in row["cells"]]
        if is_heading(cells):
            heading = cells[0]
            date, previous_year = dated_heading(heading, previous_year)
            block_index += 1
            continue
        if len(cells) == 14:
            # These rows omit the *whole* location cell, not merely its value.
            cells.insert(2, "")
        if len(cells) != 15:
            exceptions.append({"sourceRow": row["sourceRow"], "issue": "unexpected_column_count", "count": len(cells)})
            continue
        if not cells[1] and not cells[2]:
            continue
        if cells[2].strip().lower() == "total":
            category = "source_total"
        elif "retaguardia" in cells[1].lower():
            category = "aggregated_rear_area_units"
        else:
            category = "named_unit_or_group"
        counts = [numeric(v) for v in cells[3:]]
        rec = {
            "sourceRow": row["sourceRow"], "sourceBlockIndex": block_index,
            "date": date, "dateHeadingAsPrinted": heading,
            "formationAsPrinted": cells[1].strip(), "locationAsPrinted": cells[2].strip() or None,
            "category": category,
            "unitCounts": dict(zip(["fighter_regiments", "fighter_squadrons", "recon_squadrons", "total_units"], counts[:4])),
            "aircraftOnHand": dict(zip(["fighters", "reconnaissance", "total"], [counts[4], counts[6], counts[8]])),
            "aircraftUnserviceable": dict(zip(["fighters", "reconnaissance", "total"], [counts[5], counts[7], counts[9]])),
            "combatReadyCrews": counts[10], "combatReadyNightFlightCrews": counts[11],
            "sourceScopeCaution": "Some source groupings explicitly include eastern/rear-area or military-district aviation; date is the reported table heading, not necessarily one simultaneous observation per unit."
        }
        # A dash in the original source means no unit/aircraft, and blank means
        # not reported; preserve both as null in numeric measures.
        if rec["aircraftOnHand"]["total"] is not None:
            aircraft_components = [rec["aircraftOnHand"]["fighters"], rec["aircraftOnHand"]["reconnaissance"]]
            if all(n is not None for n in aircraft_components) and sum(aircraft_components) != rec["aircraftOnHand"]["total"]:
                exceptions.append({"sourceRow": row["sourceRow"], "issue": "aircraft_role_sum_mismatch"})
        result.append(rec)
    out = {
        "sourceUrl": raw["sourceUrl"], "sourceTable": "02-15",
        "service": "Soviet PVO fighter air defense, not all Soviet aviation",
        "sourceClass": "Soviet archival citations in Spanish secondary transcription",
        "sourceStructureNote": "The source combines on-hand aircraft with inoperative denominators; adjacent pairs are one metric plus its unserviceable subset.",
        "cautions": [
            "Do not add printed totals to their constituent named formations.",
            "Two different source blocks both carry the reported date 1945-01-01; do not overwrite or silently merge them.",
            "The 1942-05 heading combines observation dates of 19, 20 and 31 May, according to source footnote 8; not synchronized as-of 10 May.",
            "The source itself covers some Far Eastern units in aggregates; do not claim PVO totals are European only.",
            "Some nominal units are present with incomplete aircraft or crew metrics; null must not become zero."
        ], "records": result, "structuralAndArithmeticExceptions": exceptions
    }
    (directory / "rkka-pvo-fighter-defense-unit-aircraft-and-crews-1941-1945.json").write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n")
    print("PVO", len(result), "unit/total records", len({r["sourceBlockIndex"] for r in result}), "blocks", len(exceptions), "exceptions")


def normalize_long_range():
    raw = json.loads((directory / "rkka-vvs-strength-02-14.json").read_text())
    result, exceptions = [], []
    date = previous_year = heading = None
    block_index = -1
    for row in raw["rows"][4:]:
        cells = [v["value"] for v in row["cells"]]
        if is_heading(cells):
            heading = cells[0]
            date, previous_year = dated_heading(heading, previous_year)
            block_index += 1
            continue
        if len(cells) != 11:
            exceptions.append({"sourceRow": row["sourceRow"], "issue": "unexpected_column_count", "count": len(cells)})
            continue
        if not cells[1] and not cells[2]:
            continue
        values = [numeric(v) for v in cells[3:]]
        rec = {
            "sourceRow": row["sourceRow"], "sourceBlockIndex": block_index,
            "date": date, "dateHeadingAsPrinted": heading,
            "formationAsPrinted": cells[1].strip() or None,
            "locationAsPrinted": cells[2].strip() or None,
            "category": "source_total" if cells[2].strip().lower() == "total" else "named_formation",
            "organization": {"divisions": values[0], "longRangeBomberRegiments": values[1],
                             "heavyBomberRegiments": values[2], "allRegiments": values[3]},
            "combatAircraft": {"onHand": values[4], "unserviceable": values[5]},
            "combatReadyCrews": {"allCrews": values[6], "nightFlightReadyCrews": values[7]},
        }
        if values[1] is not None and values[2] is not None and values[3] is not None and values[1] + values[2] != values[3]:
            exceptions.append({"sourceRow": row["sourceRow"], "issue": "regiment_type_sum_mismatch", "components": values[1] + values[2], "total": values[3]})
        result.append(rec)
    out = {
        "sourceUrl": raw["sourceUrl"], "sourceTable": "02-14",
        "service": "Soviet long-range aviation (DA/ADD; later reorganized into 18th Air Army)",
        "sourceClass": "Soviet archival citations in Spanish secondary transcription",
        "sourceStructureNote": "The source pairs on-hand combat aircraft with unserviceable denominators, and total combat-ready crews with night-capable crew subsets.",
        "cautions": [
            "March 1942 ADD was constituted using VVS KA formations; historical reorganizations change population; do not add pre/post-organization totals as independent forces.",
            "From December 1944 ADD was reorganized as Soviet 18th Air Army; preserve historical service identity.",
            "Source notes some Far Eastern bombers excluded from 1941 front-line returns.",
            "Some source headings mix temporal campaign labels with observation date; date derives from observation text.",
            "Totals and their named subformations overlap; never sum both.",
            "Aircraft losses, pilot casualties, and sortie counts are not provided in this strength table."
        ], "records": result, "structuralAndArithmeticExceptions": exceptions
    }
    (directory / "rkka-long-range-bomber-units-aircraft-crews-and-stations-1941-1945.json").write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n")
    print("Long-range DA/ADD", len(result), "unit/total records", len({r["sourceBlockIndex"] for r in result}), "blocks", len(exceptions), "exceptions")


normalize_pvo()
normalize_long_range()
