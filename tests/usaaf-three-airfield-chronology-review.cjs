"use strict";
// Three focused provenance and map-safety gates. Research data are not operational-map approved.
const assert=require("node:assert/strict");
const path=require("node:path");
const base=path.join(__dirname,"../research/transcriptions");
const cases=require(path.join(base,"usaaf-1944-1945-three-preoperational-airfield-case-resolutions.json"));
const prior=require(path.join(base,"usaaf-1988-priority-75-source-text-review-1944-1945.json"));
assert.equal(cases.audit.targetedSourceRows,3);
assert.equal(cases.audit.readyForExactPreoperationalPin,0);
assert.equal(cases.audit.contemporaryEngineerReportsOrUnitORBsDirectlyRead,0);
assert.equal(cases.cases.length,3);
assert.deepEqual(cases.cases.map(x=>x.code),["A-44","Y-44","Y-47"]);
assert.equal(new Set(cases.cases.map(x=>x.sourceRowId)).size,3);
for(const r of cases.cases){
 const old=prior.reviewRows.find(x=>x.sourceRowId===r.sourceRowId);
 assert.ok(old, "original source line missing: "+r.sourceRowId);
 assert.equal(old.airfieldCode,r.code);
 assert.equal(old.reviewDecision,"historical_ambiguity_still_open");
 assert.equal(r.officialInitialOperationalDate,old.reviewedHeader.initialOperationalDate);
 assert.ok(r.sources.some(x=>x.class==="USAF_official_retrospective"),"missing USAF source "+r.code);
 assert.ok(r.sources.every(x=>x.url.startsWith("https://")&&x.locator&&x.supports));
 assert.equal(r.cartographicDecision.unitBasedAircraftStrength,"PROHIBITED");
}
const a=cases.cases[0],b=cases.cases[1],c=cases.cases[2];
assert.equal(a.originalSourceRowScope,"detachment, not full group");
assert.equal(a.cartographicDecision.preOperationalUnitPin,"SUPPRESS");
assert.equal(a.eventCandidates[0].type,"advance_reconnaissance_or_survey_presence");
assert.equal(b.cartographicDecision.Y44FromOctober1944ToFebruary1945,"EXCLUDE_FROM_Y44_BEek_RUNWAY_PIN");
assert.ok(b.eventCandidates.some(e=>e.date==="1944-10-21"&&e.type==="squadron_stationed_in_Maastricht_area"));
assert.ok(b.eventCandidates.some(e=>e.date==="1945-03-28"));
assert.ok(b.sources.some(e=>e.url.includes("nimh.nl")));
assert.equal(c.cartographicDecision.actualY47RunwayPinBeforeDeclaredOp,"SUPPRESS_UNTIL_ENGINEERING_PLAN_OR_ORB");
assert.ok(c.eventCandidates.some(e=>e.date==="1944-10-26"&&e.type==="subunit_flight_operated_in_Namur_area"));
assert.ok(c.eventCandidates.some(e=>e.date==="1945-02-22"&&e.type==="declared_airfield_operational"));
assert.ok(c.researchConclusion.includes("remained stationed at Buc"));
console.log("PASS: A-44/Y-44/Y-47 historical-place distinctions, provenance and pre-operational map exclusions");
