#!/usr/bin/env python3
"""Transcribe cited WWII aviation numerical tables for Atlas research, not website import.

Usage: python3 scripts/transcribe-worldwars-statistics.py HTML_DIR OUTPUT_DIR

This is a source-faithful *numerical research extract* from a modern secondary
compilation, not a license to republish its site or a substitute for checking
the primary sources it identifies. The original HTML is not copied to Git.
"""

from __future__ import annotations

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path


PAGES = {
    "airavailluft": ("luftwaffe", "Aircraft on strength vs serviceable, by role, 1939-45"),
    "airavailrafbc": ("raf_bomber_command", "Aircraft available for operations, by type, 1939-45"),
    "aircraftengaged": ("raf_and_usaaf", "Allied aircraft engaged in Europe, 1942-45"),
    "airbalance": ("cross_force", "National aircraft fleets at September 1939, Europe"),
    "milbalance40": ("cross_force", "Air strength by combat type at May 1940"),
    "battlebritain": ("raf_and_luftwaffe", "Air losses during the 1940 Battle of Britain"),
    "bombdistrib": ("raf_and_usaaf", "Strategic bombing tonnage by target category"),
    "airstrusaafmed": ("usaaf_mto", "Aircraft on hand by type in the Mediterranean, 1942-45"),
    "bombsummary": ("cross_force", "Comparative strategic bombing effort"),
    "sortieslossrafbc": ("raf_bomber_command", "Monthly sorties, missing and crashed by day/night, 1939-45"),
    "stratairger": ("raf_and_usaaf", "Air offensive against Germany by year and force"),
    "stratairmed": ("raf_and_usaaf", "Air offensive in the Mediterranean by year and force"),
    "oobairdday": ("allied_expeditonary_air_forces", "Air unit order of battle on D-Day"),
    "rafsummary": ("raf", "RAF sorties, losses and tonnage by command and year"),
}


class SourceTables(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.depth = 0
        self.table = None
        self.row = None
        self.cell = None
        self.tables = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "table":
            if not self.depth:
                self.table = []
            self.depth += 1
        elif tag == "tr" and self.depth == 1:
            self.row = []
        elif tag in ("td", "th") and self.row is not None and self.cell is None:
            self.cell = {"data": [], "colspan": attrs.get("colspan"), "rowspan": attrs.get("rowspan")}

    def handle_data(self, data):
        if self.cell is not None:
            self.cell["data"].append(data)

    def handle_endtag(self, tag):
        if tag in ("td", "th") and self.cell is not None:
            value = " ".join("".join(self.cell["data"]).replace("\u202c", "").split())
            cell = {"text": value}
            for key in ("colspan", "rowspan"):
                if self.cell[key] and self.cell[key] != "1":
                    cell[key] = int(self.cell[key])
            number = re.sub(r"[\s,\u200e\u200f\u202a-\u202e]", "", value)
            if re.fullmatch(r"-?\d+", number):
                cell["count"] = int(number)
            elif re.fullmatch(r"-?\d+\.\d+", number):
                cell["decimal"] = float(number)
            self.row.append(cell)
            self.cell = None
        elif tag == "tr" and self.row is not None:
            if any(x["text"] for x in self.row):
                self.table.append({"row": len(self.table) + 1, "cells": self.row})
            self.row = None
        elif tag == "table" and self.depth:
            self.depth -= 1
            if not self.depth:
                if self.table:
                    self.tables.append(self.table)
                self.table = None


def main(raw: Path, target: Path):
    target.mkdir(parents=True, exist_ok=True)
    for slug, (force, purpose) in PAGES.items():
        html = (raw / f"theworldwars-{slug}.html").read_text(encoding="utf-8")
        parser = SourceTables()
        parser.feed(html)
        assert parser.tables, slug
        stripped = re.sub(r"<[^>]+>", " ", html)
        stripped = " ".join(stripped.split())
        bibliography = re.search(r"\bSource[s]?:\s*(.{5,350}?)(?:Last modified|©|</body>)", stripped, re.IGNORECASE)
        # The May 1940 comparison also includes a *land-forces* table; keep
        # only its air-force table for this specifically aviation dataset.
        selected_tables = parser.tables[1:] if slug == "milbalance40" else parser.tables
        entry = {
            "id": "SPECIALIST-" + slug.upper(),
            "force": force,
            "dataDescription": purpose,
            "sourceUrl": f"https://www.theworldwars.net/stats/file.php?e=ww2&s={slug}",
            "sourceClass": "secondary_specialist_compilation_quoting_historical_sources",
            "compiler": "Rodrigo Aguilera, The World Wars.net, statistics page (last modified 2022)",
            "reportedUnderlyingSources": bibliography.group(1).strip()[:330] if bibliography else None,
            "reviewStatus": "source_rows_only_not_independently_checked_against_original_books_or_archive",
            "zeroWarning": "Printed dash/blank/n.a. are not recoded as zero; totals/categories may have different reporting denominators.",
            "tables": [{"tableNumber": i + 1, "rows": rows} for i, rows in enumerate(selected_tables)],
        }
        outfile = target / f"specialist-ww2-{slug}.json"
        outfile.write_text(json.dumps(entry, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print(slug, "tables", len(selected_tables), "rows", sum(map(len, selected_tables)))


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("usage: script.py INPUT_HTML_DIR OUTPUT_JSON_DIR")
    main(Path(sys.argv[1]), Path(sys.argv[2]))
