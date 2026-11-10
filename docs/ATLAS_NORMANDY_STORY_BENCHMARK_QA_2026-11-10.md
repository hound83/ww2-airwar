# Normandy storytelling benchmark: scope and QA (10 November 2026)

## User-facing release goal

Transform the Normandy campaign from an isolated 3-month outline into a coherent 6 June–31 August 1944 non-fiction history connecting Allied air superiority, forward airfields, the ground stalemate, bomber limitations, Cobra, Mortain, Falaise and pursuit. Explain German intentions and limits throughout. Show the research and its gaps honestly.

## Measured before / after

| Measure | `main` before work | This candidate |
|---|---:|---:|
| Historical campaigns | 20 | 20 |
| Normandy chapters | 3 | **9** |
| Normandy research episodes | 3 | **39** (31 dated actions + 8 explicit period anchors) |
| Atlas chapters overall | 55 | **61** |
| Atlas chronology entries overall | 83 | **119** |
| Source-scoped historical numeric facts | 135 | **135**; intentionally unchanged |
| Independent quantitative bilateral dates | 4 paired same-day own-loss examples overall | **Unchanged**; no invented new loss returns |
| Full-fledged campaign introduction | None | Non-fiction central question and 3 substantial introductory paragraphs |
| Chapter analysis | 3 short month cards | 9 cause-and-effect accounts with Allied air role, German perspective, transition and evidence boundary |
| Location map | Only campaign centre | Selected chapter's approximate episode locations at local zoom, with collision grouping |
| Research continuity | Separate older Normandy field notebook | Linked from introduction, prior field findings used where appropriate |

## Risks guarded against

- Descriptions of military outcomes are official *historical synthesis*. They do not imply the original daily unit log for every described operation was transcribed.
- Eight representative-date period context entries are labelled explicitly, in data and on-screen. They are not falsely described as individual single-day sortie reports.
- German Luftflotte 3 reporting windows, Allied D-Day figures, aircraft strength and total serviceability retain their own populations. No numerical ratio is constructed from incomparable periods.
- ROMMEL car attack: pilot/squadron attribution intentionally not chosen because claims differ.
- COBRA: friendly-fire tragedy, timing and ground exploitation remain visible; air bombardment is not described as sufficient on its own.
- MORTAIN: no unsupported Typhoon tank-destruction number.
- FALAISE: German troop escape and non-air causes of vehicle losses explicitly mentioned; vehicle wrecks are not air-to-air aircraft losses.
- Official U.S. Army 'Normandy' campaign-credit period ends 24 July; this Atlas narrative covers Overlord's full June–August operational story, including the sequel, and does not relabel official medal dates.

## Automated checks

- `node scripts/build-web.cjs`: generated root and asset hashes rebuilt.
- `node tests/build.cjs`: seven suites including v8 audit and 540-way controller filter/zoom matrix (locally passed).
- `node tests/grand-air-war-v80-audit.cjs`: asserts 9 chapters, 39 episodes, eight period anchors, multi-source two-sided narrative, non-overlapping chapter dates, link validity and unchanged original quantities (locally passed).
- `node tests/grand-air-war-v80-interactions.cjs`: source panels, search, chapters, all 119 event bilateral source-status views and research modules (locally passed).
- `node tests/grand-air-war-v80-browser.cjs`: desktop 1440×900 and mobile 390×844, all campaign controls, interactive map and its local Normandy event markers, story introduction, nine chapters, sources and screenshots. **GitHub Actions must supply the actual Chromium evidence before merge.** Local sandbox has a Chromium binary but blocks process-singleton Unix sockets, so this is not yet reported as a passing local browser run.

## Release decision and rollback

Historical source notes: `research/sources/normandy-1944-story-benchmark-2026-11-10.md`. Source of truth for data: `dist/normandy-1944-story.js`, loaded after the original campaign source and before the v8 controller. Original v7.7 research route, legacy physics and its separately pinned simulator remain unchanged.

**Before merge:** inspect exact PR commit, source/dates, CI green, desktop/mobile browser screenshots, navigation, map/episode selection, console errors and root routing. On a browser or historicity failure, leave PR open, fix and rerun. **After merge:** verify the actual GitHub Pages default path and chapter/event navigation, including the opt-in legacy routes; restore the prior deployable commit via a new reviewable revert PR if necessary, not a forced history rewrite.
