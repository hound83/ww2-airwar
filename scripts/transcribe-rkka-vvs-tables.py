#!/usr/bin/env python3
"""Transcribe two RKKA.es Soviet air force tables from locally downloaded HTML.

Usage: python3 scripts/transcribe-rkka-vvs-tables.py LOSSES.html SORTIES.html OUTPUT_DIR

This script is deliberately dependency-free. It keeps source blanks as null and
does not infer which Soviet service branches or fronts are included beyond the
original table headings. These are *secondary transcriptions* of archival data.
"""

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path


class FirstTable(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.in_table = False
        self.in_row = False
        self.cell_depth = 0
        self.current_cell = []
        self.current_row = []
        self.rows = []

    def handle_starttag(self, tag, attrs):
        if tag == "table" and not self.in_table:
            self.in_table = True
        elif self.in_table and tag == "tr":
            self.in_row = True
            self.current_row = []
        elif self.in_row and tag in ("td", "th"):
            self.cell_depth += 1
            self.current_cell = []

    def handle_data(self, data):
        if self.cell_depth:
            self.current_cell.append(data)

    def handle_endtag(self, tag):
        if tag in ("td", "th") and self.cell_depth:
            self.current_row.append(" ".join("".join(self.current_cell).split()))
            self.cell_depth -= 1
        elif tag == "tr" and self.in_row:
            self.rows.append(self.current_row)
            self.in_row = False
        elif tag == "table" and self.in_table:
            self.in_table = False


def rows_from_file(path):
    parser = FirstTable()
    parser.feed(Path(path).read_bytes().decode("windows-1251", errors="replace"))
    return parser.rows


def number(cell):
    normalized = re.sub(r"[\s\xa0]+", "", cell or "")
    return int(normalized) if normalized.isdigit() else None


def transcribe_losses(path):
    classes = {
        "BOMBARDEROS": "bomber",
        "SHTURMOVIK": "ground_attack",
        "CAZAS": "fighter",
        "OTROS AVIONES": "other",
    }
    current_class = None
    records, printed_subtotals = [], {}
    grand_total = None
    for row in rows_from_file(path):
        if not row:
            continue
        if row[0] in classes:
            current_class = classes[row[0]]
            continue
        if len(row) != 7 or current_class is None:
            continue
        vals = [number(x) for x in row[1:]]
        if row[0] == "Total:":
            printed_subtotals[current_class] = {"total": vals[0], **dict(zip(map(str, range(1941, 1946)), vals[1:]))}
        elif row[0] == "Total en VVS:":
            grand_total = {"total": vals[0], **dict(zip(map(str, range(1941, 1946)), vals[1:]))}
        else:
            assert all(x is not None or not raw.strip() for x, raw in zip(vals, row[1:])), row
            records.append({
                "aircraftTypeAsReported": row[0],
                "roleClass": current_class,
                "combatLossesTotal": vals[0],
                "combatLossesByYear": dict(zip(map(str, range(1941, 1946)), vals[1:])),
            })

    assert len(records) >= 30, f"Unexpectedly few type records: {len(records)}"
    assert grand_total and grand_total["total"] == 37165
    discrepancies = []
    for r in records:
        subtotal = sum(n or 0 for n in r["combatLossesByYear"].values())
        if subtotal != r["combatLossesTotal"]:
            discrepancies.append({"aircraftType": r["aircraftTypeAsReported"], "printedTotal": r["combatLossesTotal"], "sumOfYears": subtotal})
    computed_role_totals = {}
    for role in classes.values():
        role_rows = [r for r in records if r["roleClass"] == role]
        computed_role_totals[role] = {}
        for key in ("total", *(str(y) for y in range(1941, 1946))):
            actual = sum((r["combatLossesTotal"] if key == "total" else r["combatLossesByYear"][key]) or 0 for r in role_rows)
            computed_role_totals[role][key] = actual
            if role in printed_subtotals and actual != printed_subtotals[role][key]:
                discrepancies.append({"role": role, "column": key, "printed": printed_subtotals[role][key], "summed": actual})
    for key in ("total", *(str(y) for y in range(1941, 1946))):
        actual = sum(s[key] or 0 for s in computed_role_totals.values())
        if actual != grand_total[key]:
            discrepancies.append({"role": "all", "column": key, "printed": grand_total[key], "summedRoles": actual})

    return {
        "id": "RKKA-VVS-06-21",
        "sourceUrl": "https://www.rkka.es/Estadisticas/VVS_stat/06/06_21.htm",
        "sourceType": "secondary_transcription_of_original_soviet_air_force_records",
        "originalArchivalReferencesAsReported": [
            "VVS KA General Staff Operational Department, inventory 77, folios 1-91",
            "VVS Chief Engineer aircraft and engine registration, inventory 366, folios 1-98",
        ],
        "reportingUniverse": "VVS KA combat aircraft losses; not a sum of all Soviet air arms; excludes ordinary accident/wear writeoffs",
        "period": "1941-1945",
        "status": "research_only_source_transcription_not_independently_checked_against_original_archival_sheets",
        "sourceBlanks": "null means blank in the published table; not a measured zero",
        "sourceCaveat": "Fighters used for ground attack remain in the fighter category because mission-level losses are unavailable in this source",
        "columns": ["combatLossesTotal", "combatLossesByYear"],
        "records": records,
        "printedRoleTotals": printed_subtotals,
        "computedRoleTotals": computed_role_totals,
        "printedOverallTotal": grand_total,
        "arithmeticDiscrepancies": discrepancies,
    }


MISSION_KEYS = [
    "over_troops", "over_airfields", "over_rail_targets", "air_defense", "escort",
    "reconnaissance", "artillery_spotting", "special", "cargo_transport",
    "interception", "free_hunt", "river_crossings", "shipping", "depots",
]

AIR_ARMIES = [7, 13, 14, 15, 3, 1, 4, 6, 16, 2, 8, 5, 17]


def transcribe_sorties(path):
    tab = rows_from_file(path)
    assert len(tab) >= 17, f"Expected 17+ table rows, got {len(tab)}"
    unit_rows = [row for row in tab if len(row) == 18 and " EA " in (row[0] + " EA ") and row[0][0].isdigit()]
    # The fourth formation is written as '4 Ejercito del Aire', so select by
    # numeric row order from the first data row to the line immediately before Total.
    tab_data = tab[2:]
    assert len(tab_data) >= 15, (len(tab_data), len(unit_rows))
    formation_rows = tab_data[:13]
    assert tab_data[13][0] == "Total", tab_data[13]
    records = []
    discrepancies = []
    for army, row in zip(AIR_ARMIES, formation_rows):
        assert len(row) == 18, (army, row)
        assert str(army) == row[0].split(" ")[0], (army, row[0])
        numbers = [number(x) for x in row[1:]]
        categories = dict(zip(MISSION_KEYS, numbers[:14]))
        sum_roles = sum(n or 0 for n in categories.values())
        total, day, night = numbers[14:]
        if sum_roles != total or day + night != total:
            discrepancies.append({"airArmy": army, "sumOfMissionRoles": sum_roles, "reportedTotal": total, "dayAndNightSum": day + night})
        records.append({
            "formation": f"{army}{'th' if army not in (1, 2, 3) else {1:'st',2:'nd',3:'rd'}[army]} Air Army",
            "airArmyNumber": army,
            "frontAssignmentAsReported": row[0],
            "missionSorties": categories,
            "totalSorties": total,
            "daySorties": day,
            "nightSorties": night,
        })

    printed = [number(x) for x in tab_data[13][1:]]
    for idx, key in enumerate(MISSION_KEYS + ["totalSorties", "daySorties", "nightSorties"]):
        current = sum((r["missionSorties"][key] if idx < 14 else r[key]) or 0 for r in records)
        if printed[idx] != current:
            discrepancies.append({"column": key, "printedTotal": printed[idx], "sumOfAirArmies": current})

    return {
        "id": "RKKA-VVS-06-07",
        "sourceUrl": "https://www.rkka.es/Estadisticas/VVS_stat/06/06_07.htm",
        "sourceType": "secondary_transcription_of_original_soviet_air_force_records",
        "reportingUniverse": "13 Soviet VVS KA air armies in 1944; separate PVO, naval aviation, long-range aviation are not presumed included",
        "period": "1944",
        "status": "research_only_source_transcription_not_independently_checked_against_original_archival_sheets",
        "sourceBlanks": "null means blank in the published table; not a measured zero",
        "sourceCaveat": "Front associations change in 1944 for certain air armies; these annual counts cannot be mapped to one static front polygon",
        "missionCategoryTranslation": "English field names summarize Spanish-language column headings; verify against original Soviet terminology before live publication",
        "missionCategoryKeysInSourceOrder": MISSION_KEYS,
        "records": records,
        "printedTotals": dict(zip(MISSION_KEYS + ["totalSorties", "daySorties", "nightSorties"], printed)),
        "arithmeticDiscrepancies": discrepancies,
    }


def main():
    if len(sys.argv) != 4:
        raise SystemExit(__doc__)
    losses, sorties, dest = sys.argv[1:]
    target = Path(dest)
    target.mkdir(parents=True, exist_ok=True)
    result = {
        "rkka-vvs-combat-aircraft-losses-by-type-1941-1945.json": transcribe_losses(losses),
        "rkka-vvs-air-army-sorties-by-mission-1944.json": transcribe_sorties(sorties),
    }
    for filename, data in result.items():
        (target / filename).write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print(f"{filename}: {len(data['records'])} records; {len(data['arithmeticDiscrepancies'])} arithmetic discrepancies")
        for finding in data["arithmeticDiscrepancies"]:
            print("  discrepancy:", finding)


if __name__ == "__main__":
    main()
