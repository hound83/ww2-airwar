"use strict";
const assert=require("node:assert/strict");
const path=require("node:path");
const read=name=>require(path.join(__dirname,"../research/transcriptions",name));

const cross=read("usaaf-1988-unit-airfield-month-crosschecked-1944-1945.json");
const original=read("usaaf-1988-eto-a-y-r-airfield-unit-occupancy-ocr-candidates-1944-1945.json");
const officialHeaders=read("usaaf-official-1988-american-a-y-r-code-continental-airfield-header-candidates-1944-1945.json");
assert.equal(cross.audit.sourceLineCandidates,305);
assert.equal(cross.audit.parseableMonthLines,285);
assert.equal(cross.audit.monthCandidates,764);
assert.equal(cross.audit.distinctAirfieldMonths,529);
assert.equal(cross.audit.unitMonthWithMoreThanOneAirfield,153);
assert.deepEqual(cross.audit.sourceRowQualityCounts,{corroborated_candidate:81,ocr_candidate:149,review_priority:75});
assert.deepEqual(cross.audit.monthQualityCounts,{corroborated_candidate:226,ocr_candidate:383,review_priority:155});
assert.equal(cross.sourceRows.length,original.records.length);
assert.equal(cross.monthlyCandidates.length,cross.audit.monthCandidates);
const ids=new Set(cross.sourceRows.map(x=>x.sourceRowId));
const headerCodes=new Set(officialHeaders.records.map(x=>x.code));
assert.equal(ids.size,cross.sourceRows.length);
for(const row of cross.sourceRows){
  assert.ok(headerCodes.has(row.airfieldCode),row.sourceRowId);
  assert.ok(["corroborated_candidate","ocr_candidate","review_priority"].includes(row.qualityTier));
  if(row.qualityTier==="corroborated_candidate"){
    assert.ok(row.maurerMatches.some(x=>x.temporalOverlapCandidate),row.sourceRowId);
    assert.ok(row.flags.every(flag=>flag==="original_range_continues_after_1945_05_09"),row.sourceRowId);
  }
}
for(const row of cross.monthlyCandidates){
  assert.ok(ids.has(row.sourceRowId),row.sourceRowId);
  assert.ok(row.month>="1944-06"&&row.month<="1945-05",row.month);
  assert.ok(!Object.hasOwn(row,"latitude")&&!Object.hasOwn(row,"longitude"));
}
assert.ok(cross.simultaneousMonthCandidates.every(x=>x.airfieldCodes.length>1));

const unit=read("grand-air-war-unit-strength-losses-claims-multiforce-seeds-1939-1945.json");
assert.equal(unit.audit.sovietRegimentAircraftTypeRows,165);
assert.equal(unit.audit.sovietRegimentsInFiveBorderDistricts,121);
assert.equal(unit.audit.sovietRegimentAircraftOnHand,6963);
assert.equal(unit.audit.sovietRegimentInoperative,853);
assert.equal(unit.audit.sovietRegimentPotentiallyOperational,6110);
assert.equal(unit.audit.belgianSquadronRows,16);
assert.equal(unit.audit.belgianSquadronAircraftOnHand,182);
assert.equal(unit.audit.unitAircraftStrengthRows,182);
assert.equal(unit.audit.unitOperationsAndLossesRows,11);
assert.equal(unit.audit.unitPersonnelDeathSquadrons,20);
assert.equal(unit.audit.finnishSquadronAssociatedDeaths,477);
for(const row of unit.unitAircraftStrength){
  if(row.aircraftOnHand!==null&&row.aircraftInoperative!==null){
    assert.ok(row.aircraftOnHand>=row.aircraftInoperative,row.unit);
    assert.equal(row.aircraftOnHand-row.aircraftInoperative,row.aircraftPotentiallyOperationalDerived,row.unit);
  }
  if(row.force==="Royal Hungarian Air Force"){
    assert.equal(row.aircraftOnHand,null);
    assert.equal(row.initialOrganizationAircraftAllowanceDerived,40);
  }
}
for(const row of unit.unitPersonnelDeaths){
  assert.equal(Object.values(row.byYear).reduce((a,b)=>a+b,0),row.squadronAssociatedDeathRecords);
  assert.equal(Object.values(row.byDeathCategory).reduce((a,b)=>a+b,0),row.squadronAssociatedDeathRecords);
}
const czech312=unit.unitOperationsAndLosses.find(x=>x.unit==="312 (Czechoslovak) RAF");
assert.equal(czech312.ownAircraftLostBattleOfBritain,4);
const usaf=unit.unitOperationsAndLosses.filter(x=>x.force==="USAAF Fifteenth Air Force");
assert.equal(usaf.length,4);
assert.ok(usaf.every(x=>x.ownFightersLostInAirCombat===null));

const groups=read("usaaf-1945-statistical-digest-eto-mto-combat-groups-monthly-1942-1945.json");
assert.equal(groups.records.length,80);
assert.equal(new Set(groups.records.map(x=>x.month)).size,40);
assert.equal(groups.records.filter(x=>x.theater==="ETO").length,40);
assert.equal(groups.records.filter(x=>x.theater==="MTO").length,40);
assert.deepEqual(groups.audit.sourceArithmeticDiscrepancies,[
  {month:"1942-02",theater:"MTO",difference:-1},
  {month:"1942-04",theater:"MTO",difference:1},
  {month:"1944-09",theater:"ETO",difference:-1}
]);
assert.equal(groups.records.find(x=>x.month==="1944-06"&&x.theater==="ETO").totalCombatGroups,102);
assert.equal(groups.records.find(x=>x.month==="1945-04"&&x.theater==="ETO").totalCombatGroups,109);
console.log("Grand Air War unit-level research: 3 datasets and source audits OK");
