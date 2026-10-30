const assert = require('node:assert/strict');
const path = require('node:path');

function load(name) {
  return require(path.join(__dirname, '../research/transcriptions', name));
}

const losses = load('rkka-vvs-combat-aircraft-losses-by-type-1941-1945.json');
assert.equal(losses.records.length, 34);
assert.equal(losses.printedOverallTotal.total, 37165);
assert.equal(losses.arithmeticDiscrepancies.length, 0);
for (const year of ['1941', '1942', '1943', '1944', '1945']) {
  assert.equal(losses.records.reduce((sum, x) => sum + (x.combatLossesByYear[year] ?? 0), 0), losses.printedOverallTotal[year]);
}
assert.equal(losses.records.reduce((sum, x) => sum + x.combatLossesTotal, 0), 37165);

const sorties = load('rkka-vvs-air-army-sorties-by-mission-1944.json');
assert.equal(sorties.records.length, 13);
assert.equal(sorties.printedTotals.totalSorties, 817047);
assert.equal(sorties.arithmeticDiscrepancies.length, 0);
for (const r of sorties.records) {
  assert.equal(r.daySorties + r.nightSorties, r.totalSorties);
  assert.equal(Object.values(r.missionSorties).reduce((sum, x) => sum + (x ?? 0), 0), r.totalSorties);
}
assert.equal(sorties.records.reduce((sum, r) => sum + r.totalSorties, 0), 817047);

const finnish = load('finland-national-archives-squadron-linked-deaths-1939-1945.json');
assert.equal(finnish.inputRecordCountAllServices, 94676);
assert.equal(finnish.records.length, 20);
assert.equal(finnish.matchedIndividualDeathRecordCount, 477);
assert.equal(finnish.records.reduce((sum, r) => sum + r.wartimeDeathsRecorded, 0), 477);
for (const r of finnish.records) {
  assert.equal(Object.values(r.byYear).reduce((a, b) => a + b, 0), r.wartimeDeathsRecorded);
  assert.equal(Object.values(r.byReportedDeathCategory).reduce((a, b) => a + b, 0), r.wartimeDeathsRecorded);
}

const seeds = load('cross-force-quantitative-evidence-seeds-2026-10-30.json');
assert.equal(seeds.groups.length, 7);
assert.equal(seeds.groups.reduce((sum, group) => sum + group.observations.length, 0), 50);
const italian = seeds.groups.find(g => g.id === 'ITA-DOD-1943-09-08');
const value = (formation, metric) => italian.observations.find(o => o.formation === formation && o.metric === metric).value;
assert.equal(value('Regia Aeronautica, warplanes', 'aircraft_on_strength') + value('Regia Aeronautica, transports', 'aircraft_on_strength'), value('Regia Aeronautica, total', 'aircraft_on_strength'));
assert.equal(value('Regia Aeronautica, warplanes', 'aircraft_serviceable') + value('Regia Aeronautica, transports', 'aircraft_serviceable'), value('Regia Aeronautica, total', 'aircraft_serviceable'));
assert.equal(value('Regia Aeronautica, fighters', 'aircraft_serviceable') + value('Regia Aeronautica, bombers', 'aircraft_serviceable'), value('Regia Aeronautica, warplanes', 'aircraft_serviceable'));

console.log('Grand Air War research transcription integrity checks passed (4 datasets).');
