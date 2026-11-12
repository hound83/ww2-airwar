"use strict";
const assert=require("node:assert/strict");
const path=require("node:path");
const read=name=>require(path.join(__dirname,"../research/transcriptions",name));
const review=read("usaaf-1988-priority-75-source-text-review-1944-1945.json");
const base=read("usaaf-1988-unit-airfield-month-crosschecked-1944-1945.json");
const raw=read("usaaf-1988-eto-a-y-r-airfield-unit-occupancy-ocr-candidates-1944-1945.json");
assert.equal(review.reviewRows.length,75);
assert.equal(review.audit.originalReviewPriorityLines,75);
assert.equal(review.audit.distinctAirfieldCodesReviewed,44);
assert.equal(review.audit.distinctFieldHeadersReparsed,24);
assert.equal(review.audit.sourceLinesWithHeaderReparse,51);
assert.equal(review.audit.sourceLinesWithUnitMonthRecovery,20);
assert.deepEqual(review.audit.reviewDecisionCounts,{
 ocr_or_layout_recovered_from_source_text:65,
 historical_sequence_or_release_semantics_explained:5,
 historical_ambiguity_still_open:3,
 postwar_only_scope_issue:2
});
assert.equal(review.audit.originalPriorityMonthRows,155);
assert.equal(review.audit.recoveredPriorityMonthRows,217);
assert.equal(review.audit.addedResearchMonthRows,62);
assert.equal(review.audit.totalResearchMonthCandidatesAfterSubstitution,826);
assert.equal(review.audit.openCasesWithFurtherSourceLeads,3);
const ids=new Set(review.reviewRows.map(r=>r.sourceRowId));
assert.equal(ids.size,75);
const originals=new Set(raw.records.map(x=>`usaf1988-p${x.printedOriginalPage}-l${x.physicalLineOnPrintedPage}`));
for(const r of review.reviewRows){
 assert.ok(originals.has(r.sourceRowId),r.sourceRowId);
 assert.equal(base.sourceRows.find(x=>x.sourceRowId===r.sourceRowId)?.qualityTier,"review_priority");
 assert.equal(r.dashboardPermission,"RESEARCH_ONLY_NOT_VERIFIED_MAP_PLACEMENT");
 if(r.reviewDecision==="historical_ambiguity_still_open")assert.ok(r.openCaseEvidence?.sourceUrl,r.sourceRowId);
 if(r.reviewDecision==="historical_sequence_or_release_semantics_explained")assert.ok(r.externalEvidence?.url,r.sourceRowId);
 if(r.sourceCorrectionKind.unitPeriod)assert.ok(r.reviewedFirstMonth&&r.reviewedLastMonth,r.sourceRowId);
}
const a4=review.reviewRows.find(r=>r.airfieldCode==="A-4");
assert.equal(a4.originalHeaderDateTokens.release,"30-6-44");
assert.equal(a4.reviewedHeader.initialOperationalDate,"1944-06-30");
assert.equal(a4.reviewedHeader.releaseDate,"1944-09-15");
const y44=review.reviewRows.find(r=>r.airfieldCode==="Y-44");
assert.equal(y44.reviewDecision,"historical_ambiguity_still_open");
assert.ok(y44.openCaseEvidence.finding.includes("MUST NOT"));
const namur=review.reviewRows.find(r=>r.airfieldCode==="Y-47");
assert.equal(namur.reviewDecision,"historical_ambiguity_still_open");
const erlangen=review.reviewRows.find(r=>r.airfieldCode==="R-96");
assert.equal(erlangen.reviewDecision,"historical_sequence_or_release_semantics_explained");
for(const r of review.recoveredMonthRowsForOriginallyFlagged){
 assert.ok(ids.has(r.sourceRowId));
 assert.ok(r.month<="1945-05");
 if(r.month==="1945-05")assert.ok(r.blockedFromOperationalMap);
 if(["Y-44","Y-47","A-44"].includes(r.airfieldCode))assert.ok(r.blockedFromOperationalMap);
}
console.log("USAAF original-source priority 75 review: audit, provenance, cutoff and gates OK");
