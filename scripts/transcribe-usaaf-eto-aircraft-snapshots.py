#!/usr/bin/env python3
"""Transcribe dated USAAF ETO aircraft on-hand snapshots (not serviceability).

Usage: python3 scripts/transcribe-usaaf-eto-aircraft-snapshots.py INPUT_HTML OUTPUT_JSON

Source is a 2022 specialist extraction of official USAAF Statistical Digest
1945 Table 89; preserve fact that a heading saying 'Operational Strength' in
the secondary site means 'on hand' in the primary return, NOT 'serviceable'.
"""

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path


MONTHS = ["1942-06", "1942-09", "1942-12", "1943-03", "1943-06", "1943-09", "1943-12", "1944-03", "1944-06", "1944-09", "1944-12", "1945-03", "1945-04"]
PARENTS = ["Heavy Bombers", "Medium Bombers", "Light Bombers", "Fighters", "Reconnaissance", "Transports", "Trainers", "Communications", "2nd Line & Misc."]


class Table(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.table = 0
        self.row = None
        self.cell = None
        self.rows = []

    def handle_starttag(self, tag, attrs):
        if tag == "table":
            self.table += 1
        elif tag == "tr" and self.table == 1:
            self.row = []
        elif tag in ("td", "th") and self.row is not None:
            self.cell = []

    def handle_data(self, s):
        if self.cell is not None:
            self.cell.append(s)

    def handle_endtag(self, tag):
        if tag in ("td", "th") and self.cell is not None:
            self.row.append(" ".join("".join(self.cell).split()))
            self.cell = None
        elif tag == "tr" and self.row is not None:
            self.rows.append(self.row)
            self.row = None


def nval(text):
    return int(text.replace(",", "")) if re.fullmatch(r"\d[\d,]*", text) else None


def main():
    if len(sys.argv) != 3:
        raise SystemExit("Usage: transcribe-usaaf-eto-aircraft-snapshots.py INPUT_HTML OUTPUT_JSON")
    src, dst = map(Path, sys.argv[1:])
    parser = Table()
    parser.feed(src.read_text(encoding="utf-8"))
    if len(parser.rows) < 25 or parser.rows[1][1:] != ["Jun", "Sep", "Dec", "Mar", "Jun", "Sep", "Dec", "Mar", "Jun", "Sep", "Dec", "Mar", "Apr"]:
        raise ValueError("Date headings of the 13-point snapshot table have changed")
    rows = []
    category = None
    for i, raw in enumerate(parser.rows[2:], start=3):
        if not raw or not raw[0] or len(raw) != 14:
            continue
        label = raw[0].strip()
        if label in PARENTS:
            category = label
        if label in ("TOTAL COMBAT", "TOTAL"):
            category = "grand_total"
        data = dict(zip(MONTHS, [nval(v) for v in raw[1:]]))
        rows.append({
            "sourceRow": i,
            "categoryAsReported": category,
            "aircraftModelOrSummaryAsReported": label,
            "isCategorySubtotal": label in PARENTS or label in ("TOTAL COMBAT", "TOTAL"),
            "aircraftOnHandByDate": data,
        })
    by_label = {r["aircraftModelOrSummaryAsReported"]: r for r in rows if r["aircraftModelOrSummaryAsReported"] in PARENTS + ["TOTAL COMBAT", "TOTAL"]}
    assert all(label in by_label for label in PARENTS + ["TOTAL COMBAT", "TOTAL"]), by_label.keys()
    checks = []
    for month in MONTHS:
        if by_label["TOTAL COMBAT"]["aircraftOnHandByDate"][month] is not None:
            sums = sum(by_label[label]["aircraftOnHandByDate"][month] or 0 for label in ["Heavy Bombers", "Medium Bombers", "Light Bombers", "Fighters", "Reconnaissance"])
            stated = by_label["TOTAL COMBAT"]["aircraftOnHandByDate"][month]
            if sums != stated:
                checks.append({"date": month, "check": "combat_subtotals", "computed": sums, "printed": stated})
    result = {
        "id": "USAAF-ETO-AIRCRAFT-ON-HAND-13-DATES-1942-1945",
        "sourceUrl": "https://www.theworldwars.net/stats/file.php?e=ww2&s=airstrusaafeur",
        "reportedCompiler": "Rodrigo Aguilera, last modified 10 Dec 2022",
        "originalSource": "Office of Statistical Control (1945), Army Air Forces Statistical Digest: World War II, Table 89, pp.157-159",
        "originalScan": "https://archive.org/details/ArmyAirForcesStatisticalDigestWorldWarII",
        "sourceClass": "secondary_composite_of_public_domain_original_usaaaf_statistics",
        "theater": "European Theater of Operations (ETO)",
        "strengthDefinition": "Aircraft on hand at month end, NOT serviceable and NOT combat crews; source labels 'Operational Strength' but primary Table 89 calls them on hand",
        "reportingCaveat": "Includes second-line and miscellaneous aircraft separately; do not double-count subtotal rows and model rows; dashes stay null",
        "dateCount": len(MONTHS),
        "roleAndModelRows": len(rows),
        "categorySubtotalsVsCombatGrandIssues": checks,
        "records": rows,
    }
    dst.parent.mkdir(parents=True, exist_ok=True)
    dst.write_text(json.dumps(result, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    print(len(rows),"role/type rows *",len(MONTHS),"dates; combat subtotal issues",len(checks))
    print([(m,by_label["TOTAL COMBAT"]["aircraftOnHandByDate"][m]) for m in MONTHS])


if __name__ == "__main__":
    main()
