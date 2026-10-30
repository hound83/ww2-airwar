const assert = require('node:assert/strict');
const fs = require('node:fs');
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

const strength02Dir = path.join(__dirname, '../research/transcriptions/rkka-strength-02');
const strength02Files = fs.readdirSync(strength02Dir).filter(x => /^rkka-vvs-strength-02-\d{2}\.json$/.test(x));
assert.equal(strength02Files.length, 22);
assert.equal(strength02Files.reduce((sum, x) => sum + JSON.parse(fs.readFileSync(path.join(strength02Dir, x), 'utf8')).rows.length, 0), 1344);
const sovietRegiments = require(path.join(strength02Dir, 'rkka-vvs-1941-border-district-regiments.json'));
assert.equal(sovietRegiments.distinctRegiments, 121);
assert.equal(sovietRegiments.aircraftTypeRows, 165);
assert.equal(sovietRegiments.publishedAllFiveDistrictsReconciled.totalAircraft, 7009);
assert.equal(sovietRegiments.publishedAllFiveDistrictsReconciled.inoperativeAircraft, 855);
assert.equal(sovietRegiments.publishedAllFiveDistrictsReconciled.derivedOperationalAircraft, 6154);
assert.equal(sovietRegiments.districtReconciliation.length, 5);
assert.ok(sovietRegiments.districtReconciliation.every(x => x.arithmeticMatchesSource));
assert.equal(sovietRegiments.headquartersRecords.reduce((n, x) => n + (x.aircraftTotal ?? 0), 0), 46);

const german = load('luftwaffe-fighter-readiness-quarter-years-1938-1942.json');
assert.equal(german.dateAndCategorySnapshots, 18);
assert.equal(german.totalDataRows, 579);
assert.equal(new Set(german.reports.map(x => `${x.date}/${x.category}`)).size, 18);
const germanSample = german.reports.find(x => x.date === '1939-09-30' && x.category === 'single_engine_fighters');
assert.equal(germanSample.printedCategoryTotal.aircraftOnStrength, 1125);
assert.equal(germanSample.printedCategoryTotal.aircraftServiceable, 870);
assert.ok(german.reports.some(x => !x.allComparableColumnsMatch));

const rawUSAAF = load('usaaf-1945-digest-personnel-crew-tables.json');
assert.equal(rawUSAAF.tableCount, 25);
assert.equal(Object.values(rawUSAAF.tables).reduce((n, x) => n + x.rowCount, 0), 1093);
for (const x of ['24', '25', '36', '37', '67', '68', '69', '70', '71', '72', '73']) {
  assert.ok(rawUSAAF.tables[x].rowCount > 10);
}
const usaafPerson = load('usaaf-1945-eto-mto-officer-casualties-monthly.json');
assert.equal(usaafPerson.tables.ETO.monthlyOfficersBySpecialty.length, 15);
assert.equal(usaafPerson.tables.MTO.monthlyOfficersBySpecialty.length, 15);
assert.equal(usaafPerson.tables.ETO.battleCasualties.monthly.length, 45);
assert.equal(usaafPerson.tables.MTO.battleCasualties.monthly.length, 45);
assert.equal(usaafPerson.tables.ETO.battleCasualties.grandTotal.allPersonnelTotal, 63410);
assert.equal(usaafPerson.tables.MTO.battleCasualties.grandTotal.allPersonnelTotal, 31155);
assert.equal(usaafPerson.tables.ETO.monthlyOfficersBySpecialty[0].officerPersonnelOnStrengthBySpecialty.pilots, 22153);
assert.ok(usaafPerson.tables.ETO.battleCasualties.monthlyToAnnualDiscrepancies.length > 0);

const usaafPlanes = load('usaaf-eto-aircraft-on-hand-type-snapshots-1942-1945.json');
assert.equal(usaafPlanes.dateCount, 13);
assert.equal(usaafPlanes.roleAndModelRows, 33);
assert.equal(usaafPlanes.categorySubtotalsVsCombatGrandIssues.length, 0);
assert.equal(usaafPlanes.records.find(x => x.aircraftModelOrSummaryAsReported === 'TOTAL COMBAT').aircraftOnHandByDate['1945-04'], 9776);

const raf = load('raf-air22-europe-operational-aircraft-1939-1945.json');
assert.equal(raf.dateCount, 17);
assert.equal(raf.commandAndTypeRows, 85);
assert.equal(raf.printedRoleAndOverallReconciliationIssues.length, 0);
assert.equal(raf.records.find(x => x.roleSummary === 'all').operationalAircraftByExactDate['1945-04-30'], 4438);

const spain = load('spanish-civil-war-rgva-aircraft-and-soviet-pilots-1936-1938.json');
const rgva = spain.republicanAircraftLossByTypeAndCauseTableV5;
assert.equal(rgva.causes.reduce((sum, x) => sum + x.printedTotal, 0), 567);
for (const record of rgva.causes) assert.equal(record.countsByType.reduce((a, b) => a + b, 0), record.printedTotal);
for (let i = 0; i < rgva.aircraftTypeColumns.length; i++) {
  assert.equal(rgva.causes.reduce((sum, x) => sum + x.countsByType[i], 0), rgva.printedTypeTotals[i]);
}
const scwPilots = spain.sovietPilotsByAircraftTypeAndYearTableV6;
assert.equal(scwPilots.records.reduce((sum, x) => sum + x.printedTotal, 0), 770);
const scwCasualties = spain.sovietPilotFatalitiesAndMissingTableV7;
assert.equal(scwCasualties.records.reduce((sum, x) => sum + x.fatalitiesTotal, 0), 77);
assert.equal(scwCasualties.records.reduce((sum, x) => sum + x.missingTotal, 0), 22);
for (const x of scwCasualties.records) assert.equal(x.fatalitiesTotal + x.missingTotal, x.combinedTotal);

const dutch = load('netherlands-army-aviation-may-1940-sorties-losses-secondary.json');
assert.equal(Object.values(dutch.operationalFlights.byDate).reduce((a, b) => a + b, 0), 171);
assert.equal(dutch.aircraftLosses.categories.reduce((sum, x) => sum + x.count, 0), 94);
for (const c of dutch.aircraftLosses.categories) {
  assert.equal(Object.values(c.types).reduce((a, b) => a + b, 0), c.count);
}

console.log('Grand Air War research transcription integrity checks passed (13 datasets plus 22-source Soviet series).');
