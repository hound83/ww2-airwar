#!/usr/bin/env python3
"""Preserve selected USAAF 1945 Statistical Digest source tables as factual rows.

Input: complete HyperWar transcription aafsd-2.html, which is a secondary HTML
presentation of the public-domain original USAAF Office of Statistical Control
digest (December 1945), archived also by Internet Archive and the USAF.

Usage: python3 scripts/transcribe-usaaf-1945-personnel.py FILE OUTPUT_JSON

The transcribed tables retain column cells and source grouping, including crew
strength versus crew loss versus all-personnel casualty. This prevents an
incorrect equation of personnel casualties with pilot fatalities.
"""

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path


TABLE_NUMBERS = [24, 25, 36, 37, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73]


class DigestTables(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.active_h3 = None
        self.active_number = None
        self.active_heading = None
        self.table_depth = 0
        self.active_row = None
        self.active_cell = None
        self.tables = {}

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "h3":
            self.active_h3 = []
        elif tag == "br" and self.active_h3 is not None:
            self.active_h3.append(" ")
        elif tag == "table":
            self.table_depth += 1
            if self.table_depth == 1 and self.active_number in TABLE_NUMBERS:
                group = self.tables.setdefault(self.active_number, {
                    "printedHeading": self.active_heading,
                    "sourceTableSegments": [],
                })
                group["sourceTableSegments"].append([])
        elif tag == "tr" and self.table_depth == 1 and self.active_number in TABLE_NUMBERS:
            self.active_row = []
        elif tag in ("th", "td") and self.active_row is not None:
            self.active_cell = {
                "text": [],
                "colspan": int(attrs.get("colspan", 1)),
                "rowspan": int(attrs.get("rowspan", 1)),
            }

    def handle_data(self, text):
        if self.active_h3 is not None:
            self.active_h3.append(text)
        if self.active_cell is not None:
            self.active_cell["text"].append(text)

    def handle_endtag(self, tag):
        if tag == "h3" and self.active_h3 is not None:
            heading = " ".join("".join(self.active_h3).split())
            match = re.search(r"\bTable\s+(\d+)\b", heading, re.I)
            self.active_number = int(match.group(1)) if match else None
            self.active_heading = heading
            self.active_h3 = None
        elif tag in ("th", "td") and self.active_cell is not None:
            new_cell = {"text": " ".join("".join(self.active_cell["text"]).split())}
            for dimension in ("colspan", "rowspan"):
                if self.active_cell[dimension] > 1:
                    new_cell[dimension] = self.active_cell[dimension]
            self.active_row.append(new_cell)
            self.active_cell = None
        elif tag == "tr" and self.active_row is not None:
            self.tables[self.active_number]["sourceTableSegments"][-1].append(self.active_row)
            self.active_row = None
        elif tag == "table":
            self.table_depth = max(self.table_depth - 1, 0)


def main():
    if len(sys.argv) != 3:
        raise SystemExit("Usage: transcribe-usaaf-1945-personnel.py INPUT_HTML OUTPUT_JSON")
    input_file, output_file = map(Path, sys.argv[1:])
    parser = DigestTables()
    parser.feed(input_file.read_bytes().decode("latin-1", errors="replace"))
    selected = {}
    for n in TABLE_NUMBERS:
        entry = parser.tables.get(n)
        if not entry:
            continue
        selected[str(n)] = {
            "sourceUrl": f"https://www.ibiblio.org/hyperwar/AAF/StatDigest/aafsd-2.html#t{n}",
            "titleAsPrinted": entry["printedHeading"],
            "sourceTableSegments": entry["sourceTableSegments"],
            "rowCount": sum(map(len, entry["sourceTableSegments"])),
        }
    if not {"24", "25", "36", "37", "67", "68", "69", "70", "71", "72", "73"}.issubset(selected):
        raise ValueError(f"Missing source table(s), found only {list(selected)}")
    result = {
        "id": "USAAF-STATISTICAL-DIGEST-1945-PERSONNEL-CREWS",
        "originalCreator": "Office of Statistical Control, Headquarters, United States Army Air Forces",
        "originalPublicationDate": "1945-12",
        "originalDigitizedBook": "https://archive.org/details/ArmyAirForcesStatisticalDigestWorldWarII",
        "hyperWarSourceUrl": "https://www.ibiblio.org/hyperwar/AAF/StatDigest/aafsd-2.html",
        "sourceClass": "primary_official_1945_statistical_compilation_represented_by_secondary_html_transcription",
        "reviewStatus": "research_only_not_checked_cell_by_cell_against_original_scanned_pdf",
        "theaterBoundary": "ETO includes 8th AF and from Oct 1943 9th AF; MTO includes 12th and 15th AF and 9th AF before Oct 1943 (see original digest preface)",
        "crewPersonnelWarning": "Crew losses, all-personnel battle casualties, and personnel/crews on strength have distinct denominators; none alone is pilot fatalities.",
        "tableCount": len(selected),
        "tables": selected,
    }
    output_file.parent.mkdir(parents=True, exist_ok=True)
    output_file.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print("tables",len(selected),"rows",sum(t["rowCount"] for t in selected.values()))
    print(*[(n, t["rowCount"],len(t["sourceTableSegments"]),[len(r) for r in t["sourceTableSegments"][0][:4]]) for n,t in selected.items()],sep="\n")


if __name__ == "__main__":
    main()
