#!/usr/bin/env python3
"""Research-only extraction of wartime USAAF group station statements.

Input is the two *public-domain U.S. Air Force Historical Division* PDF
volumes of Maurer Maurer's Air Force Combat Units of World War II (1961).
Download the volumes from the URLs in SOURCE_VOLUMES and provide their
filenames as --part1/--part2. Requires Poppler's pdftotext. OCR errors are
retained and reported, not silently turned into authoritative map markers.
"""

import argparse
import json
import re
import subprocess
from collections import Counter
from pathlib import Path


SOURCE_VOLUMES = [
    "https://www.ibiblio.org/hyperwar/AAF/AAFHS/AAFHS-140.1.pdf",
    "https://www.ibiblio.org/hyperwar/AAF/AAFHS/AAFHS-140.2.pdf",
]

GROUP_HEADER = re.compile(
    r"(?m)^\s*(\d{1,3}|[Il]l)(st|nd|rd|th|d|lth)\s*"
    r"(FIGHTER|BOMBARDMENT|TROOP\s*CARRIER|RECONNAISSANCE|"
    r"PHOTOGRAPHIC|COMPOSITE|ANTISUBMARINE|TRANSPORT|TROOP\s+TRANSPORT)\s*"
    r"GROUP\b"
)
STATION_START = re.compile(r"\bSTATIONS\s*\.\s*", re.I)
STATION_END = re.compile(r"\b(?:COMMANDERS|CAMPAIGNS|DECORATIONS|INSIGNE)\s*\.", re.I)
MONTHS = {m: i for i, m in enumerate([
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
], 1)}
MONTH_PAT = r"Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec"
EXACT_DATE = re.compile(rf"\b([0-3]?\d|I|l)\s+({MONTH_PAT})\s+(19[34]\d|1945)\b", re.I)
MONTH_DATE = re.compile(rf"\b({MONTH_PAT})\s+(19[34]\d|1945)\b", re.I)

# Geography is classified by the original station's contemporary designation,
# without guessing present-day countries or airfield latitude/longitude.
THEATRE_REGIONS = {
    "England": "ETO", "Scotland": "ETO", "Wales": "ETO",
    "Northern Ireland": "ETO", "Ireland": "ETO", "Iceland": "ETO",
    "France": "ETO", "Germany": "ETO", "Belgium": "ETO",
    "Holland": "ETO", "Netherlands": "ETO", "Luxembourg": "ETO",
    "Austria": "ETO", "Poland": "ETO", "Czechoslovakia": "ETO",
    "Russia": "Eastern Europe", "USSR": "Eastern Europe",
    "Italy": "Mediterranean", "Sicily": "Mediterranean",
    "Sardinia": "Mediterranean", "Corsica": "Mediterranean",
    "Algeria": "Mediterranean", "Morocco": "Mediterranean",
    "Tunisia": "Mediterranean", "Libya": "Mediterranean",
    "Egypt": "Mediterranean", "Malta": "Mediterranean",
    "Greece": "Mediterranean", "Yugoslavia": "Mediterranean",
    "Rumania": "Mediterranean", "Romania": "Mediterranean",
}
REGION_PATTERN = re.compile(
    r",\s*(" + "|".join(map(re.escape, sorted(THEATRE_REGIONS, key=len, reverse=True)))
    + r")\s*,?\s*", re.I
)


def parse_date(station_date):
    """Only establish a date for an unambiguous printed day/month/year token."""
    exacts = list(EXACT_DATE.finditer(station_date))
    if exacts:
        m = exacts[0]
        day_s = m.group(1).replace("I", "1").replace("l", "1")
        day = int(day_s)
        mon = m.group(2)[:3].title()
        year = int(m.group(3))
        if 1 <= day <= 31:
            return f"{year:04}-{MONTHS[mon]:02}-{day:02}", "day"
    month = MONTH_DATE.search(station_date)
    if month:
        mon = month.group(1)[:3].title()
        return f"{int(month.group(2)):04}-{MONTHS[mon]:02}", "month"
    return None, "unresolved"


def tidy_station_text(raw):
    # Correct line wraps, never edit names or digit OCR (I / 1, g / 9).
    raw = re.sub(r"-\s*\n\s*", "", raw)
    raw = raw.replace("\f", " ")
    raw = re.sub(r"\bAIR FORCE COMBAT UNITS(?: OF WORLD WAR I[I1])?\b", " ", raw)
    raw = re.sub(r"\b\d{1,3}\s+AIR FORCE COMBAT UNITS(?:-GROUPS)?\b", " ", raw)
    return re.sub(r"\s+", " ", raw).strip()


def collect_volume(pdf, source_url, part):
    raw = subprocess.check_output(["pdftotext", "-raw", str(pdf), "-"], text=True)
    headers = list(GROUP_HEADER.finditer(raw))
    extracted = []
    anomalies = []
    for idx, header in enumerate(headers):
        unit_num_raw, ordinal, role = header.group(1, 2, 3)
        unit_num = unit_num_raw.replace("I", "1").replace("l", "1")
        if not unit_num.isdecimal():
            anomalies.append({"part": part, "header": header.group(0), "error": "OCR number"})
            continue
        unit = f"{int(unit_num)} {re.sub(r'\s+', ' ', role.title())} Group"
        body_end = headers[idx + 1].start() if idx + 1 < len(headers) else len(raw)
        body = raw[header.end():body_end]
        station_markers = list(STATION_START.finditer(body))
        if not station_markers:
            anomalies.append({"unit": unit, "part": part, "error": "no STATIONS heading"})
            continue
        if len(station_markers) > 1:
            anomalies.append({"unit": unit, "part": part, "error": "multiple STATIONS headings"})
        station_header = station_markers[0]
        tail = body[station_header.end():]
        end = STATION_END.search(tail)
        raw_station_section = tail[:end.start()] if end else tail[:2000]
        if len(raw_station_section) > 2800:
            anomalies.append({"unit": unit, "part": part, "error": "unusually long station section"})
            raw_station_section = raw_station_section[:2800]
        page = raw[:header.start()].count("\f") + 1
        raw_statements = tidy_station_text(raw_station_section)
        candidate_statements = raw_statements.split(";")
        station_records = []
        for seq, statement in enumerate(candidate_statements):
            statement = statement.strip(" .")
            region_match = REGION_PATTERN.search(statement)
            if not region_match:
                continue
            name = statement[:region_match.start()].strip(" ,.")
            region = region_match.group(1)
            date_raw = statement[region_match.end():].strip(" ,. ")
            start, precision = parse_date(date_raw)
            is_wartime = start is not None and "1936-01" <= start[:7] <= "1945-05"
            station_records.append({
                "sequenceInOriginalList": seq,
                "printedAirfieldOrPlace": name,
                "printedRegion": region,
                "theatre": THEATRE_REGIONS[next(r for r in THEATRE_REGIONS if r.lower() == region.lower())],
                "printedDate": date_raw,
                "startDateCandidate": start,
                "datePrecision": precision,
                "withinAtlasDateScopeCandidate": is_wartime,
                "approximateOrRange": bool(re.search(r"\bc\.|\bca\.|\babout\b|\bby\b|\bto\b|\-|\?", date_raw, re.I)),
                "originalEntry": statement,
                "quality": "candidate_not_map_ready",
            })
        extracted.append({
            "id": f"USAAF-{int(unit_num)}-{role.upper().replace(' ', '-')}",
            "unitName": unit,
            "sourcePart": part,
            "sourcePdfPageNumber": page,
            "sourceUrl": source_url,
            "fullOriginalStationStatementOcr": raw_statements,
            "europeMediterraneanStationCandidates": station_records,
            "candidateStationCount": len(station_records),
            "allStationEntriesSeparatedBySemicolon": len(candidate_statements),
            "hasMultipleStationHeaders": len(station_markers) > 1,
        })
    return extracted, anomalies, len(headers)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--part1", type=Path, required=True)
    parser.add_argument("--part2", type=Path, required=True)
    parser.add_argument("--output", type=Path, default=Path("research/transcriptions/usaaf-maurer-public-domain-european-group-station-candidates-1940-1945.json"))
    args = parser.parse_args()
    data = [collect_volume(pdf, url, i) for i, (pdf, url) in enumerate(zip([args.part1, args.part2], SOURCE_VOLUMES), 1)]
    groups = [group for batch, _, _ in data for group in batch if group["candidateStationCount"]]
    other = [group for batch, _, _ in data for group in batch if not group["candidateStationCount"]]
    out = {
        "title": "USAAF operational-group historical stationing candidates, Europe and Mediterranean, 1940-1945",
        "provenance": "USAF Historical Division, Maurer Maurer (ed.), Air Force Combat Units of World War II, US Government Printing Office (1961); official US Government public-domain record; scanned PDF OCR",
        "sourceVolumes": SOURCE_VOLUMES,
        "method": "pdftotext -raw, split printed GROUP and STATIONS headings, filter named European/Mediterranean regions; preserve verbatim OCR and flag uncertain dates. No latitude/longitude assigned.",
        "importantLimitations": [
            "RESEARCH ONLY, NOT MAP READY. Original OCR has occasional station-name, date-digit and group-heading errors; dates with only a month are not days. All entries require review before publication.",
            "These are unit stationing events, NOT aircraft-strength counts or sortie/loss observations.",
            "A group stationed in one area did not necessarily fly combat missions from every location, and squadrons/detachments could operate elsewhere.",
            "Unit records also contain postwar information. Only entries with a parsable wartime start month should be used in wartime map aggregation.",
            "Country/region and station identity are preserved as printed, not retroactively geocoded or assigned to modern countries.",
        ],
        "counts": {
            "groupHeadingsDetectedInBothVolumes": sum(c for _, _, c in data),
            "groupsWithEuropeanOrMediterraneanStationCandidates": len(groups),
            "groupsWithoutMatchingGeography": len(other),
            "namedStationCandidates": sum(g["candidateStationCount"] for g in groups),
            "candidatesWithParsedStartMonthOrDay": sum(r["startDateCandidate"] is not None for g in groups for r in g["europeMediterraneanStationCandidates"]),
            "candidatesWithPotentiallyWartimeStart": sum(r["withinAtlasDateScopeCandidate"] for g in groups for r in g["europeMediterraneanStationCandidates"]),
            "sourceOcrOrExtractionAnomalies": sum(len(a) for _, a, _ in data),
        },
        "byTheatre": dict(Counter(r["theatre"] for g in groups for r in g["europeMediterraneanStationCandidates"])),
        "groups": groups,
        "groupsWithNoMatchingGeography": [{"id": g["id"], "unitName": g["unitName"]} for g in other],
        "extractionAnomalies": [a for _, anomalies, _ in data for a in anomalies],
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(out["counts"], indent=2))
    print("byTheatre", out["byTheatre"])


if __name__ == "__main__":
    main()
