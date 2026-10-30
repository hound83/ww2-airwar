#!/usr/bin/env python3
"""Preserve USAAF ETO 1944-45 code-to-unit month-window evidence candidates.

Input is `pdftotext -f 16 -l 45 -layout` of USAF History Center's 1988
European continental airfield code study. Physical rows may put a code BELOW
the description, and several unit rows follow their coded header. Preserve
OCR evidence and ambiguity; do not assert verified unit dates or coordinates.
"""

import argparse
import json
import re
from collections import Counter
from pathlib import Path

CODE = re.compile(r"^\s*([AYR])-(\d{1,3})(?!\d)")
UNIT = re.compile(r"\b(?:\d{1,4}(?:st|nd|rd|th)|IX)\s+(?:[A-Za-z]+\s+){0,5}(?:Gp|Sq|AAFBU)\b", re.I)
SITE = re.compile(r",\s*(?:Fr|Belg|BeIg|Neth|Ger|Aus|Cz|Lux|Den)\b")
MONTH = re.compile(r"\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Nor|Note|Tun|7un|Tan)[A-Za-z.-]*\s*(?:[-–]\s*)?(?:[A-Za-z]{3,5}\s*)?\d{2}\b", re.I)
REAL_MONTHS = {name.lower(): idx for idx, name in enumerate(("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"), 1)}
SPAN = re.compile(
    r"\b(?P<first>Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*"
    r"(?P<first_year>44|45)?\s*[-–]{1,2}\s*"
    r"(?P<last>Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*"
    r"(?P<last_year>44|45)\b", re.I,
)
SINGLE_MONTH = re.compile(r"\b(?P<first>Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*(?P<year>44|45)\b", re.I)
SOURCE_URL = "https://www.dafhistory.af.mil/Portals/16/documents/Timelines/World%20War%20II/usaaf_european_airfields.pdf"


def unit_column(line):
    """Find designation in OCR line, but not source footnote prose."""
    m = UNIT.search(line)
    if not m:
        return None
    prefix = line[:m.start()]
    # On header rows unit names start after initial operation/release columns.
    # On continuation rows they start deeply indented in the unit column.
    # A line with an explicit site+country may legitimately start earlier.
    if not CODE.match(line) and not SITE.search(line) and len(prefix.strip()) == 0 and m.start() < 50:
        return None
    if not CODE.match(line) and m.start() < 45 and not SITE.search(line):
        return None
    return m


def clear_month_interval(source_unit_fragment):
    """Machine-read only plainly printed month windows; otherwise null."""
    m = SPAN.search(source_unit_fragment)
    if m:
        first_num = REAL_MONTHS[m.group("first").lower()]
        last_num = REAL_MONTHS[m.group("last").lower()]
        last_year = 1900 + int(m.group("last_year"))
        first_year = 1900 + int(m.group("first_year")) if m.group("first_year") else (
            last_year - 1 if first_num > last_num else last_year
        )
        if (first_year, first_num) <= (last_year, last_num):
            return f"{first_year:04d}-{first_num:02d}", f"{last_year:04d}-{last_num:02d}"
        return None, None
    m = SINGLE_MONTH.search(source_unit_fragment)
    if m:
        # Reject a first-month fallback if another recognisable month
        # follows (e.g. OCR `Oct 44 .Mar 45`, an illegible range separator).
        # Also reject `Nor 44-Aug 45`: the month preceding the hyphen is
        # corrupted, so the second month is NOT the starting month.
        if SINGLE_MONTH.search(source_unit_fragment, m.end()) or re.search(r"\b(?:44|45)\b", source_unit_fragment[:m.start()]):
            return None, None
        month = f"{1900 + int(m.group('year')):04d}-{REAL_MONTHS[m.group('first').lower()]:02d}"
        return month, month
    return None, None


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("layout_text", type=Path)
    p.add_argument("out_json", type=Path)
    args = p.parse_args()

    pages = args.layout_text.read_text(encoding="utf-8").split("\f")
    if len(pages) < 30:
        raise ValueError("Expected PDF pages 16–45 (printed pp.13–42)")

    records = []
    reassigned_preheader = []
    orphan_unit_lines = []
    codes_by_page = Counter()
    for page_idx, page in enumerate(pages[:30]):
        lines = page.splitlines()
        headers = [(i, f"{m.group(1)}-{int(m.group(2))}") for i, line in enumerate(lines) if (m := CODE.match(line))]
        codes_by_page[13 + page_idx] = len(headers)
        header_index = {i: code for i, code in headers}
        for i, line in enumerate(lines):
            match = unit_column(line)
            if not match:
                continue

            code = header_index.get(i)
            status = "on_code_row" if code else "unit_column_following_code_candidate"
            if code is None:
                previous = [(j, c) for j, c in headers if j < i]
                next_headers = [(j, c) for j, c in headers if j > i]
                if not previous and not next_headers:
                    orphan_unit_lines.append({"page": 13 + page_idx, "physicalLineOnPage": i + 1})
                    continue
                if next_headers and next_headers[0][0] - i <= 2:
                    next_line_no, next_code = next_headers[0]
                    next_line = lines[next_line_no]
                    # Explicit source wrap: site/date/unit is printed *above*
                    # the code, or date/unit above a code with only a site.
                    # Do not silently attribute to the preceding airfield.
                    preceding_structured_row = SITE.search(line) or (
                        bool(re.search(r"\b\d{1,2}-\d{1,2}-\d{2}\b", line[:match.start()]))
                        and not re.search(r"\b\d{1,2}-\d{1,2}-\d{2}\b", next_line)
                    )
                    if preceding_structured_row:
                        code = next_code
                        status = "physical_line_precedes_code_needs_source_visual_review"
                        reassigned_preheader.append({"code": code, "page": 13 + page_idx, "line": i + 1})
                if code is None and previous:
                    code = previous[-1][1]
                if code is None:
                    orphan_unit_lines.append({"page": 13 + page_idx, "physicalLineOnPage": i + 1})
                    continue

            source_unit_fragment = line[match.start():].strip()
            # These are source OCR fragments, NOT normalised unit IDs.
            # Keep enough to enable independent page-by-page verification.
            time = MONTH.search(source_unit_fragment)
            start_month, end_month = clear_month_interval(source_unit_fragment)
            records.append({
                "continentalAirfieldCodeCandidate": code,
                "unitAndPeriodOCR": source_unit_fragment,
                "unitDesignationOCR": match.group().strip(),
                "sourceMonthDateWindowOCRCandidate": source_unit_fragment[time.start():].strip() if time else None,
                "firstMonthISOIfUnambiguous": start_month,
                "lastMonthISOIfUnambiguous": end_month,
                "printedOriginalPage": 13 + page_idx,
                "physicalLineOnPrintedPage": i + 1,
                "sourceRowAssociation": status,
                "status": "ocr_research_candidate_not_verified_unit_station_date_or_airfield_location",
            })

    codes = {record["continentalAirfieldCodeCandidate"] for record in records}
    result = {
        "source": {
            "title": "U.S. Army Air Forces Continental Airfields (ETO): D-Day to V-E Day",
            "author": "1st Lt David C. Johnson",
            "institution": "USAF Historical Research Center",
            "published": "1988-12-01",
            "originalPdf": SOURCE_URL,
            "printedPages": "13–42",
        },
        "meaning": [
            "These are physical OCR line candidates from USAF 1988 airfield study; NOT confirmed station assignments or resolved historical geocoordinates.",
            "A given source line may contain group, squadron or detachment and may overlap with other units at the same airfield; do NOT sum across hierarchy.",
            "Date windows are source's imprecise reported month ranges, not precise first/last occupancy days; some windows extend after 9 May 1945.",
            "Source uses two layouts: code before site or code after site; preheader associations explicitly flagged for visual verification.",
            "OCR errors including malformed month names are retained verbatim, not silently repaired.",
            "Some RAF/USAAF headquarters or unnamed units without ordinary numeric Gp/Sq/AAFBU designations are omitted and must be studied separately.",
        ],
        "audit": {
            "candidateSourcePhysicalLines": len(records),
            "distinctAirfieldCodeCandidatesWithUnits": len(codes),
            "candidateSourceLineCountsByPrefix": dict(sorted(Counter(r["continentalAirfieldCodeCandidate"][0] for r in records).items())),
            "candidateSourceLineCountsByAssociation": dict(sorted(Counter(r["sourceRowAssociation"] for r in records).items())),
            "candidateLinesWithReadableMonthWindowOCR": sum(r["sourceMonthDateWindowOCRCandidate"] is not None for r in records),
            "candidateLinesWithMachineReadableMonthSpan": sum(r["firstMonthISOIfUnambiguous"] is not None for r in records),
            "candidatesOnlyStartingAfterAtlasWarEnd": sum(r["firstMonthISOIfUnambiguous"] is not None and r["firstMonthISOIfUnambiguous"] > "1945-05" for r in records),
            "candidatesWithDateWindowsExtendingBeyondAtlasWarEnd": sum(r["lastMonthISOIfUnambiguous"] is not None and r["lastMonthISOIfUnambiguous"] > "1945-05" for r in records),
            "preHeaderAssignmentsNeedingVisualReview": reassigned_preheader,
            "unitLinesWithoutCodeAssociation": orphan_unit_lines,
            "sourceAirfieldHeaderCountsByPrintedPage": dict(sorted(codes_by_page.items())),
        },
        "records": records,
    }
    args.out_json.parent.mkdir(parents=True, exist_ok=True)
    args.out_json.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(result["audit"], indent=2))


if __name__ == "__main__":
    main()
