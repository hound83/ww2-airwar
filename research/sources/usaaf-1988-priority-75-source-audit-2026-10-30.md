# Grand Air War — USAAF 1988 A/Y/R source audit: 75 priority lines

**Date:** 30 October 2026. **Scope:** historic USAAF continental airfields, 1944–45. **Branch:** `research/grand-air-war-quantitative-2026-10-30`, draft PR #5. Research only; no changes to deployed Atlas/simulator.

## What was actually checked

The previous [first-pass crosswalk](../transcriptions/usaaf-1988-unit-airfield-month-crosschecked-1944-1945.json) generated **75 review-priority source lines** across **44 airfield codes**. These are *not 75 independently authored documents*: they largely come from **one** official 1988 USAF airfield study. Here we rechecked that study's numerical and alphabetical indexes as accessible text; inspected the original OCR tokens and field header parser; and sought separate official unit histories or specialist place records for date disputes.

Original: David C. Johnson, [*U.S. Army Air Forces Continental Airfields (ETO): D-Day to V-E Day*](https://www.dafhistory.af.mil/Portals/16/documents/Timelines/World%20War%20II/usaaf_european_airfields.pdf), USAF Historical Research Center, 1 Dec 1988. **Important dependency:** Johnson explicitly states that his combat-unit dates came from Maurer's USAF unit histories and USAF unit files. Agreement between Johnson's Part I and Part II, or with Maurer, is not fully independent evidence.

**Verification limitation:** the web-extracted text was accessible and manually checked, but the PDF page screenshot service returned cache errors. Hence this is **source-text reconciliation**, not a completed pixel-level verification of every printed row. Corrections remain research-only and original raw OCR files are unchanged.

## Results for the original 75 flagged lines

| Result | Original lines | Meaning |
| --- | ---: | --- |
| Source OCR/header/layout recovered from text | **65** | Initial/release column swap, reading order or malformed month token fixed for the research overlay; **not** independently validated deployment |
| Presence vs official operational/release-date semantics clarified | **5** | External evidence explains why apparent chronology can differ; keep exact historical event and time precision separate |
| Original period extends beyond European war cutoff, not a wartime release contradiction | **2** | Retain source postwar period but prevent after-VE plotting |
| Historical station/field identity requires further original-record verification | **3** | Do not assign early date to an unverified runway; unit history, engineering or station ORB still required |
| **Total** | **75** | No line approved for live historical map pins on this evidence alone |

Further quantitative checks:

- **24 field-code headers** reparsed/qualified, affecting **51 of the 75 lines**; this includes a check for `By` (= upper-bound, not exact first-operation date), nationality handovers, country fields and missing release dates.
- **20 previously unparseable month windows** recovered, including `Sep-Name` → `Sep–Nov` for **A-79 Prosnes** (alphabetic index), `Nor` → `Nov`, `Tun` → `Jun`, and continuation-line **A-55 Melun** `Apr–May 1945`.
- Previously flagged lines accounted for **155** expanded months; after conservative OCR normalization, **217** *research-only source-row-month candidates* (**+62**). Overall crosswalk candidate months would become **826**, if the overlay replaces just the 75 original flagged rows; not 826 proven deployment-months or unique airfield/unit combinations.
- All month windows cut off at 1945-05 for Atlas research; that **does not** establish presence on or before 9 May 1945. Block speculative May maps where exact day is missing.

## Important corrections and historical examples

### Original parsing error, not historical contradiction: A-4 Deux Jumeaux

The first-pass header parser read the country token as the initial-date column and **30 June 1944 as the release date**, falsely flagging its three unit records as post-release. The 1988 numerical and alphabetical index instead both read **initial operations 30 June 1944; released 15 September 1944**. This fixes a data-engineering error; aircraft group strength, historical coordinates and exact mission days are still not proved.

### Arrival date versus official operation date: A-16 and A-35

The official [USAF 36 Operations Group fact sheet](https://www.dafhistory.af.mil/Sandbox/Fact-Sheets/Display/Article/434107/36-operations-group-pacaf/) reports **36th Fighter Group at Brucheville 4 July 1944**, and **Le Mans 25 August 1944**, whereas Johnson's airfield initial-operation dates are **2 August** and **3 September** respectively. A unit station date is not the same event as a field's declared combat readiness. Preserve both values and labels.

At **A-37** the [US War Memorials site](https://www.uswarmemorials.org/html/monument_details.php?MemID=3374&SiteID=2580) cites 405th Fighter Group advance parties during unfinished construction. This is a plausible explanation but is secondary and still merits original engineering records.

At **Y-18 Le Vallon**, the [USAF 417th squadron fact sheet](https://www.dafhistory.af.mil/Sandbox/Fact-Sheets/Display/Article/432152/417-test-and-evaluations-squadron-acc/) places it at La Vallon from 12 September 1944 to 5 April 1945. Johnson's airfield release to French control on 19 December 1944 is not proof that all aircraft left the geographical airfield at that time. Do not silently replace either source value.

At **R-96 Erlangen**, the original header says **'By 14 Aug 1945'**, not 'first in service exactly 14 Aug'. The [official 14 Liaison Squadron fact sheet](https://www.dafhistory.af.mil/Sandbox/Fact-Sheets/Display/Article/433544/14-weapons-squadron-acc/) dates the squadron's Erlangen station to **22 April 1945**. Treat the field date as an *upper bound* rather than manufacture a contradiction.

### Three original-field association questions still open

1. **A-44 Peray, 365th Fighter Group:** Johnson lists August 1944 reconnaissance detachment at the site; operational date is 2 September. [Detailed French field history](https://www.anciens-aerodromes.com/?p=140666) likewise reports a detachment in August, before the formal field opening. Plausible advance-party explanation; the remaining question is **which physical landing strip** it used and on which day. Requires engineer or group diary.
2. **Y-44 Beek/Maastricht, 125th Liaison Squadron:** Johnson's Oct 1944–Mar 1945 association is **not evidence that Y-44 operated in 1944**. Netherlands Ministry of Defence [NIMH history](https://www.nimh.nl/militaire-geschiedenis-van-nederland/historische-overzichten/vliegvelden-in-oorlogstijd/beek) dates its construction to early 1945 and operations from **28 March 1945**; [local historical study](https://www.dodenherdenking-beek.nl/documents/PDF/BeekseHistorie/Vliegveld%20Beek%20in%20oorlogstijd%20Y-44.pdf) reports 125th Squadron aircraft in the wider Maastricht region before the runway existed. Historical **regional presence must not be plotted at Y-44** in late 1944.
3. **Y-47 Namur, 112th Liaison Squadron:** US Government-published [*Combat Squadrons of the Air Force—World War II*](https://www.govinfo.gov/content/pkg/GOVPUB-D301-PURL-gpo126017/pdf/GOVPUB-D301-PURL-gpo126017.pdf) describes a flight operating from **Namur 26 October 1944–circa 11 February 1945**, despite Johnson's Y-47 first operational date **22 February 1945**. [Specialist historical airfield history](https://gateway.forgottenairfields.com/airfield-namur-suarleee-238.html) distinguishes the earlier grass liaison landing area from the later hardened strip. Determine exact **early landing location** and whether '22 February' describes a declared PSP field rather than the original liaison grass strip; do not invent a correction to Johnson's date.

## Research assets

- [Complete 75-row audit ledger](../transcriptions/usaaf-1988-priority-75-source-text-review-1944-1945.json) (per-row provenance, source tokens, recovered date columns, external references and map-blocking flags).
- [Deterministic review builder](../../scripts/review-usaaf-1988-priority-75.cjs).
- [Integrity tests](../../tests/usaaf-1988-priority-75-review.cjs).

Run:

```sh
node scripts/review-usaaf-1988-priority-75.cjs
node tests/usaaf-1988-priority-75-review.cjs
node tests/grand-air-war-unit-crosswalk.cjs
```

The base OCR and original crosswalk are intentionally **not overwritten**. The 75-row ledger is an explicit superseding *quality overlay*, so a dashboard import should apply corrections by `sourceRowId` and suppress any `dashboardPermission: RESEARCH_ONLY_NOT_VERIFIED_MAP_PLACEMENT` items. Do not equate a review-completed source with an independently confirmed wartime physical unit placement.

**Next focused archival work:** retrieve 365th FG reconnaissance detachment / A-44 engineer report, 125th Liaison / Y-44 Beek construction and separate temporary Maastricht landing spots, and IX Engineer Command/Y-47 Namur grass vs PSP operational declaration. These are now **three sharply defined primary-source tasks**, not 75 generic open flags.


## Follow-up on the three geographically ambiguous cases (31 October 2026)

Targeted official USAF unit histories, NIMH's Beek field chronology and a Belgian aviation-history article have clarified what the three disagreements actually concern: a scouting detachment at A-44, 125th Liaison Squadron's *regional Maastricht station* prior to Y-44's construction, and a detached 112th Liaison Squadron *flight at Namur* before Y-47 was formally operational. **None of this proves a pre-operational runway pin**. The 1944 Maastricht regional presence MUST NOT be plotted at Beek/Y-44. See [focused review and original sources](usaaf-a44-y44-y47-preoperational-landing-sites-review-2026-10-31.md) and [structured three-case map-safety overlay](../transcriptions/usaaf-1944-1945-three-preoperational-airfield-case-resolutions.json). The original 75-row flags are deliberately preserved for audit history; apply the newer three-case overlay for interpretation.
