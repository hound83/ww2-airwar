#!/usr/bin/env python3
"""Normalize Soviet Navy Aviation (VMF) fleet/role aircraft AND combat crews.

This explicitly keeps the separate August/Pacific data out of the *European*
Atlas: RKKA Table 02-17's final May 1945 block is for Pacific fleets.
"""
import json
import re
from pathlib import Path

root = Path(__file__).resolve().parents[1] / "research/transcriptions/rkka-strength-02"
source = json.loads((root / "rkka-vvs-strength-02-17.json").read_text())
months = {"enero": 1, "febrero": 2, "marzo": 3, "abril": 4, "mayo": 5, "junio": 6, "julio": 7, "agosto": 8, "septiembre": 9, "octubre": 10, "noviembre": 11, "diciembre": 12}
roles = ["torpedo_bomber", "bomber", "ground_attack", "fighter", "reconnaissance", "artillery_spotter", "total"]


def number(cell):
    m = re.fullmatch(r"\s*(\d[\d\s]*)(?:\{\d+\})?\s*", cell)
    return int("".join(m.group(1).split())) if m else None


def date_from_heading(text):
    m = re.search(r"a fecha de\s+(\d{1,2})\s+de\s+([a-z]+)(?:\s+de\s+(19\d\d))?", text.lower())
    if m and m.group(2) in months:
        year = int(m.group(3)) if m.group(3) else None
        if year is None:
            # The heading always mentions the relevant campaign year elsewhere.
            y = re.search(r"(?:19\d\d)", text)
            year = int(y.group(0)) if y else None
        if year is not None:
            return f"{year:04d}-{months[m.group(2)]:02d}-{int(m.group(1)):02d}"
    raise ValueError("Date not matched: " + text)


results, exceptions = [], []
date, block = None, None
for row in source["rows"][3:]:
    cells = [c["value"] for c in row["cells"]]
    if len(cells) == 1:
        date = date_from_heading(cells[0])
        block = row["sourceRow"]
        continue
    if len(cells) != 44:
        exceptions.append({"sourceRow": row["sourceRow"], "issue": "unexpected_column_count", "count": len(cells)})
        continue
    fleet = re.sub(r"\{\d+\}", "", cells[1]).strip()
    if not fleet:
        continue
    aircraft = {role: number(cells[2 + i * 3]) for i, role in enumerate(roles)}
    crews = {role: number(cells[23 + i * 3]) for i, role in enumerate(roles)}
    excluded_pacific = block == 64
    entry = {
        "sourceRow": row["sourceRow"], "date": date, "fleetNameAsPrinted": fleet,
        "fleetCategory": ("all_fleets_subtotal" if fleet in ("Итого", "Total") else "named_fleet_or_flotilla"),
        "combatAircraft": aircraft, "combatReadyCrews": crews,
        "excludedFromEuropeanAtlas": excluded_pacific,
        "sourceTripletWarning": "Original table uses 3 source cells per role; only first contains the published role total, other two preserved in original 02_17 JSON."
    }
    for metric_name, values in [("combatAircraft", aircraft), ("combatReadyCrews", crews)]:
        individual = [values[key] for key in roles[:-1]]
        if values["total"] is not None and all(x is not None for x in individual) and sum(individual) != values["total"]:
            exceptions.append({"sourceRow": row["sourceRow"], "issue": "role_sum_disagrees_total", "metric": metric_name, "reported": values["total"], "components": sum(individual)})
    results.append(entry)

out = {
    "sourceUrl": source["sourceUrl"],
    "sourceClass": "Soviet_postwar_statistics_republished_in_Spanish_secondary_transcription",
    "dateScope": "1941-06-22 to 1945-05-10, twelve European campaign snapshots; additional Pacific block excluded",
    "population": "Soviet naval aviation VMF fleets, aircraft by combat role and combat-ready aircrews; not VVS KA/PVO/ADD",
    "cautions": [
        "The source distinguishes combat aircraft and combat-ready crews, not deaths. These are separate strength measures.",
        "The last May 1945 block is explicitly Pacific Fleet / North Pacific Flotilla and is excluded from European visualizations.",
        "The table provides Soviet naval fleet returns, which must not be added to Soviet VVS KA or PVO charts unless the published population explicitly excludes VMF.",
        "Fleet total rows and component fleets are overlapping parent/child data; never add both.",
        "Spanish/Russian archival-derived source is not independently verified against the original naval documents.",
        "Blank, slash and missing values stay null, not inferred zero."
    ],
    "europeanFleetSnapshots": [r for r in results if not r["excludedFromEuropeanAtlas"]],
    "excludedPacificFleetSnapshots": [r for r in results if r["excludedFromEuropeanAtlas"]],
    "numericOrStructuralExceptions": exceptions
}
outfile = root / "rkka-vmf-naval-aviation-combat-aircraft-and-crews-by-fleet-1941-1945.json"
outfile.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n")
print("European records", len(out["europeanFleetSnapshots"]), "excluded Pacific", len(out["excludedPacificFleetSnapshots"]), "exceptions", len(exceptions))
print("First total", [(r["combatAircraft"]["total"], r["combatReadyCrews"]["total"]) for r in out["europeanFleetSnapshots"] if r["fleetCategory"] == "all_fleets_subtotal"][:4])
