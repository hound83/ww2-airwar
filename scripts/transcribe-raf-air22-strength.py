#!/usr/bin/env python3
"""Transcribe 1939-45 RAF Europe operational aircraft by type and command.

Source: public specialist transcription of UK National Archives AIR 22 dated
strength tables. This is serviceable/crewed operational aircraft where reported,
not the much larger RAF national on-hand inventory. Month headers with a special
date for September 1939 and May 1945 follow the source footnotes.

Usage: python3 scripts/transcribe-raf-air22-strength.py INPUT_HTML OUTPUT_JSON
"""

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path


SOURCE_DATES = [
    ("1939-09", "1939-09-03"),
    ("1940-01", "1940-01-01"), ("1940-07", "1940-07-01"),
    ("1941-01", "1941-01-01"), ("1941-05", "1941-05-01"), ("1941-09", "1941-09-01"),
    ("1942-01", "1942-01-01"), ("1942-05", "1942-05-01"), ("1942-09", "1942-09-01"),
    ("1943-01", "1943-01-01"), ("1943-05", "1943-05-01"), ("1943-09", "1943-09-01"),
    ("1944-01", "1944-01-01"), ("1944-05", "1944-05-01"), ("1944-09", "1944-09-01"),
    ("1945-01", "1945-01-01"), ("1945-05", "1945-04-30"),
]


class FirstTable(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.level = 0
        self.row = None
        self.cell = None
        self.rows = []

    def handle_starttag(self, tag, attrs):
        if tag == "table":
            self.level += 1
        if tag == "tr" and self.level == 1:
            self.row = []
        if tag in ("td", "th") and self.row is not None:
            self.cell = []

    def handle_data(self, text):
        if self.cell is not None:
            self.cell.append(text)

    def handle_endtag(self, tag):
        if tag in ("th", "td") and self.cell is not None:
            self.row.append(" ".join("".join(self.cell).split()))
            self.cell = None
        if tag == "tr" and self.row is not None:
            self.rows.append(self.row)
            self.row = None


def as_int(text):
    return int(text.replace(",", "")) if re.fullmatch(r"\d[\d,]*", text) else None


def main():
    if len(sys.argv) != 3:
        raise SystemExit("Usage: transcribe-raf-air22-strength.py INPUT_HTML OUTPUT_JSON")
    src, dst = map(Path, sys.argv[1:])
    p = FirstTable()
    p.feed(src.read_text(encoding="utf-8"))
    if len(p.rows) < 95 or len(p.rows[1]) != 18:
        raise ValueError("Expected 17-column RAF strengths source table")
    observations = []
    command = None
    section = None
    summaries = {}
    for i, line in enumerate(p.rows[2:], start=3):
        if len(line) == 1:
            command = line[0]
            section = "command_aircraft"
            continue
        if len(line) != 18 or not line[0]:
            continue
        label = line[0]
        if label.startswith("TOTAL "):
            section = "all_command_summary"
        elif label == "Other" and section == "after_command_subtotal":
            section = "additional_attached_or_other"
        role = {"TOTAL FIGHTER": "fighter", "TOTAL BOMBER": "bomber", "TOTAL COASTAL": "coastal", "TOTAL": "all"}.get(label)
        if role:
            command = "All included RAF commands"
        typed = {date: as_int(n) for (month, date), n in zip(SOURCE_DATES, line[1:])}
        item = {
            "sourceRow": i,
            "airCommandOrGroup": command,
            "aircraftAsReported": label,
            "roleSummary": role,
            "sectionWithinCommand": section,
            "isSubtotal": role is not None or label == "Total",
            "operationalAircraftByExactDate": typed,
        }
        observations.append(item)
        if role:
            summaries[role] = typed
        if label == "Total":
            section = "after_command_subtotal"
        if role:
            section = "all_command_summary"
    assert set(summaries) == {"fighter", "bomber", "coastal", "all"}, summaries.keys()
    check = []
    for _, date in SOURCE_DATES:
        all_ = summaries["all"][date]
        roles = sum(summaries[role][date] or 0 for role in ("fighter", "bomber", "coastal"))
        if all_ != roles:
            check.append({"date": date, "sourceOverall": all_, "sumFighterBomberCoastal": roles})
    out = {
        "id": "RAF-AIR22-OPERATIONAL-AIRCRAFT-1939-1945",
        "sourceUrl": "https://www.theworldwars.net/stats/file.php?e=ww2&s=airstrrafeur",
        "originalSourceSeries": "UK National Archives AIR 22, Air Ministry statistical returns",
        "sourceClass": "secondary_compilation_of_original_british_AIR22_source",
        "coverage": "RAF European command strength (Fighter/ADGB, 2TAF, Bomber, Coastal), selected 17 dates 1939-45",
        "aircraftDefinition": "Serviceable aircraft available for operations; if missing, operational aircraft with crews. NOT all aircraft on strength.",
        "scopeCaution": "Service and command allocation differ from all RAF aircraft worldwide; some RCAF/RAAF/Polish or allied RAF-hosted squadrons are in RAF commands and must not be added again to RAF totals.",
        "sampleDateFootnote": "All dates start of month except Sept 1939 represents 3 Sept and May 1945 represents 30 April; the heading month label is preserved separately.",
        "sourceMonthLabelsVsActualDates": [{"heading": header, "asOf": date} for header, date in SOURCE_DATES],
        "dateCount": len(SOURCE_DATES),
        "commandAndTypeRows": len(observations),
        "printedRoleAndOverallReconciliationIssues": check,
        "records": observations,
    }
    dst.parent.mkdir(parents=True, exist_ok=True)
    dst.write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print("RAF",len(observations),"rows across",len(SOURCE_DATES),"dates, discrepancy count",len(check))
    print("Grand selected dates", [(date, summaries["all"][date]) for _,date in SOURCE_DATES])


if __name__ == "__main__":
    main()
