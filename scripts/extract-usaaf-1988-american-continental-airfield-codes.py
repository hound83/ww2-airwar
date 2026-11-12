#!/usr/bin/env python3
"""Conservatively transcribe USAF 1988 original A/Y/R numerical airfield index.

Input from the official 87-page PDF, with no double-column layout:
  pdftotext -f 16 -l 45 -layout usaaf_european_airfields.pdf american-pages.txt

Every code is retained, including unusable date/name OCR, post-VE-day sites,
and files where the code is printed on a line following its description.
This is an audit-ready first pass only; the full monthly unit-occupancy column
and unusual inter-line dates require later page-by-page human checking.
"""

import argparse
import datetime
import json
import re
from collections import Counter
from pathlib import Path

CODE = re.compile(r"^\s*([AYR])-([0-9]{1,3})(?!\d)")
COUNTRY = re.compile(r",\s*(Fr|Belg|BeIg|Neth|Ger|Aus|Cz|Lux|Den)\b")
COUNTRY_NAME = {"Fr": "France", "Belg": "Belgium", "BeIg": "Belgium", "Neth": "Netherlands", "Ger": "Germany", "Aus": "Austria", "Cz": "Czechoslovakia", "Lux": "Luxembourg", "Den": "Denmark"}
DATE_TOKEN = re.compile(r"^(?:By\s+)?(\d{1,2})-(\d{1,2})-(\d{2})$")
PDF = "https://www.dafhistory.af.mil/Portals/16/documents/Timelines/World%20War%20II/usaaf_european_airfields.pdf"


def date_if_clear(s):
    m = DATE_TOKEN.fullmatch(s.strip())
    if not m:
        return None
    day, month, short_year = (int(x) for x in m.groups())
    year = 1900 + short_year
    try:
        return datetime.date(year, month, day).isoformat()
    except ValueError:
        return None


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("source_text", type=Path)
    ap.add_argument("output", type=Path)
    args = ap.parse_args()
    pages = args.source_text.read_text(encoding="utf-8").split("\f")
    if len(pages) < 30:
        raise ValueError("Expected 30 pages: PDF pages 16–45 (printed pp.13–42)")
    entries = []
    for page_idx, page in enumerate(pages[:30]):
        lines = page.splitlines()
        for i, line in enumerate(lines):
            m = CODE.match(line)
            if not m:
                continue
            prefix, number = m.groups()
            original_remainder = line[m.end():].strip()
            chosen = original_remainder
            layout = "same_line"
            if not COUNTRY.search(chosen) and not re.search(r"C[nc]x|Unassigned", chosen):
                prev = lines[i - 1].strip() if i else ""
                # Most line-wrapped rows put the description and dates one
                # physical line *before* a standalone code (Y-7, R-86).
                if COUNTRY.search(prev) and not CODE.match(prev):
                    chosen = prev
                    layout = "description_on_preceding_line"
                elif not chosen and i >= 2 and COUNTRY.search(lines[i - 2]):
                    chosen = lines[i - 2].strip()
                    layout = "description_two_lines_before_code_NEEDS_REVIEW"
                else:
                    layout = "needs_visual_check"

            parts = [x.strip() for x in re.split(r"\s{2,}", chosen) if x.strip()]
            site_part = parts[0] if parts else ""
            country = COUNTRY.search(site_part)
            site = site_part[:country.start()].strip() if country else (site_part.strip(" ,") or None)
            op_txt = parts[1] if len(parts) >= 2 else None
            release_txt = parts[2] if len(parts) >= 3 else None
            unit_hdr = parts[3] if len(parts) >= 4 else None
            status = "historical_reference_candidate"
            if "Cnx" in chosen or "Ccnstr" in chosen:
                status = "construction_cancelled"
                op_txt = release_txt = None
            elif "Unassigned" in chosen:
                status = "unassigned"
                op_txt = release_txt = None
            if country is None:
                layout += "_country_unverified"

            entries.append({
                "code": f"{prefix}-{number}",
                "nameOCRCandidate": site,
                "countryCandidate": COUNTRY_NAME.get(country.group(1)) if country else None,
                "initialOperationDateOCR": op_txt,
                "initialOperationDateISOIfClear": date_if_clear(op_txt) if op_txt else None,
                "releaseDateOCR": release_txt,
                "releaseDateISOIfClear": date_if_clear(release_txt) if release_txt else None,
                "firstLineCombatUnitOrUseOCRNotComplete": unit_hdr,
                "printedOriginalPage": 13 + page_idx,
                "layoutStatus": layout,
                "status": status,
                "validationStatus": "header_level_OCR_not_verified_full_unit_occupancy_or_postwar_cutoff",
            })

    entries.sort(key=lambda r: ("AYR".index(r["code"][0]), int(r["code"].split("-")[1])))
    observed = [x["code"] for x in entries]
    expected = [f"A-{i}" for i in range(1, 100)] + [f"Y-{i}" for i in range(1, 100)] + [f"R-{i}" for i in range(1, 99)]
    audit = {
        "sourceHeaderCount": len(entries),
        "uniqueCodeCount": len(set(observed)),
        "missingExpectedCodes": [c for c in expected if c not in observed],
        "duplicateCodes": [c for c, n in Counter(observed).items() if n > 1],
        "codesByPrefix": dict(sorted(Counter(r["code"][0] for r in entries).items())),
        "codesByStatus": dict(sorted(Counter(r["status"] for r in entries).items())),
        "codesByHeaderLayout": dict(sorted(Counter(r["layoutStatus"] for r in entries).items())),
        "codesWithCountryCandidate": sum(r["countryCandidate"] is not None for r in entries),
        "codesWithUnambiguousInitialDate": sum(r["initialOperationDateISOIfClear"] is not None for r in entries),
        "codesWithUnambiguousReleaseDate": sum(r["releaseDateISOIfClear"] is not None for r in entries),
        "initialDateAfterAtlasEndAmongUnambiguous": sum(r["initialOperationDateISOIfClear"] is not None and r["initialOperationDateISOIfClear"] > "1945-05-09" for r in entries),
    }
    result = {
        "source": {"title": "US Army Air Forces Continental Airfields (ETO): D-Day to V-E Day", "author": "1st Lt David C. Johnson", "institution": "USAF Historical Research Center", "published": "1988-12-01", "originalPDF": PDF, "section": "Part I, numerical index A-1–A-99, Y-1–Y-99, R-1–R-98, original pp.13–42"},
        "status": "first_pass_original_1988_american_code_header_extraction_needs_review",
        "semantics": [
            "Airfield code is not modern ICAO, and the first operations/release dates are source claims rather than proof of a unit's monthly strength.",
            "First-row combat unit field is an INCOMPLETE OCR fragment; full original page unit occupation lines are not yet transcribed.",
            "Some descriptions/dates physically precede code lines and their OCR layout needs visual verification.",
            "Some original entries are explicitly post-9-May-1945 and MUST NOT populate Atlas wartime operational maps.",
            "Preserve unknown/erroneous dates (e.g. OCR character I instead of 1) rather than making invented calendar dates.",
        ],
        "audit": audit,
        "records": entries,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(audit, indent=2))


if __name__ == "__main__":
    main()
