# Atlas v8.6: Normandy operational release

Status: released in PR #24 and live verified on 11 November 2026. Released source: 3dc7587a5e5d0967627b6846ccb6e67eec0de220. Previous deployable source: 13a9529394e7091940cd9e6ce525b5c5f365bea0.

## Reader outcome

Select D-Day, Goodwood, Cobra, Mortain or Falaise; step through 16 dated operational snapshots; inspect localities, schematic ground directions and dated forward fields; read the connected intention, air activity, German response and consequence; inspect 24 source-linked quantities, formation profiles and reusable JSON exports. Operation/snapshot links survive reload. Independent campaign/chapter/month navigation releases the selected operation so its map cannot leak into another campaign.

## Before / after

| Capability | Before | v8.6 candidate |
|---|---|---|
| Normandy operation journeys | Chapter/event reading only | Five dedicated operation journeys |
| Dated operational geography | Approximate episode pins | 16 snapshots with named places and documented schematic directions |
| New operation-specific quantities | 0 | 24; original 135 overview observations preserved |
| Formation/context profiles in an operation | Narrative mentions | 14 reusable profiles linked to applicable studies |
| Field readiness history in the main campaign | Separate field notebook | Four dated basing examples with first-use/arrival/completion distinctions |
| Direct operation/snapshot URLs | None | #operation=cobra&step=1, validated restore |

## Verification

- PASS local build and dependency-free v7.6/v7.7/v8/v8.6 data/controller suites. Existing 540-way campaign controller matrix retained.
- v8.6 exercises all 16 snapshots, all 24 records, future-base exclusion, unit/period/qualifier semantics, snapshot previous/next, other-campaign recovery, independent chapter/month navigation and generated-data consistency.
- Extended Chromium desktop 1440x900/mobile 390x844 workflow includes all five operations and all 16 snapshots, source links, map markers, keyboard step, JSON export, operation permalink reload and no page overflow. PASS final PR browser run 42934745173 and core run 42934745199 on e30af1362c721f57e11123e62122a4a11f913f2f.
- Local Windows browser automation was stopped by its policy helper because it could not confidently determine the current browser URL. No successful local screenshot or browser-interaction result is claimed. Use CI screenshots and completed browser checks before merge.

## Release / rollback

The default explorer route is explicitly in the v8.6 scope. Legacy pilot/aircraft routes and the pinned physics research snapshot are preserved. Merge only on the exact verified revision, with source checks and inspected desktop/mobile screenshots. After publication verify the live default and operation URL. Restore the previous deployable revision through a normal revert if a serious regression is found; no force-push.

## First browser review and correction

PR browser run 42933092547 and core run 42933092668 passed on f74acc1. Downloaded CI screenshots were inspected at desktop and mobile widths. This exposed ground-direction paths hidden beneath the separately rendered land SVG despite passing the initial interaction checks. Corrected with a dedicated higher SVG pane, added pane-order assertions, improved offset-label leaders and map-edge labels, and suppressed clipped field markers. Rerun the corrected exact revision before merge.

The live publication workflow waits for the explorer plus four operation assets to match the checked-out source, then runs the actual desktop/mobile browser journeys against GitHub Pages, including default redirect and legacy access. Live results must still be inspected after merge.

## Completed publication evidence

- [Implementation PR #24](https://github.com/hound83/ww2-airwar/pull/24), merged to 3dc7587a5e5d0967627b6846ccb6e67eec0de220.
- [Final PR Chromium](https://github.com/hound83/ww2-airwar/actions/runs/42934745173) and [core checks](https://github.com/hound83/ww2-airwar/actions/runs/42934745199): PASS. Includes the higher operation SVG pane, corrected southward Cobra axis, closer local framing, touch input and settled screenshot capture.
- [Pages deployment](https://github.com/hound83/ww2-airwar/actions/runs/42934978661): success for the released source.
- [Actual live-site Chromium](https://github.com/hound83/ww2-airwar/actions/runs/42934979368): PASS against https://hound83.github.io/ww2-airwar/grand-air-war-v80.html . The explorer and four operation assets were independently fetched and matched the reviewed source bytes.
- Downloaded and inspected before/after CI screenshots and live desktop/mobile screenshots. A local screenshot initially caught an in-flight map pan; the test now waits for the JS map animation before capture. The final live screenshots show the settled operation map.
- All five operations and 16 snapshots, planned/actual direction rendering, map-place source detail, mobile touch, keyboard stepping, source links, exports, permalink reload, campaign return, no page overflow/errors, default redirect and opt-in legacy access were verified.
- Research and all 24 observation definitions are committed in the compact JSON transcription and source ledger. Detailed military fronts, individual aircraft tracks and a complete daily bilateral loss ledger are not asserted.

The following documentation reconciliation does not alter deployed application assets.
