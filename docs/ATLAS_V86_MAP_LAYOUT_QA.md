# v8.6 operation map and briefing correction

Reported case: Cobra, 31 July 1944. The owner's screenshot shows Normandy towns over water and snapshot controls cut off inside a tall right-hand panel. This correction belongs to the existing v8.6 experience; it adds no historical data or new release scope.

## Before

- Published baseline: `04823804da649ba2fd78c461806ebc7c9caf0851` (rollback reference).
- The operation briefing has a 640px cap and its own scrollbar. The added Chromium regression fails in all eight initial wide/scaled desktop states because content exceeds that viewport. The clipping is therefore reproduced independently of the screenshot.
- Selecting a snapshot starts a chapter `flyToBounds`, then another operation `flyToBounds`. Land, paths and HTML labels use different Leaflet renderers during those overlapping movements. There is no container resize observer.
- The source coastline contains Coutances, Avranches and Mortain on land. Settled Linux Chromium baseline screenshots also paint these places on land. The owner's persistent coastline failure is not reproduced in those settled baseline frames; do not describe that as a confirmed geographic-data error or a fully reproduced GPU fault.

## Correction

- Select the chapter without fitting its map, stop an existing flight, invalidate the current container size, and fit the snapshot once without animation. Each snapshot has a settled geography immediately.
- Observe the map container's size and invalidate Leaflet dimensions when it changes. Keep physical land in an explicit lower pane rather than relying on path order across separate SVG renderers.
- Let the briefing use normal page flow with independent map/panel heights. All dated controls, navigation, map details, source and return action remain in the document; there is no second scrolling viewport.
- Restore focus after replacing snapshot controls, so repeated keyboard navigation continues to work. Refresh the changed asset URLs to replace cached v8.6 code.

## Acceptance evidence

`tests/grand-air-war-v80-layout-browser.cjs` runs as part of both PR and actual public-site browser verification. It checks 2048x1090 desktop, 1280x681 at 1.6 device scale, and 160% CSS magnification. Each profile covers the exact 31 July permalink, rapid interrupted selection, resizing, and pan/zoom. PNG pixels at projected town coordinates must actually be land; the existence of SVG paths alone is insufficient. Partial JSON reports and screenshots are retained even when an assertion fails.

The layout checks also require every snapshot control to be reachable, no internal briefing clipping, repeated keyboard navigation and return to the campaign overview. The existing 1440px desktop/390px touch suite then exercises all five operations and 16 snapshots, source drill-down, evidence export, permalink reload, filter recovery, campaign chapters, independent research and legacy routes.

Build gate: `node scripts/build-web.cjs` and `node tests/build.cjs`. Release gate: exact-head core and browser checks, screenshot inspection, then the matching Pages assets and public browser workflow. PR #26 carries the final run results. Historical counts, reporting scopes, source links and the pinned physics snapshot are unchanged.
