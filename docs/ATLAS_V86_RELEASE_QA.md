# Atlas v8.6: Normandy operational release

Status: implementation candidate, not yet published. Previous deployable source: 13a9529394e7091940cd9e6ce525b5c5f365bea0.

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
- Extended Chromium desktop 1440x900/mobile 390x844 workflow includes all five operations and all 16 snapshots, source links, map markers, keyboard step, JSON export, operation permalink reload and no page overflow. Actual CI result pending.
- Local Windows browser automation was stopped by its policy helper because it could not confidently determine the current browser URL. No successful local screenshot or browser-interaction result is claimed. Use CI screenshots and completed browser checks before merge.

## Release / rollback

The default explorer route is explicitly in the v8.6 scope. Legacy pilot/aircraft routes and the pinned physics research snapshot are preserved. Merge only on the exact verified revision, with source checks and inspected desktop/mobile screenshots. After publication verify the live default and operation URL. Restore the previous deployable revision through a normal revert if a serious regression is found; no force-push.
