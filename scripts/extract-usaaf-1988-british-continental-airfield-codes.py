#!/usr/bin/env python3
"""Extract code-to-site *research candidates* from 1988 USAF study, pp.79–82.

Prepare the input with:
  pdftotext -f 82 -l 85 -layout original_usaaf_european_airfields.pdf british-pages.txt

Do not treat the original 1 July 1945 B-series index as proof that every
listed site existed, held that code, or was operated before 9 May 1945.
OCR and typesetting errors are retained as extracted, with flags and coverage
checks, rather than silently rewriting plausible historic place names.

Usage: python scripts/extract-usaaf-1988-british-continental-airfield-codes.py british-pages.txt output.json
"""

import argparse
import json
import re
from pathlib import Path

PAT = re.compile(r"(?:(?:B[-,]{1,2}|&-|13-))([0-9lI]+)(\*?)")
COUNTRIES = {"Fr": "France", "Belg": "Belgium", "BeIg": "Belgium", "Neth": "Netherlands", "Ger": "Germany", "Den": "Denmark"}
SOURCE = "https://www.dafhistory.af.mil/Portals/16/documents/Timelines/World%20War%20II/usaaf_european_airfields.pdf"
MIRROR = "https://ww2gp.org/pdf/airfields/usaaf_european_airfields.pdf"


def code_number(value):
    return int(value.replace("I", "1").replace("l", "1"))


def parse_candidate(segment, printed_page, quality_warnings):
    m = PAT.search(segment)
    if not m or segment[:m.start()].strip():
        return []
    code = code_number(m.group(1))
    raw = segment[m.end():].strip()
    if code < 1 or code > 174:
        quality_warnings.append(f"Out-of-index code B-{code} on printed page {printed_page}")
        return []
    # Restrict to the first 1–2 runs of wide whitespace, preserving internal
    # spaces in site names and OCR typos as published in the extracted text.
    raw = re.split(r"\s{4,}", raw, maxsplit=1)[0].strip()
    entries = [code]
    if raw.startswith("& B-"):
        paired = re.match(r"& B-([0-9]+)\s+(.*)$", raw)
        if paired:
            entries.append(int(paired.group(1)))
            raw = paired.group(2)
    if "Unassigned" in raw:
        status, site = "unassigned", None
    elif "Renumbered" in raw:
        status, site = "renumbered_not_a_distinct_b_airfield", None
    elif "Cnx" in raw:
        status, site = "construction_cancelled", None
    elif re.search(r"\b(?:Fr|Belg|BeIg|Neth|Ger|Den)$", raw):
        status, site = "historical_code_site_candidate", raw
    elif raw.endswith("to") or not raw:
        return []
    else:
        quality_warnings.append(f"Unknown status/site on page {printed_page}, code B-{code}: {raw[:80]}")
        status, site = "unverified_ocr_text", raw

    result = []
    for n in entries:
        country_match = re.search(r",\s*(Fr|Belg|BeIg|Neth|Ger|Den)$", site or "")
        country = COUNTRIES.get(country_match.group(1)) if country_match else None
        result.append({
            "code": f"B-{n}",
            "siteNameOCRAsPrinted": re.sub(r",\s*(Fr|Belg|BeIg|Neth|Ger|Den)$", "", site).strip() if site else None,
            "countryAsPrintedMapped": country,
            "status": status,
            "originalTablePrintedPage": printed_page,
            "sourcePageAsOf": "1945-07-01",
            "validationStatus": "site_name_ocr_needs_figure_and_wartime_date_check",
        })
    return result


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("source_text", type=Path)
    ap.add_argument("output", type=Path)
    args = ap.parse_args()
    pages = args.source_text.read_text(encoding="utf-8").split("\f")
    if len(pages) < 4:
        raise ValueError("Expected four OCR layout pages for printed pp.79–82")
    records = []
    warnings = []
    for idx, page in enumerate(pages[:4]):
        printed_page = idx + 79
        for line in page.splitlines():
            matches = list(PAT.finditer(line))
            if not matches:
                continue
            # The source is a two-column index and sometimes OCR substitutes
            # '&-' or '13-' for 'B-' (or the letter 'l' for digit one).
            right = next((m.start() for m in matches if m.start() >= 35), None)
            left_text = line[:right] if right is not None else line
            right_text = line[right:] if right is not None else ""
            for segment in (left_text, right_text):
                records.extend(parse_candidate(segment.strip(), printed_page, warnings))

    # Printed p.81 puts "B--121 to" and "B--149 Unassigned" on separate
    # lines, which is an explicit range, not two independent airports.
    if 'B--121 to' not in args.source_text.read_text(encoding="utf-8"):
        warnings.append("Could not confirm printed B-121 through B-149 unassigned range")
    else:
        for n in range(121, 150):
            if not any(r["code"] == f"B-{n}" for r in records):
                records.append({
                    "code": f"B-{n}", "siteNameOCRAsPrinted": None,
                    "countryAsPrintedMapped": None, "status": "unassigned",
                    "originalTablePrintedPage": 81, "sourcePageAsOf": "1945-07-01",
                    "validationStatus": "explicit_unassigned_range_in_original_table",
                })

    records.sort(key=lambda r: int(r["code"].split("-")[1]))
    codes = [r["code"] for r in records]
    duplicates = sorted({c for c in codes if codes.count(c) > 1})
    missing = [f"B-{n}" for n in range(1, 175) if f"B-{n}" not in codes]
    audit = {
        "recordsExtracted": len(records),
        "coverageRange": "B-1 through B-174",
        "uniqueCodes": len(set(codes)),
        "unmatchedCodes": missing,
        "duplicateCodes": duplicates,
        "statuses": {status: sum(r["status"] == status for r in records) for status in sorted({r["status"] for r in records})},
        "countriesForNamedCandidateRows": {country: sum(r["countryAsPrintedMapped"] == country and r["status"] == "historical_code_site_candidate" for r in records) for country in sorted(set(r["countryAsPrintedMapped"] for r in records if r["countryAsPrintedMapped"]))},
        "manualOCRWarnings": warnings,
    }
    output = {
        "source": {"title": "US Army Air Forces Continental Airfields (ETO), D-Day to V-E Day", "author": "1st Lt David C. Johnson, USAF", "publisher": "USAF Historical Research Center, Research Division, 1 December 1988", "originalOfficialPDF": SOURCE, "mirrorRead": MIRROR, "section": "Part III: British Airfields, original printed pp.79–82", "indexReferenceAsOf": "1945-07-01"},
        "rights": "U.S. government-authored historical research; preserve attribution and original-page provenance",
        "semantics": [
            "Official historical B-code index as of 1 July 1945: this is beyond Atlas's exact 9 May 1945 endpoint.",
            "B-code and location name do not prove the runway operated on that date or which unit used it during the war.",
            "Original paper is printed in two columns. OCR has obvious name/code errors; site names are deliberately uncorrected pending visual proofing.",
            "Unassigned and renumbered codes MUST NOT be plotted as physical airfields.",
            "British B-code is an operational/administrative identifier, not a modern airport ICAO or IATA identifier.",
        ],
        "audit": audit,
        "records": records,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(audit, indent=2))


if __name__ == "__main__":
    main()
