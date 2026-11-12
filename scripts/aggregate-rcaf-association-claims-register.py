#!/usr/bin/env python3
"""Aggregate dated entries from the RCAF Association claims PDF text.

Input is a local, text-extracted reference PDF, which is NOT redistributed.
Output contains only derived year/squadron counts and QA indicators, not the
source's names, wording, aircraft-by-aircraft rows or copyrighted compilation.

The PDF combines Canadian RAF, Fleet Air Arm, and RCAF aircrew claims. A row
represents a *listed claim entry*, not a unique kill or an enemy aircraft loss.
"""

from __future__ import annotations

import argparse
from collections import Counter, defaultdict
from datetime import date
import json
from pathlib import Path
import re

PDF_URL = "https://www.rcafassociation.ca/wp-content/uploads/2026/06/RCAF-Combat-Claims.pdf"
DATE_RE = re.compile(r"\b(?P<day>\d{1,2})-(?P<month>[A-Z][a-z]{2})-(?P<year>\d{2})\b")
MONTHS = {name: idx for idx, name in enumerate("Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(), 1)}
UNIT_RE = re.compile(r"(?<!\d)(\d{1,4})\s*(?:\((?:RCAF|RAF|RN|FAA)\))?\s*Sqn\b", re.IGNORECASE)
INLINE_UNIT_RE = re.compile(r"(?<!\d)(\d{1,4})\s*(?:\((?:RCAF|RAF|RN|FAA)\))?\s*$", re.IGNORECASE)
NUMBER_IN_FIRST_COLUMN_RE = re.compile(r"^\s*(\d{1,4})(?:\s*\((?:RCAF|RAF|RN|FAA)\))?(?:\s*$|\s{3,}.*)$", re.IGNORECASE)
AIR_AFFILIATION_RE = re.compile(r"\b(RAFCAN|FAACAN|RCAF|RAAF|RAF|RCNVR)\b")


def determine_unit(lines: list[str], index: int, date_match: re.Match[str]) -> tuple[str | None, str]:
    """Use only adjacent first-column OCR; never assign a unit speculatively."""
    current_prefix = lines[index][:date_match.start()]
    direct = list(UNIT_RE.finditer(current_prefix))
    if direct:
        return direct[-1].group(1), "same_line"
    inline = INLINE_UNIT_RE.search(current_prefix)
    if inline:
        return inline.group(1), "same_line_incomplete_heading"

    # Large RCAF block cells often span three lines: `418` / `(RCAF)` / `Sqn`.
    # A preceding number is safe only if there are no other date rows between it
    # and the current date, and its intervening lines are column-heading scraps.
    for back in range(1, 6):
        j = index - back
        if j < 0 or DATE_RE.search(lines[j]):
            break
        candidate = NUMBER_IN_FIRST_COLUMN_RE.match(lines[j])
        if candidate and 1 <= int(candidate.group(1)) <= 9999:
            between = [item[:65].strip() for item in lines[j + 1:index]]
            if all(not item or item in {"(RCAF)", "(RAF)", "(RN)", "(FAA)", "Sqn"} for item in between):
                return candidate.group(1), "adjacent_multiline"
    return None, "unresolved"


def aggregate(text: str) -> dict:
    summary = Counter()
    by_year = Counter()
    by_year_unit = Counter()
    by_year_affiliation = Counter()
    unit_method = Counter()
    sample_problems = []
    for page_number, page in enumerate(text.split("\f"), 1):
        lines = page.splitlines()
        for idx, line in enumerate(lines):
            matches = list(DATE_RE.finditer(line))
            if not matches:
                continue
            if len(matches) != 1:
                summary["multiple_date_tokens_on_line"] += 1
                continue
            matched = matches[0]
            try:
                day = int(matched.group("day"))
                month = MONTHS[matched.group("month")]
                year = 1900 + int(matched.group("year"))
                event_date = date(year, month, day)
            except (KeyError, ValueError):
                summary["invalid_date_rows"] += 1
                continue
            summary["all_dated_rows"] += 1
            if not date(1939, 9, 1) <= event_date <= date(1945, 5, 9):
                summary["outside_european_cutoff_or_wwii"] += 1
                continue
            summary["wartime_dated_claim_entry_rows"] += 1
            by_year[year] += 1
            unit, method = determine_unit(lines, idx, matched)
            unit_method[method] += 1
            if unit is not None:
                by_year_unit[(year, f"{int(unit)} Sqn")] += 1
            else:
                summary["unresolved_squadron"] += 1
                if len(sample_problems) < 8:
                    sample_problems.append({"page": page_number, "date": event_date.isoformat()})
            suffix = line[matched.end():]
            affiliation = AIR_AFFILIATION_RE.search(suffix)
            if affiliation:
                by_year_affiliation[(year, affiliation.group(1))] += 1
            else:
                summary["unresolved_affiliation"] += 1

    units = defaultdict(dict)
    for (year, unit), count in sorted(by_year_unit.items()):
        units[unit][str(year)] = count
    return {
        "id": "RCAF-ASSOCIATION-CLAIMS-DERIVED-ANNUAL-SQUADRON-ENTRY-COUNTS-1939-1945",
        "sourceUrl": PDF_URL,
        "sourceClass": "2026 secondary compilation by Royal Canadian Air Force Association, drawing on pilot and unit claims; source PDF is retained as external reference only",
        "scope": "Dated entries 1939-09-01 through 1945-05-09 inclusive. Aircrew affiliation may include RAF/FAA Canadians and RAAF, not all Canadian national service. SOURCE NOT THEATER FILTERED: Southeast Asian/Pacific entries can occur and must be excluded before any European aggregation.",
        "metric": "number_of_combat_claim_listing_rows_not_unique_aircraft_destroyed",
        "importantCautions": [
            "An individual aircrew/claim can appear more than once. No duplicate resolution, shared claim fractions, confirmation, cause, claimed target, or whether one event was ground/air was inferred.",
            "These are not actual enemy aircraft losses. Do not add to RAF national credited totals, aggregate as unique victories or compare directly to opposing loss reports.",
            "Some source entries concern East Asia rather than Europe. This preparatory source-level census is deliberately NOT an Atlas-ready European total.",
            "Missing/garbled squadron affiliations in PDF text are excluded from unit series but included in annual observed entries.",
            "Some 1944–45 RCAF squadron headings are split across PDF lines and recovered only when structurally unambiguous.",
            "The PDF has postwar claim sections even though each page header says '1939-40'. Postwar data excluded by numeric date validation.",
            "This is a derived summary, not a reproduction of the original claims register. Refer to source pages to validate any future individual aircraft/pilot import.",
        ],
        "quality": {
            **dict(summary),
            "uniqueSquadronDesignationsWithResolvedEntries": len(units),
            "squadronResolutionMethod": dict(unit_method),
            "unresolvedSquadronExamplePageAndDates": sample_problems,
        },
        "annualObservedClaimEntryRows": [{"year": year, "entries": count} for year, count in sorted(by_year.items())],
        "annualAffiliationTokenObservations": [
            {"year": year, "affiliationToken": affiliation, "entries": count}
            for (year, affiliation), count in sorted(by_year_affiliation.items())
        ],
        "squadronAnnualObservedClaimEntryRows": [
            {"squadron": squadron, "entriesByYear": years}
            for squadron, years in sorted(units.items(), key=lambda item: (int(item[0].split()[0]), item[0]))
        ],
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    result = aggregate(args.input.read_text(encoding="utf-8"))
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result["quality"], indent=2))


if __name__ == "__main__":
    main()
