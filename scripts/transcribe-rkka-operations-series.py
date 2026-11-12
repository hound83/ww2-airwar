#!/usr/bin/env python3
"""Transcribe Soviet air-service operations, losses and claims, RKKA Part 06.

Requires already downloaded 06_01.html through 06_36.html (see the matching
downloader). This is a research-only *secondary* archival transcription, not
independent verification of the Russian originals. No web access is used.
"""
from __future__ import annotations

import json
import re
import runpy
import sys
from pathlib import Path

if len(sys.argv) != 3:
    raise SystemExit("Usage: python3 scripts/transcribe-rkka-operations-series.py <input-directory> <output-directory>")

root = Path(__file__).resolve().parent
shared_parser = runpy.run_path(str(root / "transcribe-rkka-strength-series.py"))["TableAndPageText"]


class AllTables(shared_parser):
    def __init__(self):
        super().__init__()
        self.tables = []

    def handle_starttag(self, tag, attrs):
        if tag == "table" and self.table_depth == 0:
            self.rows = []
            self.found_first_table = False
        super().handle_starttag(tag, attrs)

    def handle_endtag(self, tag):
        super().handle_endtag(tag)
        if tag == "table" and self.table_depth == 0:
            self.tables.append(self.rows)


# These are descriptive English topics for research provenance, not a claim of
# what any normalized rows mean or who independently verified their numbers.
topics = [
    "VVS KA combat sorties by strategic war period",                # 01
    "VVS KA sorties by mission and strategic war period",           # 02
    "VVS KA sorties by mission and calendar year",                  # 03
    "VVS KA 1941 front aviation mission sorties by unit",           # 04
    "VVS KA 1942 air-army mission sorties",                         # 05
    "VVS KA 1943 air-army mission sorties",                         # 06
    "VVS KA 1944 air-army mission sorties",                         # 07
    "VVS KA Jan-May 1945 air-army mission sorties",                # 08
    "Long-range aviation DA/ADD combat sorties by year and task",   # 09
    "Long-range DA/ADD target classes and bomb tonnage",           # 10
    "Long-range DA/ADD major operation participation",             # 11
    "Long-range DA/ADD special transport missions, loads, persons",# 12
    "Soviet PVO fighter aviation sorties by interception method",   # 13
    "Soviet VMF naval aviation sorties by role and fleet",          # 14
    "Civil air fleet sortie categories",                            # 15
    "Civil air fleet transport tonnage and persons",                # 16
    "Civil air fleet wartime operations and campaigns",            # 17
    "German sorties on Eastern Front by task 1944-1945",           # 18
    "German Eastern Front sorties by aircraft class 1943-1945",    # 19
    "Soviet Western Front air losses June-July 1941",              # 20
    "VVS KA combat aircraft losses by type and year 1941-1945",    # 21
    "VVS KA combat aircraft losses by cause 1941-1945",           # 22
    "Soviet long-range DA/ADD aircraft losses by type and year",    # 23
    "Soviet PVO fighter sorties, claims and own aircraft losses by unit",# 24
    "Soviet VMF naval aircraft losses by fleet, type, war year",    # 25
    "Soviet civil air fleet aircraft losses by cause and type",     # 26
    "Western Front VVS claims of German aircraft 1941",           # 27
    "German aircraft losses during named Soviet operations",       # 28
    "Soviet PVO claims of enemy aircraft by year",                 # 29
    "Soviet VMF claims of German aircraft by fleet and year",      # 30
    "Soviet VMF claims of German naval damage and losses",         # 31
    "VVS KA and ADD wartime unit decorations and orders",          # 32
    "VVS KA and ADD Guards formation titles",                      # 33
    "VVS KA honored unit titles and geographic names",             # 34
    "VVS personnel award categories",                              # 35
    "VVS Heroes of the Soviet Union award counts",                 # 36
]

input_dir, output_dir = Path(sys.argv[1]), Path(sys.argv[2])
output_dir.mkdir(parents=True, exist_ok=True)
all_results = []
for i, topic in enumerate(topics, 1):
    filename = input_dir / f"06_{i:02d}.html"
    parser = AllTables()
    parser.feed(filename.read_bytes().decode("cp1251", errors="replace"))
    if not parser.tables or not parser.tables[0] or len(parser.tables[0]) < 3:
        raise ValueError(f"No structured main data table in {filename}")
    tables = []
    for t, original_rows in enumerate(parser.tables):
        tables.append({
            "sourceTableIndex": t,
            "sourceRowCount": len(original_rows),
            "rows": [{"sourceRow": index+1, "cells": cells} for index, cells in enumerate(original_rows)],
        })
    page = {
        "id": f"RKKA-VVS-06-{i:02d}", "topic": topic,
        "sourceUrl": f"https://www.rkka.es/Estadisticas/VVS_stat/06/06_{i:02d}.htm",
        "sourceClass": "Secondary Spanish-language edition of wartime Soviet/Russian archive-derived statistical tables",
        "status": "Research-only first-pass transcription; original Russian pages/folios unverified",
        "scopeCautions": [
            "The main table is sourceTableIndex 0; additional tables, if any, may be abbreviations or explanatory legends.",
            "Original 1945 data may extend beyond 9 May and include Japanese/Pacific operations. Check individual column periods.",
            "Source totals, component unit totals and geographic subtotals overlap and should not be added together.",
            "Enemy destroyed columns in Soviet operational report tables represent CLAIMS unless cross-checked against German aircraft loss records.",
            "Blank, dash and nonnumeric original values are preserved as literal strings, never assumed to be observed zero.",
            "Aircraft loss counts, sorties, and human crew/pilot casualties are distinct metrics."
        ],
        "tables": tables,
    }
    out_path = output_dir / f"rkka-operations-06-{i:02d}.json"
    out_path.write_text(json.dumps(page, ensure_ascii=False, indent=2) + "\n")
    all_results.append(page)
print("RKKA part 6", len(all_results), "pages", sum(len(x["tables"]) for x in all_results),
      "data/legend tables", sum(sum(t["sourceRowCount"] for t in x["tables"]) for x in all_results), "rows")
