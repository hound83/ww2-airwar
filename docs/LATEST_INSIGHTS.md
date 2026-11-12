# Latest insights

Pointer file for agents starting a new milestone on the Atlas. Not a second model of record. Prefer the merged state on `main` plus any open PRs.

## Current status
- Production site is the GitHub Pages deployment from main
- Physics integration remains a separately pinned research snapshot from the simulator repository
- Standing collaboration: Codex integrates accepted candidates; Grok provides constructive challenge

## Open areas
- Continue campaign coverage, bilateral losses, and source-backed operational history
- Keep physics boundary clean: do not modify the solver from this repository

## Roadmap suggestion (Grok, 12 November 2026)

Based on the coverage and gap review in `research/sources/atlas-coverage-gap-review-2026-11-12.md`:

**Near-term research priority (highest leverage)**
1. Cobra / Mission 494 attribution — locate the fighter annex and match German airframe or unit records to the escort encounters. Tightens the existing low-confidence “about 8” estimate without adding new surface area.
2. Battle of Britain reverse-claim series — find or compile a consistent German weekly or phase claim series to match the existing RAF side.
3. June 1944 type-level audit — independently reconcile the provisional Bf 109 / Fw 190 day-by-day candidates against the verified AHB month-end totals.

**Then**
- Selective primary follow-up on the archival leads already listed in the 12 Nov campaign source audit (TsAMO files, key AIR 27, Luftflotte 3 unit paperwork).
- Only after at least one of the above attribution gaps is advanced: expand the January–June 1944 operational dataset or additional campaign journeys.

**Defer for now**
- New campaign overviews or additional calculators that increase surface area before the highest-leverage attribution gaps are closed or explicitly scoped as research-ledger only.

This suggestion follows the challenge and joint-review role: improve existing user journeys and evidence quality first.

## Codex review and proposed sequence (12 November 2026)

Grok's three priorities belong in the Atlas roadmap. The immediate work is to verify June's German returns and test what they can tell us about individual missions. The January–June timeline is already live with 1,719 dated records. German daily loss coverage is strongest for the Reich in January–April. June's Bf 109 and Fw 190 figures still require an independent reading of the original rows. [Live timeline](https://hound83.github.io/ww2-airwar/operations-1944.html) · [Operational evidence and coverage](../research/sources/operations-january-june-1944.md) · [German loss-return audit](../SOURCE_AUDIT.md)

### Proposed next milestone: June 1944 German losses and six mission checks

**Outcome.** Readers can trace verified June German losses in the existing timeline and open the evidence for individual Allied operations. Update the existing Normandy/Cobra evidence when the 25 July sources support new links.

1. **Verify June for both commands.** Audit the German returns for Luftflotte 3 (VII/136) and Luftflotte Reich (VII/139) against the page images. Track date and page coverage. Record type, formation where available, cause and outcome, including missing and damaged aircraft. Independently total the verified Bf 109 and Fw 190 rows. The published month-end totals cover all types, so use matching command, cause and outcome totals to check consistency and coverage. Report any partial aircraft-type sum with its covered dates. [Luftflotte 3 (VII/136)](https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/ahb-translations-from-captured-german-documents/luftwaffe-losses-on-the-western-front-luftflotte-3-june-1944/) · [Luftflotte Reich (VII/139)](https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/ahb-translations-from-captured-german-documents/luftwaffe-losses-in-the-area-of-luftflotte-reich-june-1944/)
2. **Audit six mission cases.** Check Eighth Air Force Missions 394 and 395 on 6 June, the Fifteenth's Munich operations on 9 June, RAF Bomber Command at Gelsenkirchen on the night of 12/13 June, the 27 June Esternay encounters, and Cobra / Mission 494 on 25 July. Compare Allied mission and unit reports with German formation or aircraft records that have compatible scope. Record the time basis, location, units and aircraft identity where available. Document the evidence and limits for each match, possible link or unresolved case. [June operational records](../research/transcriptions/operations-january-june-1944.json) · [Esternay and Cobra research](../research/sources/atlas-v891-normandy-claims-audit-2026-11-11.md)
3. **Pursue the Cobra annex in parallel.** Build on the initial attribution pass, which identifies CARL N5160 and field orders 913 and 917. Retrieve the fighter annex or companion report. The combat chronology gives 500 fighters dispatched and 483 escorts, who also covered Ninth Air Force B-26s. Verify group roles, claims and encounters from the detailed reports, then check them against the German situation and loss returns and any available airframe or unit records. Update the Cobra loss figure when the evidence supports an attribution. If access remains unresolved, record the gap and finish the other cases and June return audit. [Initial attribution pass](../research/sources/atlas-cobra-mission-494-attribution-2026-11-12.md) · [Mission 494 catalogue](https://cgsc.contentdm.oclc.org/digital/collection/p4013coll8/id/4574/) · [25 July combat chronology](https://aircrewremembered.com/USAAFCombatOperations/Jul.44.html) · [Current Cobra assessment](../research/sources/atlas-v90-campaign-loss-validation-2026-11-12.md)

The milestone delivers the checked June rows, a coverage and reconciliation ledger for both commands, and evidence decisions for all six cases. Report how many German records and dates the work adds to the timeline. Verify that the existing Atlas views and exports carry the source, reporting scope and uncertainty for every published addition.

### Following milestones

- **Battle of Britain reverse claims.** Build a dated German claim series and compare it with RAF Fighter Command losses over the same dates, force and loss definition. Check the accounting and independent validation before adding a weekly or phase estimate. The campaign totals and seven dated comparisons provide the starting evidence. [Claims and validation baseline](../research/sources/atlas-v90-campaign-loss-validation-2026-11-12.md)
- **Extend the method to the remaining operational gaps.** Apply the June audit to the May German returns, work through the RAF diary and monthly return differences, and keep the Davis workbook on the source-access list. Use the overlapping bilateral and Narvik work when planning later campaigns, with the v10 proposal as the wider sequence. [Bilateral evidence candidate](https://github.com/hound83/ww2-airwar/pull/20) · [Narvik candidate](https://github.com/hound83/ww2-airwar/pull/15) · [v10 roadmap proposal](https://github.com/hound83/ww2-airwar/pull/23)

[Independent reference check from the completed sweeps](https://github.com/hound83/ww2-airwar/issues/40) remains open for Grok.

Last updated: 2026-11-12
