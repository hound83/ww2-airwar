# European Air War Atlas · Research ledger (v7.4)

This folder is deliberately broader than the numbers currently displayed. Source
leads, negative search results, incomplete transcriptions, contradictory dates and
potential future categories stay here so later versions need not rediscover them.

## Classification

- **Recorded**: direct dated value in an identified official historical return or
  table, with reporting population, unit, period and location stated.
- **Source-compiled**: a third party's transcription of an official archival return
  that has not been independently checked against every original page.
- **Interpolated**: a value between two truly comparable checkpoints, with the
  interpolation method and both anchors identified. Not a primary observation.
- **Estimated**: source-derived reconstruction using historical events, varying
  exposures, or model assumptions. A quarter's monthly distribution can be
  estimated but those months are not directly observed.
- **Missing**: null; no compatible source value. A genuine archival zero must
  be evidenced, never inferred from missing or a blank transcription cell.
- **Scenario**: hypothetical simulator input, not a historical measurement.

Each usable observation also needs `country`, `force`, `theater`, `geographical_scope`,
`metric`, `measurement_kind` (stock/flow/rate), `unit`, `period`, `status`,
`source_id`, `citation_location`, `population`, and a definition of any exclusions.
`overall` is **not** numerically defined as Western + Eastern Front: Reich defense,
the Mediterranean, Scandinavia, sea and other operational regions may contribute,
and original commands can overlap with geographic theater buckets.

## Transcription assets

`transcriptions/usaaf-factory-acceptances-table74.json` holds 68 months and all
ten table categories, Jan 1940–Aug 1945. This is worldwide USAAF *factory
acceptances*, not ETO frontline inventory or aircraft available for missions.
The importer verifies monthly-to-annual reconciliation and logs three source HTML
discrepancies rather than quietly trusting the digitization. Rebuild with:

```sh
python scripts/import-aafsd74.py /path/to/aafsd-3.html
python scripts/build-v74-data.py
node scripts/build-web.cjs
```

The original HTML is at
https://www.ibiblio.org/hyperwar/AAF/StatDigest/aafsd-3.html (Table 74).

See `sources/lead-inventory.md` for sources not yet numerically integrated,
including Eastern Front aviation, UK RAF original returns, Soviet pilot losses,
front-specific Luftwaffe losses and 1941 German equipment returns. A live chart
must not imply an unverified archive lead is a checked observation.

## Follow-up priorities

1. RAF AHB original translated Luftwaffe losses, 1939–42 and 1945: scan images,
   source pages, caused vs damaged, actual German command geography.
2. Reconcile Soviet front air-army fighter counts by *same* reserve/PVO/naval
   boundary. Validate 19 November 1941/1942 contested source heading before import.
3. German Bf 109 / Fw 190 production, deployment and loss rates by variant and
   month: avoid falsely turning a subtype service window into quantified inventory.
4. Original RAF UK strength and operational flying units by date, distinct from
   Mediterranean and empire-wide fleet.
5. USAAF ETO fighter model operating returns + loss reports for later 1944/1945,
   with report coverage and combat/accident category explicitly reconciled.
6. Document theater boundaries for future nested filters (Mediterranean within a
   broader European grouping, Norway/Scandinavia, Reich, East, North Africa).
7. Historical theater map with dated, source-audited strength counts (candidate
   for v7.5; do not plot geographic assignment guesses as recorded positions).
