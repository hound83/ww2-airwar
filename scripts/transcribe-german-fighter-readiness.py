#!/usr/bin/env python3
"""Transcribe archival-derived Luftwaffe fighter readiness unit returns.

Usage: python3 scripts/transcribe-german-fighter-readiness.py INPUT_DIR OUTPUT_JSON

Reads public historical quantitative tables indexed by ww2.dk/oob/statistics.
The original returns were in the Luftwaffe Generalquartiermeister files RL 2
III/700-734; Michael Holm's website is a secondary transcription and quarter-
year selection. This parser deliberately does not invent geographic command
assignments or force totals from partial categories (single/twin fighters).
"""

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path


class RowParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.table = 0
        self.active_row = None
        self.cell = None
        self.rows = []
        self.description = ""

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "meta" and attrs.get("name", "").lower() == "description":
            self.description = attrs.get("content", "")
        if tag == "table":
            self.table += 1
        if tag == "tr" and self.table == 1:
            self.active_row = []
        if tag in ("th", "td") and self.active_row is not None:
            self.cell = []

    def handle_data(self, text):
        if self.cell is not None:
            self.cell.append(text)

    def handle_endtag(self, tag):
        if tag in ("th", "td") and self.cell is not None:
            self.active_row.append(" ".join("".join(self.cell).split()))
            self.cell = None
        if tag == "tr" and self.active_row is not None:
            self.rows.append(self.active_row)
            self.active_row = None


def int_or_null(text):
    return int(text.replace(",", "")) if re.fullmatch(r"\d[\d,]*", text) else None


def sum_compound_or_null(text):
    """Interpret '12 6' as two printed subcounts, never as a single 126."""
    if re.fullmatch(r"\d+(?:\s+\d+)*", text):
        return sum(map(int, text.split()))
    return None


COLUMNS = ["aircraftEstablishment", "aircraftOnStrength", "aircraftServiceable", "pilotsEstablishment", "pilotsPresent", "pilotsReady", "pilotsLimitedDuty"]


def one_page(path):
    parser = RowParser()
    parser.feed(path.read_bytes().decode("cp1252", errors="replace"))
    assert len(parser.rows) >= 8 and parser.rows[1][:5] == ["Unit", "Type", "Est.", "On Str.", "Serv."], path
    match = re.search(r"(\d{1,2})\.(\d{1,2})\.(\d{2})", parser.description)
    if not match:
        raise ValueError(f"No dated heading: {parser.description!r}")
    day, month, yy = (int(x) for x in match.groups())
    date = f"19{yy:02d}-{month:02d}-{day:02d}"
    kind = "single_engine_fighters" if path.name.startswith("german-se") else "twin_engine_fighters"
    source_name = path.name[7:]
    assert parser.rows[-1][0] == "TOTAL", (path, parser.rows[-1])
    observations = []
    for i, row in enumerate(parser.rows[2:-1], start=3):
        if not row or not row[0].strip():
            continue
        if len(row) != 9:
            raise ValueError(f"Unexpected columns in {path}: row {i}: {row}")
        metrics = dict(zip(COLUMNS, [int_or_null(x) for x in row[2:]]))
        observations.append({
            "unitAsReported": row[0],
            "aircraftTypeAsReported": row[1],
            "statistics": metrics,
            "rawStatisticCells": dict(zip(COLUMNS, row[2:])),
            "mixedOrNonNumericCells": [c for c in COLUMNS if metrics[c] is None and row[2 + COLUMNS.index(c)] not in ("", "-", "–")],
            "sourceRow": i,
        })
    last = parser.rows[-1]
    if len(last) != 9:
        raise ValueError(f"Unexpected TOTAL columns in {path}: {last}")
    compound_sums = {
        c: sum(sum_compound_or_null(x["rawStatisticCells"][c]) or 0 for x in observations)
        for c in COLUMNS
    }
    printed_totals = dict(zip(COLUMNS, [int_or_null(x) for x in last[2:]]))
    differences = {
        c: (printed_totals[c] - compound_sums[c]) if printed_totals[c] is not None else None
        for c in COLUMNS
    }
    return {
        "date": date,
        "category": kind,
        "sourceUrl": f"https://www.ww2.dk/oob/statistics/{source_name}",
        "sourceDescription": parser.description,
        "reportingUniverse": "Listed Luftwaffe fighter units across theaters, NOT a geographic theater-specific or entire-air-force return",
        "records": observations,
        "printedCategoryTotal": printed_totals,
        "originalPrintedTotalCells": dict(zip(COLUMNS, last[2:])),
        "rawSumUnambiguousUnits": {
            c: sum(x["statistics"][c] or 0 for x in observations) for c in COLUMNS
        },
        "derivedSumIncludingMultiTypeSourceCells": compound_sums,
        "sourcePrintedMinusComputedByColumn": differences,
        "allComparableColumnsMatch": all(v in (0, None) for v in differences.values()),
        "numberOfRowsContainingCompoundCounts": sum(bool(x["mixedOrNonNumericCells"]) for x in observations),
    }


def main():
    if len(sys.argv) != 3:
        raise SystemExit("Usage: transcribe-german-fighter-readiness.py INPUT_DIR OUTPUT_JSON")
    input_dir, output_file = Path(sys.argv[1]), Path(sys.argv[2])
    source_files = sorted(input_dir.glob("german-se*.htm*")) + sorted(input_dir.glob("german-te*.htm*"))
    assert len(source_files) >= 18, f"Expected 18 downloaded dated source pages; got {len(source_files)}"
    reports = [one_page(path) for path in source_files]
    reports.sort(key=lambda x: (x["date"], x["category"]))
    payload = {
        "id": "LUFTWAFFE-HOLM-QUARTER-YEAR-1938-1942",
        "indexUrl": "https://www.ww2.dk/oob/statistics/gob.htm",
        "archivalBasis": "Luftwaffe Generalquartiermeister RL 2-III/700-734; US AFHRA HRA 137.306-14 microfilm A1128; UK AIR 40/1207 summary",
        "originalRecordType": "Soll, Istbestand, Einsatzbereitschaft, Verluste und Reserven der fliegenden Verbände",
        "sourceClass": "secondary transcription of historical German primary unit readiness reports",
        "reviewStatus": "not_checked_against_original_microfilm",
        "missingDataConventions": "Numerical blanks/hyphens remain null, never zero; mixed strings preserved in rawStatisticCells",
        "pilotSemantics": "Pilots present, ready, limited duty are contemporaneous personnel strength categories, NOT pilot fatalities or claims",
        "totalDataRows": sum(len(r["records"]) for r in reports),
        "dateAndCategorySnapshots": len(reports),
        "reports": reports,
    }
    output_file.parent.mkdir(parents=True, exist_ok=True)
    output_file.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Parsed {len(reports)} dated fighter-category reports and {payload['totalDataRows']} unit-type records")
    print(*[(r["date"], r["category"], r["printedCategoryTotal"]["aircraftOnStrength"], r["printedCategoryTotal"]["aircraftServiceable"],r["numberOfRowsContainingCompoundCounts"]) for r in reports],sep="\n")


if __name__ == "__main__":
    main()
