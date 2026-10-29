# Atlas ↔ physics integration contract

Updated 30 October 2026. The repos are independent and should remain so.

## Ownership

**Atlas**: https://github.com/hound83/ww2-airwar

Owns GitHub Pages hosting, user interface, charts, historical archives and transcriptions, campaign/timeline, pilot simulator, historical evidence presentation, navigation, styling and browser QA.

**Physics**: https://github.com/hound83/WW2-Aircraft-Physics-Simulator

Owns the shared flight physics model, aerodynamic and power calculations, engine/propeller coefficients, measured and bounded aircraft inputs, Greg controls, withheld validation and versioned numerical results.

**Existing interface:** Atlas currently embeds `physics/research-model-v2.4.html`. Treat it as a frozen, research-grade **compatibility snapshot**. It is not automatically updated when the separate physics repo changes. A direct iframe or page link is not a reliable future release API.

## Historical evidence vs modeled performance

Atlas `research/transcriptions/aircraft-performance.json` supplies source-transcribed historical performance observations to the 7.5 preview. Observations are not themselves predictions or validated physics fits. The physics repo owns prediction code and its calibration/validation. Preserve the original source URL, specimen/variant, engine, boost/RPM, fuel, altitude, airspeed type, gear, configuration and weight when available. Unknown remains unknown.

Four distinct record types must be visible:

- **Reported / recorded:** source-stated test data with scope and uncertainty.
- **Reconstructed / interpolated:** explicitly derived between comparable points.
- **Estimated / modeled:** calculated from assumptions or physics, with the version displayed.
- **Missing / unresolved:** no defensible value; never silently substitute zero or another aircraft.

Greg's internal calculation tables, NACA experimental measurements, official flight reports, secondary simulator estimates and our predictions are **not interchangeable evidence tiers**.

## Gate for integrating a new physics release

Do **not** import a new physics development branch, rename the old research HTML or overwrite Atlas's embedded page just to show progress. Integrate only after a specific request and review of an identifiable physics snapshot.

1. **Physics release record:** exact repository, tag/commit SHA, four-aircraft test/configuration register, scientific acceptance report, known failure list, numerical/regression test output and intended run mode.
2. **Deterministic interface:** prefer a documented JavaScript/JSON static export with explicit units, inputs, output statuses and provenance; avoid copy-pasting an entire research ZIP or relying on hidden global variables. If the next milestone only exposes standalone HTML, pin and package that snapshot instead, without falsely claiming an API.
3. **No silent semantic changes:** annotate IAS/CAS/EAS/TAS, true altitude, wing loading, fuel, RPM, manifold/boost and source configuration; explicitly distinguish instant vs sustained turn and level vs max-power climb.
4. **Controlled adoption:** add as a new versioned static asset; keep the old v2.4 link/compatibility fallback until the new release works.
5. **Atlas verification:** run the reproducible build, dependency-free Node tests, Playwright browser tests (if available), default v7.4, opt-in v7.5, narrow mobile view and direct standalone model. Check performance and cache behavior.
6. **Communication:** update Atlas README/status, UI model labeling and release/source references; disclose all unsupported comparisons.
7. **Rollback:** retain a named last-working asset and Git commit. Never force-push or silently delete historical sources.

## Cross-repository coordination

- A website UX task must **not** edit the physics repository.
- A physics research assignment must **not** edit the website without a separate, explicit integration request.
- When both repos have live feature branches, pin each to an exact commit for comparison.
- No requirement to link their histories, add a git submodule, change build system or move the website to a new framework.
- Release milestones belong in GitHub tags/PR descriptions, not increasingly large ChatGPT handover archives.

## Practical starting state

At 30 October 2026 the Atlas main commit before documentation cleanup was `b771212b986f4326e1202016d68f8da08b9103b6`, with its v2.4 research embed. The physics repo had a v2.5 imported baseline and a pending v3 evidence/accuracy program, **not a demonstrated v3 model**. Always reread current branches/tags and validation before claiming either is newer or complete.
