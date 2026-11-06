# Narvik daily air operations: primary reporting audit (6 November 2026)

## What was actually located

1. **RAF Air Historical Branch, *The Campaign in Norway, April–June 1940*.** Original official wartime campaign narrative, [digitized by the RAF](https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/second-world-war-campaign-narratives/campaign-in-norway-april-june-1940/). Printed **Table 2, pp. 95–96**, is a Narvik-area **daily fighter-operations** table containing RAF sorties, air combats, *own* losses, and descriptions of enemy air activity and anti-aircraft dispositions. The preceding **Table 1, pp. 92–94**, describes enemy raids before RAF fighters arrived, but has **no equivalent daily Allied sortie, combat and loss columns**. Printed **p. 98** discusses original squadron Operations Record Books and reports **329 flights / 69 combats / 26 enemy aircraft claimed** for No. 263 Squadron and **249 flights / 26 combats / 11 claimed** for No. 46 Squadron. The RAF site's low-quality PDF OCR renders 329 as **309**, but the independently indexed plain-text version of the same original RAF report resolves the ambiguous digit as **329**. This official synthesis is **not** itself a squadron's original Form 541 sortie sheet.
2. **No. 263 Squadron RAF, *Operations Record Book*, Form 540, TNA AIR 27/1547**, pages **59–73** of [Jeff Beaumont's 2009 transcription](https://263squadron.weebly.com/uploads/9/2/1/7/92171046/air271547.pdf); [transcription publisher and separate Form 540/541 links](https://263squadron.weebly.com/orb.html). These are original-unit-record *contents*, published through a modern third-party transcription, **not original photographed pages independently checked by us**. The 1940 narrative says its May campaign précis was largely extracted from Wing Commander Atcherley's report. Specialist [source notes for 24 May](https://martinaviationpages.com/24-may-1940/) identify this May Form 540 as **reconstructed after the campaign** and say **Form 541 is absent** for May 1940. It would be incorrect to call this a surviving full original sortie-by-sortie daily log.
3. **National Archives RAF [squadron ORB research guide](https://www.nationalarchives.gov.uk/help-with-your-research/research-guides/royal-air-force-squadron/)**: AIR 27 holds Form 540 summaries and Form 541 detailed work records. Official untranscribed images may require archival access/payment. **No. 46 Squadron's exact reference is AIR 27/460**, independently listed as the basis of a [secondary unit movement chronology](https://www.rafweb.org/Members%20Pages/Unit%20Details/Squadrons/001-050/No%20046%20Sqn.htm). The secondary chronology supports its arrival from HMS *Glorious* on 26 May, but **does not supply daily flight numbers** and even dates the carrier's loss 9 June rather than 8 June; it is a research locator, **not** an auditable substitute for Form 540/541. Further original-record requests: **AIR 27/1547, AIR 27/1550–1551 appendices, AIR 27/460 original No. 46 Squadron images, Fighter Command AIR 24/25 and AIR 50 combat reports**.

## The 18 dated observations and the 16-row AHB table

The Atlas now links **18 dates** (21 May–7 June) to No. 263 Squadron's diary contents; **16** of those dates also occur in AHB Table 2. AHB does **not** provide a row for **21 May** or **1 June**. Those are source coverage gaps, not zero sorties. Of its 16 rows, **13** explicitly give all of sorties, combats and own losses; **4, 5 and 6 June** have *blank* combat/loss fields. AHB explicitly prints **Nil** in relevant combat/loss cells on 28 May, 31 May and 3 June: those are genuine reported **zeroes**. Its **7 June** sorties entry is *about 50*, not exact.

Illustrative cross-source comparisons (*flight/sortie* categories retained by source):

| Date | AHB area sorties | 263 Squadron Form 540 sorties | Finding |
|---|---:|---:|---|
| 21 May | unreported | about 40 | Squadron commenced patrols; date not in AHB Table 2 |
| 22 May | 54 | 54 | Matching counts; Form 540 details Craig-Adams loss and battle report |
| 23 May | 40 | about 40 | Form 540 describes Whall's oil-pressure-related aircraft loss |
| 25 May | **36** | **more than 40** | **Direct source discrepancy**, not rounded away |
| 26 May | **50** | **more than 50** | **Direct source discrepancy**, not rounded away |
| 1 June | unreported | no precise count | AHB lacks this date; Form 540 describes repairs/bad weather |
| 2 June | 75 | 55 | Coexisting area and specific-unit populations; includes dated Wilkie loss |
| 3 June | 6 | **zero** | No. 263 grounded, but other RAF squadron flew; area loss and combat *Nil* |
| 4–5 June | 11 / 9 | **zero / zero** | No. 263 grounded while No. 46 flew; AHB combat/loss cells **blank** |
| 6 June | 16 | unquantified | No. 263 describes operations collectively over 6–7 June |
| 7 June | **about 50** | unquantified | AHB approximation; unit record grouped with 6 June |

AHB Table 2 adds to **594 exactly specified sorties** on 15 entries plus **approximately 50** on 7 June. Its printed p. 98 ORB-derived squadron sums are **329 + 249 = 578 flights**. The 16-day Table 2 scope, the two squadrons' 12 operating days and the precise definitions are **not reconciled**. The Atlas deliberately displays the population discrepancy and does not graph a synthetic 644-versus-578 trend or treat 263's single-unit losses as identical to AHB's area *own losses*.

The original author explicitly warns that the squadrons' combined **37 claimed German aircraft** are not verified enemy losses (26 + 11 claims); this research does **not** enter them into the German destroyed-aircraft series. The Form 540 and AHB may both reflect overlapping British operational accounts; they are **not fully independent verification**, especially after the former's reconstruction.

## Why it matters, and further archival work

The 16-day AHB table is a proper day-level population for **operations, combats and RAF losses**, unlike annual force inventories, retrospective claims or monthly USAAF theater totals. Form 540 can explain specific events (engine failures, battle damage, pilot casualties, weather) without using one squadron's incident as proof of the area-wide loss count. Both are linked directly on the selected date in the Atlas.

**Unresolved:** (1) original image check of AIR 27/1547 transcription and missing 1940 Form 541; (2) **AIR 27/460** original 46 Squadron daily Form 540/541 for this period; (3) 329/249 versus Table 2 sortie-sum discrepancy; (4) independent Luftwaffe daily unit-loss records at matching Narvik dates; (5) full German-raid/AA observations across earlier Table 1. These are research gaps, not fabricated zeroes.

## Implementation reproducibility

Source-bound data are in `dist/grand-air-war-v77-campaigns.js` under `norway.dailyOperations`, linked by `rafNorwayAHB` and `raf263ORB540transcript`. The v8 campaign guide's dated table and drill-down are in `dist/grand-air-war-v80-core.js`, with responsive styles in `dist/grand-air-war-v80.css` and the semantic panel in `grand-air-war-v80.html`. No historical value was allocated to an individual day from a multiple-day period total.
