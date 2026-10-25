#!/usr/bin/env python3
"""Reproducibly publish archival transcriptions as a small static JS module."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
usa = json.loads((ROOT / 'research/transcriptions/usaaf-factory-acceptances-table74.json').read_text())
month_rows = []
for row in usa['months']:
    month_rows.append({
        'year': row['year'], 'month': row['month'], 'period': f"{row['year']}-{row['month']+1:02d}",
        'all': row['all_aircraft'], 'fighters': row['fighters'],
        'heavy': row['very_heavy_bombers'] + row['heavy_bombers'],
        'medium': row['medium_bombers'] + row['light_bombers'],
        'noncombat': row['reconnaissance'] + row['transports'] + row['trainers'] + row['communications'],
    })

data = {
  'version': '7.4',
  'metadata': {'metric': 'factory-acceptances', 'unit': 'aircraft', 'observation': 'monthly_flow',
    'geography': 'worldwide', 'population': 'United States Army Air Forces factory acceptance program',
    'status': 'recorded', 'sourceId': 'aafsd74', 'theater': None,
    'notComparableTo': ['operational fighters ETO', 'Soviet VVS front-line strength', 'German fighter readiness'],
    'caution': 'Worldwide USAAF factory acceptances (including financed Canadian/experimental aircraft); not front-line deliveries.'},
  'usaFactory': month_rows,
  'sovietEarly': [
    {'period': '1941-06', 'day': 22, 'fighters': 4226, 'all': 7133,
      'scope': 'five Soviet western border military districts; a district disposition, NOT all VVS front air armies',
      'sourceId': 'rkka41jun', 'status': 'recorded-secondary', 'coverage': 'geographically partial'},
    {'period': '1941-10', 'day': 1, 'fighters': 948, 'all': 1716,
      'scope': 'incomplete set of Soviet front air arms; only fronts enumerated by the archive transcription',
      'sourceId': 'rkka41oct', 'status': 'recorded-secondary', 'coverage': 'incomplete-front enumeration'},
    {'period': '1941-12', 'day': 5, 'fighters': 1010, 'all': 1829,
      'unserviceableFighters': 347,
      'scope': 'VVS fronts and high-command reserve, excluding Soviet PVO/Naval forces',
      'sourceId': 'rkka41dec', 'status': 'recorded-secondary', 'coverage': 'front-plus-reserve'},
    {'period': '1942-05', 'day': 1, 'fighters': 1757, 'all': 4038,
      'unserviceableFighters': 645, 'trainedFighterCrews': 1270,
      'scope': 'VVS fronts and supreme high-command reserve; reserve as of 20 April, reconnaissance detachment as of 4 May',
      'sourceId': 'rkka42may', 'status': 'recorded-secondary', 'coverage': 'front-plus-reserve'},
    {'period': '1942-07', 'day': 1, 'fighters': 1526, 'all': 4044,
      'unserviceableFighters': 418,
      'scope': 'VVS fronts and high-command reserve, excluding Soviet PVO/Naval forces',
      'sourceId': 'rkka42jul', 'status': 'recorded-secondary', 'coverage': 'front-plus-reserve'},
  ],
  'sources': {
    'aafsd74': {'short': 'USAAF Digest · Table 74', 'title': 'Army Air Forces Statistical Digest: World War II — Table 74, Factory Acceptances',
      'type': 'Primary report / checked HTML transcription',
      'url': 'https://www.ibiblio.org/hyperwar/AAF/StatDigest/aafsd-3.html',
      'note': 'Jan 1940–Aug 1945, worldwide monthly fighter and aircraft factory acceptances. Annual sums checked against printed annual controls; three malformed/inconsistent HTML cells documented in research/transcriptions.'},
    'rkka41jun': {'short': 'RKKA · 22 Jun 1941', 'title': 'Soviet VVS Fighter and Combat Aircraft Dispositions, Five Border Districts, 22 June 1941',
      'type': 'Source-based archival transcription · uneven district report dates',
      'url': 'https://www.rkka.es/Estadisticas/VVS_stat/02/02_02.htm',
      'note': '4,226 fighters / 7,133 combat aircraft in specified border districts. Part of the district figures refer to 1 June; not USSR-wide strength or equivalent to later VVS front-plus-reserve returns.'},
    'rkka41oct': {'short': 'RKKA · 1 Oct 1941', 'title': 'Soviet VVS Front Aviation Returns — 1 October 1941',
      'type': 'Source-based transcription · limited coverage',
      'url': 'https://www.rkka.es/Estadisticas/VVS_stat/02/02_03.htm',
      'note': '948 fighters, 1,716 all combat types in listed front formations. Coverage incomplete, no cross-date inventory denominator established.'},
    'rkka41dec': {'short': 'RKKA · 5 Dec 1941', 'title': 'Soviet VVS Front and Reserve Combat Aircraft — 5 December 1941',
      'type': 'Source-based archival transcription',
      'url': 'https://www.rkka.es/Estadisticas/VVS_stat/02/02_04.htm',
      'note': '1,010 fighters, 1,829 all combat aircraft; VVS front air arms plus reserve. Excludes PVO/Naval Aviation.'},
    'rkka42jul': {'short': 'RKKA · 1 Jul 1942', 'title': 'Soviet VVS Front and Reserve Combat Aircraft — 1 July 1942',
      'type': 'Source-based archival transcription',
      'url': 'https://www.rkka.es/Estadisticas/VVS_stat/02/02_06.htm',
      'note': '1,526 fighters, 4,044 all combat aircraft; Soviet MOD f.35 op.107559ss d.9 ll.159–216. Not a monthly series.'}
    , 'rkka42may': {'short': 'RKKA · 1 May 1942', 'title': 'Soviet VVS Front and Supreme Reserve Combat Aircraft and Trained Crews — 1 May 1942',
      'type': 'Source-based wartime archive transcription, personnel and aviation readiness',
      'url': 'https://www.rkka.es/Estadisticas/VVS_stat/02/02_05.htm',
      'note': '1,757 fighters / 4,038 combat aircraft; 645 fighters unserviceable (denominator) and 1,270 trained fighter crews. Soviet MOD f.35 op.107559ss d.8 t.2 ll.216–271; reserve figures dated 20 April, recce 4 May; rest 1 May.'}
  },
}

content = ('/* European Air War Atlas v7.4 — independently scoped archival series.\n'
           '   Rebuild with: python scripts/build-v74-data.py\n'
           '   Do NOT treat worldwide production as theater operational stock. */\n'
           'window.AirWarV74Data = Object.freeze(' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ');\n')
out = ROOT / 'dist/atlas-v74-data.js'
out.write_text(content, encoding='utf-8')
print(f'Built {out} ({len(month_rows)} USAAF monthly rows; {len(data["sovietEarly"])} early Soviet source observations)')
