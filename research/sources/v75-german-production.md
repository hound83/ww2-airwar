# German aircraft production extension — v7.5 integration

**Data:** 1943–1944 complete months and 1945 January–March (April **unknown**). Separate `actual` from `planned`, `null` from genuine zero. Stored in `dist/atlas-v75-german-production.js`.

## Source chain

- Scholarly: Horst Boog, Gerhard Krebs, Detlef Vogel, *Germany and the Second World War*, vol. VII, The Strategic Air War in Europe, Oxford University Press / Clarendon (2006), **Table I.I.10 on p.118**. [Publication record](https://books.google.com/books?id=rmgTAQAAMAAJ).
- Book table cites original USSBS Report No. 2a, *Statistical Appendix to Overall Report*, 95 ff., NARA RG 243, and Aircraft Division Industry Report No. 4, Fig. VI-10, plus Groehler.
- USSBS official Summary Report describes Germany **39,807 aircraft of all types accepted in 1944**, a separately checked numerical annual control: [contemporary summary transcription](https://www.anesi.com/ussbs02.htm?level=1).
- Data transcribed from an accessible textual rendering of the scholarly table. **The source page of the book and underlying original scans have NOT yet been visually verified**; `provenance=secondary`, `verification=published_ocr_checked_against_annual_controls; source scan not page-compared`. Period tables must not be represented as original primary fact.

## Reconciliation

- **1943 total: 25,527** (all 12 actual monthly values). Matches reported German annual total in independent secondary compilations.
- **1944 total: 39,807** (all 12 actual monthly values). Exactly matches USSBS total; planned numbers are a **separate** series and are never added to production.
- **1945 total Jan–March: 7,367**. April source reports n/a and cannot be plotted as 0 or interpolated.
- This is **German all-type national production**; not German day fighters, Bf 109s, Fw 190s, available aircraft or assigned theater strength. Show in separate chart from worldwide USAAF acceptance.

## Type-level evidence and open conflict

RAF Air Historical Branch [RAF in the bombing offensive vol. V](https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/second-world-war-campaign-narratives/raf-in-the-bombing-offensive-against-germany-vol-v-the-full-offensive-february-1943-to-february-1944/) cites Wagenführ for Bf 109 factory acceptance July 1943 **725**, December **357**; Fw 190 December **203**. A value **325** for July Fw 190 in that RAF text differs from a USAAF report excerpt giving **525**; the discrepancy may reflect a transcription error or reporting scope. We preserve both and **do not chart either as a validated July figure** without an original-source audit.

## Next audit work

Locate scans of USSBS 2a table 95ff and aircraft production Fig VI–10; reconcile primary categories and definition of `output` versus accepted. Seek German monthly *Jäger* new-build acceptance by Bf109/Fw190 and then by G/K/A/D variant. Cross-check repairs versus new aircraft and later unit assignment. Separately investigate RAF and Soviet monthly factory production and frontline deliveries.
