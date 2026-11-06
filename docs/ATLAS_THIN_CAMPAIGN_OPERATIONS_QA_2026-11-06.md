# Atlas thin-campaign operational evidence QA, 6 November 2026

## Measurable milestone against the immediately preceding v8.2 branch

| Measure | Before | After |
|---|---:|---:|
| Campaigns mapped | 20 | 20 |
| Operational phases | 55 | 55 |
| Source-scoped numerical facts | 56 | 65 (+9) |
| Fully detailed dated events | 76 | 78 (+2) |
| Norway facts | 1 | 5 |
| Barbarossa facts | 1 | 2 |
| Sicily facts | 1 | 3 |
| Berlin facts | 1 | 3 |

The Norway, Barbarossa and Sicily additions derive from original RAF and US Navy operational reports or official museum/USAF histories. The Berlin daily sortie counts explicitly derive from a published secondary source, not a newly read original Soviet log. **No whole-campaign aircraft-loss totals** have been inferred or fabricated.

## Regression and independent display review

- Build + dependency-free end-to-end suite: `node scripts/build-web.cjs` and `node tests/build.cjs`, including all 20 campaigns, 540 combinations of map/region/search/month visibility, nine zoom settings and the independent German/Allied research filters.
- New invariant assertions: Norway's **49 sorties / 37 encounters / 6 claims / 13 ground losses**, Barbarossa **800 included within 1,200**, US Navy Sicily **440/day** vs **200 enemy flight plots**, Berlin 16th Air Army **4,398** vs **4,054 daily sorties**. Withheld 2,738 figure must remain withheld.
- Browser workflow covers real desktop/mobile source links and two new event drilldowns (25 April Norway; 19 April Berlin) in addition to all previous campaign guides. **CI and final screenshots status must be filled after GitHub push.**

## Scientific limits

The source figures are narrower than full-campaign loss, strength and sortie ledgers. The Berlin sortie table is a published secondary transcription, and the original Soviet returns still need audit. The precise start and end of RAF 263 Squadron's "two days" are approximate; its 49 sorties are explicitly presented as a period total. Navy tracks may reflect repeated flights by one aircraft. Missing operational reports remain missing, never zero.
