#!/usr/bin/env python3
"""Inspection aid for RAF AHB June 1944 loss scans (not an authoritative OCR importer).

Lists daily aircraft-type cells from the last three mutually exclusive loss
groups. Manual review against each scanned page is REQUIRED before publication.
"""
import argparse
import json
import re
from statistics import median
import pdfplumber


def grouped_rows(page):
    rows = []
    for word in sorted(page.extract_words(x_tolerance=3, y_tolerance=3), key=lambda w: (w['top'], w['x0'])):
        row = next((r for r in rows if abs(r[0] - word['top']) < 5.0), None)
        if row is None:
            row = [word['top'], []]
            rows.append(row)
        row[1].append(word)
    return sorted(rows, key=lambda r: r[0])


def parse(pdf_path):
    events = []
    for page_number, page in enumerate(pdfplumber.open(pdf_path).pages[1:], 2):
        all_words = page.extract_words(x_tolerance=3, y_tolerance=3)
        headers = sorted((w for w in all_words if 90 < w['top'] < 170 and w['x0'] > 595 and
                          re.match(r'(?:Dest|Best|Deat|Dam|Darn|Bam|Des)', w['text'], re.I)), key=lambda w: w['x0'])
        if len(headers) < 6:
            print(f'WARNING page {page_number}: only {len(headers)} numeric column headers')
            continue
        anchors = [w['x0'] + 12 for w in headers[-6:]]
        shifts = []
        for label in all_words:
            if label['x0'] > 95 or label['top'] < 160 or not re.match(r'(?:TOT|TCT|T0T|TOI)',label['text'],re.I):
                continue
            totals = [w for w in all_words if w['text'].isdigit() and
                      any(abs(w['x0']-a) < 18 for a in anchors) and
                      abs(w['top']-label['top']) < 13]
            if len(totals) >= 2:
                shifts.append(label['top']-median(w['top'] for w in totals))
        shift = median(shifts) if shifts else 0
        type_rows = []
        for y, words in grouped_rows(page):
            words = sorted(words, key=lambda w: w['x0'])
            if not 145 <= y <= 535:
                continue
            left = [w for w in words if w['x0'] < 130]
            left_label = ' '.join(w['text'] for w in left)
            typetext = ''.join(w['text'] for w in words if 98 <= w['x0'] <= 192)
            match = re.search(r'(?<!\d)(109|190)', typetext.replace('O','0').replace('l','1'))
            if not match:
                continue
            type_words = [w for w in words if 98 <= w['x0'] <= 192 and re.search(r'109|190|1O9|19O',w['text'].replace('l','1'))]
            label_y = min((w['top'] for w in type_words), default=y)
            type_rows.append(dict(page=page_number, y=round(label_y,1), type='Bf 109' if match.group(1)=='109' else 'Fw 190',
                                  role=left_label, raw=typetext))
        for e in type_rows:
            # Bounding boxes reflect the source table's three non-overlapping
            # subtotals: all enemy action, other operational, non-operational.
            bins = ['enemy_destroyed','enemy_damaged','operational_destroyed',
                    'operational_damaged','nonoperational_destroyed','nonoperational_damaged']
            nums = {}
            anomalies = []
            for name, anchor in zip(bins, anchors):
                cell = [w['text'] for w in all_words if abs(w['x0']-anchor) <= 17 and
                        abs(w['top']+shift-e['y']) <= 8 and
                        min(type_rows, key=lambda r: abs(r['y']-(w['top']+shift))) is e]
                if not cell:
                    nums[name] = 0
                elif len(cell) == 1 and re.fullmatch(r'[0-9]+[.,]?',cell[0]):
                    nums[name] = int(cell[0].rstrip('.,'))
                else:
                    nums[name] = None
                    anomalies.append(name+':'+repr(cell))
            events.append(dict(**e, anomalies=anomalies, **nums))
    return events


def checked_page_corrections(events, pdf_path):
    """Five suspect OCR glyphs and one inverted text layer checked on scans.

    This does not certify that every other searchable line is a complete
    transcription. The resulting type breakdown remains provisional.
    """
    reich = 'reich_jun' in pdf_path
    corrections = (
        {(7,335.0): {'nonoperational_destroyed': 3},
         (19,167.2): {'nonoperational_damaged': 0}}
        if reich else
        {(8,204.8): {'operational_damaged': 4},
         (20,169.5): {'nonoperational_damaged': 4},
         (20,181.5): {'operational_damaged': 1}}
    )
    for event in events:
        replacements = corrections.get((event['page'],event['y']), {})
        event.update(replacements)
        if replacements:
            event['anomalies'] = []
            event['manually_reviewed'] = True
    # Page 15 (printed page 14) renders upright but its searchable text layer
    # is inverted. Numbers below were independently read from the scan.
    def manual(type_, role, enemy_destroyed=0, enemy_damaged=0,
               operational_destroyed=0, operational_damaged=0,
               nonoperational_destroyed=0, nonoperational_damaged=0):
        return dict(page=15,y=None,type=type_,role=role,raw='manual page 15',
                    anomalies=[],manually_reviewed=True,
                    enemy_destroyed=enemy_destroyed,enemy_damaged=enemy_damaged,
                    operational_destroyed=operational_destroyed,operational_damaged=operational_damaged,
                    nonoperational_destroyed=nonoperational_destroyed,nonoperational_damaged=nonoperational_damaged)
    if reich:
        events.extend([
            manual('Bf 109','Close recce',nonoperational_damaged=1),
            manual('Bf 109','S.E. fighters',nonoperational_damaged=5),
            manual('Fw 190','S.E. fighters',nonoperational_destroyed=1),
            manual('Fw 190','Night fighters',nonoperational_damaged=1),
        ])
    else:
        events.extend([
            manual('Fw 190','Bombers, June 17 continuation',enemy_destroyed=1,operational_damaged=1),
            manual('Bf 109','S.E. fighters, June 18',enemy_destroyed=1,operational_destroyed=1,operational_damaged=2),
            manual('Fw 190','S.E. fighters, June 18',enemy_destroyed=3),
            manual('Fw 190','Bombers, June 18',enemy_destroyed=3,enemy_damaged=1,operational_damaged=1),
        ])
    return events


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('pdf')
    parser.add_argument('--json', action='store_true')
    args = parser.parse_args()
    events = checked_page_corrections(parse(args.pdf),args.pdf)
    if args.json:
        print(json.dumps(events,indent=2))
        raise SystemExit(0)
    for e in events:
        cells = ' '.join(f'{key}={e[key]}' for key in ('enemy_destroyed','enemy_damaged','operational_destroyed','operational_damaged','nonoperational_destroyed','nonoperational_damaged') if e[key])
        print(f"p{e['page']:02} y{e['y']:05.1f} {e['type']:6} ({e['role'][:17]:17}) {cells:<105} {e['anomalies']}")
    print('Rows:',len(events), 'Potential OCR anomalies:',sum(bool(e['anomalies']) for e in events))
