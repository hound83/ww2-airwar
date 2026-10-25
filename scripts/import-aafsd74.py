#!/usr/bin/env python3
"""Transcribe the original USAAF Statistical Digest, Table 74, from its HTML.

Usage: python scripts/import-aafsd74.py /path/to/aafsd-3.html
The HTML is not redistributed: source + table number are retained in the JSON.
This is a mechanical transcription, NOT operational aircraft-on-hand data.
"""
import json
import re
import sys
from pathlib import Path
from lxml import html

ROOT = Path(__file__).resolve().parents[1]
SOURCE = "https://www.ibiblio.org/hyperwar/AAF/StatDigest/aafsd-3.html"
MONTHS = dict(zip("Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(), range(12)))
HEADERS = ["all_aircraft", "very_heavy_bombers", "heavy_bombers", "medium_bombers",
           "light_bombers", "fighters", "reconnaissance", "transports", "trainers", "communications"]
CORRECTIONS = [
    {"period": "1942-10", "column": "trainers", "html": "1m382", "normalized": 1382,
     "reason": "Malformed transcription; October row and 1942 annual sums both require 1,382."},
    {"period": "1944-03", "column": "all_aircraft", "html": "9,086", "normalized": 9068,
     "reason": "March component sum is 9,068 and 1944 annual source total requires 9,068; possible source/transcription error."},
    {"period": "1945-02", "column": "trainers", "html": "297", "normalized": 207,
     "reason": "February row total is 6,216 and Jan–Aug trainer annual source total requires 207; possible source/transcription error."}
]


def number(value):
    value = value.replace(",", "").strip()
    if value == "1m382":
        # HTML transcription typo in October 1942, trainers; the row total
        # and the annual control total both uniquely imply 1,382.
        return 1382
    if value == "-":
        return 0  # The original Table 74 dash means no accepted units.
    if not re.fullmatch(r"\d+", value):
        raise ValueError(f"Unexpected numeric cell: {value!r}")
    return int(value)


def main(source_file):
    doc = html.parse(str(source_file))
    table = doc.xpath("//table")[0]
    rows = [[" ".join(cell.text_content().split()) for cell in row.xpath("./th|./td")]
            for row in table.xpath(".//tr")]
    annual = {}
    monthly = []
    year = None
    in_monthly = False
    for row in rows:
        if not row:
            continue
        first = row[0]
        if first == "Monthly":
            in_monthly = True
            continue
        if first == "Annually" or first == "Year or Month":
            continue
        if not in_monthly and re.match(r"^194[0-5]", first) and len(row) == 11:
            annual[int(first[:4])] = dict(zip(HEADERS, map(number, row[1:])))
        elif in_monthly and re.fullmatch(r"194[0-5]", first):
            year = int(first)
        elif in_monthly and first in MONTHS and len(row) == 11:
            if year is None:
                raise ValueError("Month appeared before a year heading")
            cells = dict(zip(HEADERS, map(number, row[1:])))
            period = f"{year}-{MONTHS[first] + 1:02d}"
            for correction in CORRECTIONS:
                if correction["period"] == period:
                    cells[correction["column"]] = correction["normalized"]
            monthly.append({"year": year, "month": MONTHS[first], **cells})
    if len(monthly) != 68 or len(annual) != 6:
        raise ValueError(f"Expected 68 original months and six annual rows, got {len(monthly)} and {len(annual)}")
    for year in range(1940, 1946):
        values = [row for row in monthly if row["year"] == year]
        assert len(values) == (8 if year == 1945 else 12)
        for key in HEADERS:
            observed = sum(row[key] for row in values)
            if observed != annual[year][key]:
                raise ValueError(f"Annual source mismatch: {year} {key}: {observed} vs {annual[year][key]}")
    out = {
        "source": SOURCE, "table": "74", "publisher": "United States Army Air Forces, Office of Statistical Control (1945)",
        "period": "1940-01 through 1945-08", "unit": "aircraft accepted by factories in U.S. programs",
        "scope": "Worldwide production; includes US-financed Canadian and experimental aircraft; NOT combat-ready or European theater strength",
        "quality": "recorded", "method": "HTML transcription of USAAF Digest Table 74; checked against original annual totals",
        "zero_rule": "Table dash means no accepted aircraft, converted to zero; never applied to other archives",
        "transcription_corrections": CORRECTIONS,
        "annual": annual, "months": monthly,
    }
    target = ROOT / "research/transcriptions/usaaf-factory-acceptances-table74.json"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Imported {len(monthly)} monthly USAF factory rows, all ten columns; annual sums reconcile: {target}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(Path(sys.argv[1]))
