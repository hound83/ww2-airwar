#!/usr/bin/env python3
"""Aggregate aviation-squadron deaths from the Finnish National Archives CSV.

Usage: python3 scripts/aggregate-finnish-air-force-war-deaths.py men_perus.csv OUTPUT.json

The archive publishes individual death records openly under CC BY 4.0; this
script exports unit/year/cause counts only, never personal names. Matching a
flying squadron does NOT establish that a person was a pilot or died in flight.
"""

import csv
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path


# Original abbreviations include LLv. and later Le.Lv., HLe.Lv., PLe.Lv.
# Unit aliases are grouped by numeric squadron for research ONLY: identities
# and renamings must still be established from Finnish unit war diaries.
SQUADRON_RE = re.compile(r"(?<![A-Za-z])(?:[HP])?(?:Le\.Lv|LLv|LeLv)\.?\s*(\d{1,3})", re.I)

CAUSE_CODES = {
    "A": "killed_in_action_body_recovered_and_buried",
    "B": "died_of_wounds",
    "C": "killed_in_action_body_missing_or_destroyed",
    "D": "missing_declared_dead",
    "F": "died_as_prisoner_of_war",
    "S": "death_not_caused_by_enemy_action",
    "T": "executed_or_shot_as_deserter",
    "": "unknown_or_not_recorded",
}


def transcribe(path):
    sqs = defaultdict(list)
    seen_ids = set()
    all_rows = 0
    for rec in csv.DictReader(Path(path).open(encoding="utf-8-sig", newline=""), delimiter=";"):
        all_rows += 1
        match = SQUADRON_RE.search(rec["josnimi"] or "")
        if not match:
            continue
        assert rec["id"] not in seen_ids, f"Duplicate source record: {rec['id']}"
        seen_ids.add(rec["id"])
        cause = (rec["menehtluokka"] or "").strip()
        assert cause in CAUSE_CODES, f"Unrecognized source death-category code: {cause}"
        date = (rec["kuolinaika"] or "").strip()
        year = date[-4:] if re.fullmatch(r"\d\d\.\d\d\.\d{4}", date) else None
        if year and not 1939 <= int(year) <= 1945:
            year = None
        sqs[int(match.group(1))].append({
            "originalUnit": (rec["josnimi"] or "").strip(),
            "year": year,
            "causeCode": cause,
        })

    records = []
    for number in sorted(sqs):
        items = sqs[number]
        years = Counter(r["year"] or "unresolved" for r in items)
        causes = Counter(r["causeCode"] or "unknown" for r in items)
        unit_names = Counter(r["originalUnit"] for r in items)
        by_year_and_cause = defaultdict(Counter)
        for item in items:
            by_year_and_cause[item["year"] or "unresolved"][item["causeCode"] or "unknown"] += 1
        records.append({
            "squadronNumberAsReported": number,
            "wartimeDeathsRecorded": len(items),
            "byYear": dict(sorted(years.items())),
            "byReportedDeathCategory": dict(sorted(causes.items())),
            "byYearAndReportedDeathCategory": {y: dict(sorted(count.items())) for y, count in sorted(by_year_and_cause.items())},
            "originalUnitLabelsWithCounts": dict(sorted(unit_names.items())),
        })

    total = sum(r["wartimeDeathsRecorded"] for r in records)
    assert total == len(seen_ids)
    return {
        "id": "FIN-NA-WAR-DEAD-AIR-SQUADRON-2022",
        "datasetTitle": "Suomen sodissa 1939-1945 menehtyneet",
        "creator": "Kansallisarkisto (National Archives of Finland)",
        "sourceUrl": "https://zenodo.org/records/6670384",
        "originalFile": "men_perus.csv",
        "originalFieldDictionary": "datan kuvailu_suomi.pdf, same Zenodo record",
        "rights": "CC BY 4.0; credit National Archives of Finland",
        "reportingUniverse": "Finnish military deaths in the 1939-1945 wars with source unit label containing an air-squadron abbreviation; subset of national all-service death roster",
        "researchStatus": "reproducible derivative_unit_aggregates; squadron aliases and aircrew roles not yet independently confirmed",
        "notEquivalentTo": ["all Finnish Air Force deaths", "pilot deaths", "combat aircraft losses", "air-to-air losses"],
        "sourceCodebook": CAUSE_CODES,
        "unitRegex": SQUADRON_RE.pattern,
        "classificationCaveat": "Unit-name strings alone do not identify job specialization, whether death was flying-related, or whether differing labels denote the same historical unit throughout the war",
        "inputRecordCountAllServices": all_rows,
        "matchedIndividualDeathRecordCount": total,
        "numberOfProvisionalSquadronGroups": len(records),
        "records": records,
    }


def main():
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    result = transcribe(sys.argv[1])
    target = Path(sys.argv[2])
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Finnish archive: {result['inputRecordCountAllServices']} records, "
          f"{result['matchedIndividualDeathRecordCount']} aviation-squadron-linked deaths, "
          f"{result['numberOfProvisionalSquadronGroups']} provisional squadron groups")


if __name__ == "__main__":
    main()
