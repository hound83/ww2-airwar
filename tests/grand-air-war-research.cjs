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
const opposingAxis = require(path.join(strength02Dir, 'rkka-axis-german-aircraft-strength-by-theater-1941-1945.json'));
assert.equal(opposingAxis.geographicTheaterRows.length, 142);
assert.equal(opposingAxis.alliedNationSnapshotsFromTable0222.length, 9);
assert.equal(opposingAxis.roleArithmeticIssues.length, 0);
assert.equal(opposingAxis.alliedNationArithmeticIssues.length, 0);
assert.equal(opposingAxis.geographicTheaterRows.find(x => x.sourceRow === 5).combatAircraftOnHandReported, 4942);
assert.equal(opposingAxis.alliedNationSnapshotsFromTable0222[0].aircraftOnStrengthByNation.hungary, 90);
assert.ok(opposingAxis.geographicTheaterRows.find(x => x.sourceRow === 83).sourceDateWarning.includes('15 Apr'));
const sovietNavy = require(path.join(strength02Dir, 'rkka-vmf-naval-aviation-combat-aircraft-and-crews-by-fleet-1941-1945.json'));
assert.equal(sovietNavy.europeanFleetSnapshots.length, 48);
assert.equal(new Set(sovietNavy.europeanFleetSnapshots.map(r => r.date)).size, 12);
assert.equal(sovietNavy.excludedPacificFleetSnapshots.length, 2);
assert.equal(sovietNavy.numericOrStructuralExceptions.length, 1);
const vmf1941 = sovietNavy.europeanFleetSnapshots.filter(r => r.date === '1941-06-22');
const vmfTotal1941 = vmf1941.find(r => r.fleetCategory === 'all_fleets_subtotal');
assert.equal(vmfTotal1941.combatAircraft.total, 1445);
assert.equal(vmfTotal1941.combatReadyCrews.total, 1399);
assert.equal(vmf1941.filter(r => r !== vmfTotal1941).reduce((n, r) => n + r.combatAircraft.total, 0), 1445);
const sovietPvo = require(path.join(strength02Dir, 'rkka-pvo-fighter-defense-unit-aircraft-and-crews-1941-1945.json'));
assert.equal(sovietPvo.records.length, 98);
assert.equal(sovietPvo.structuralAndArithmeticExceptions.length, 0);
assert.equal(sovietPvo.records.filter(r => r.category === 'source_total').length, 12);
assert.equal(sovietPvo.records.filter(r => r.category === 'source_total' && r.date === '1945-01-01').length, 2);
assert.equal(sovietPvo.records.find(r => r.date === '1942-05-10' && r.category === 'source_total').aircraftOnHand.total, 1561);
const sovietLongRange = require(path.join(strength02Dir, 'rkka-long-range-bomber-units-aircraft-crews-and-stations-1941-1945.json'));
assert.equal(sovietLongRange.records.length, 111);
assert.equal(sovietLongRange.records.filter(r => r.category === 'source_total').length, 13);
assert.equal(sovietLongRange.records.find(r => r.category === 'source_total' && r.date === '1945-05-10').combatAircraft.onHand, 1675);
assert.deepEqual(sovietLongRange.structuralAndArithmeticExceptions.map(r => r.sourceRow), [112]);

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
const crewLosses = load('usaaf-eto-mto-crew-losses-combat-accident-by-role-monthly-1943-1945.json');
assert.equal(Object.keys(crewLosses.aircraftCrewRoleTables).length, 7);
assert.equal(crewLosses.dateKeys.length, 27);
assert.equal(crewLosses.allTypeBaselineByTheater.ETO['Combat & Accident Losses'].total, 9439);
assert.equal(crewLosses.allTypeBaselineByTheater.MTO['Combat & Accident Losses'].total, 4403);
assert.equal(crewLosses.arithmeticDiscrepancies.length, 0);
const crewsOnHand = load('usaaf-eto-mto-crews-on-hand-by-aircraft-type-monthly-1943-1945.json');
assert.deepEqual(crewsOnHand.theaters.map(t => t.monthly.length), [27, 27]);
assert.equal(crewsOnHand.theaters[0].monthly[0].reportedAllCrewsOnHand, 1069);
assert.equal(crewsOnHand.theaters[1].monthly[0].reportedAllCrewsOnHand, 2887);
assert.ok(crewsOnHand.theaters[0].auditIssues.some(x => x.originalText === '1,20'));
assert.ok(crewsOnHand.theaters[1].auditIssues.some(x => x.originalText === '4.260'));
const usaafSortiesAnnual = load('usaaf-official-airborne-effective-sorties-eto-mto-annual-1942-1945.json');
assert.deepEqual(usaafSortiesAnnual.sourceTableNumbers, [119, 120]);
for (const theater of usaafSortiesAnnual.theaters) {
  for (const metric of ['airborne', 'effective']) {
    for (const role of ['all', ...usaafSortiesAnnual.roleKeys]) {
      assert.equal(theater.annual.reduce((sum, r) => sum + (r[role][metric] ?? 0), 0), theater.reportedGrandTotal[role][metric]);
    }
    for (const year of theater.annual) {
      if (year.all[metric] === null) continue;
      const roleSum = usaafSortiesAnnual.roleKeys.reduce((sum, role) => sum + (year[role][metric] ?? 0), 0);
      assert.equal(roleSum, year.all[metric]);
    }
  }
}
assert.equal(usaafSortiesAnnual.theaters.find(x => x.theater === 'ETO').reportedGrandTotal.all.airborne, 1034052);
assert.equal(usaafSortiesAnnual.theaters.find(x => x.theater === 'MTO').annual[0].all.effective, null);
const usaafSortieCauses = load('usaaf-eto-mto-non-effective-sorties-by-role-and-cause-quarterly-1942-1945.json');
assert.deepEqual(usaafSortieCauses.theaters.map(t => t.quarterly.all_types.length), [12, 10]);
assert.equal(usaafSortieCauses.arithmeticExceptions.length, 0);
assert.equal(usaafSortieCauses.theaters[0].printedGrandTotals.all_types.total, 135294);
assert.equal(usaafSortieCauses.theaters[1].printedGrandTotals.all_types.total, 83848);
assert.equal(usaafSortieCauses.theaters[0].quarterly.medium_light_bomber[0].total, null);
for (const theater of usaafSortieCauses.theaters) {
  for (const records of Object.values(theater.quarterly)) {
    for (const r of records) {
      if (r.total !== null) assert.equal(r.weather + r.mechanical + r.other, r.total);
    }
  }
}

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

const specialistDir = path.join(__dirname, '../research/transcriptions/specialist-ww2-statistical-tables');
const specialistFiles = fs.readdirSync(specialistDir).filter(name => name.endsWith('.json'));
assert.equal(specialistFiles.length, 14);
assert.equal(specialistFiles.reduce((sum, f) => {
  const source = JSON.parse(fs.readFileSync(path.join(specialistDir, f), 'utf8'));
  assert.ok(source.sourceUrl.startsWith('https://www.theworldwars.net/stats/'));
  return sum + source.tables.reduce((n, tab) => n + tab.rows.length, 0);
}, 0), 1145);

const bomberMonthly = load('raf-bomber-command-sorties-missing-crashes-monthly-1939-1945.json');
assert.equal(bomberMonthly.monthly.length, 69);
assert.equal(bomberMonthly.reportedAnnual.length, 7);
assert.equal(bomberMonthly.reportedGrandTotal.sortiesTotal, 373514);
assert.equal(bomberMonthly.reportedGrandTotal.totalLost, 10121);
assert.equal(bomberMonthly.arithmeticIssues.length, 0);
for (const month of bomberMonthly.monthly) {
  if (month.sortiesDay !== null && month.sortiesNight !== null) {
    assert.equal(month.sortiesDay + month.sortiesNight, month.sortiesTotal);
  }
}

const germanBroad = load('luftwaffe-available-serviceable-by-role-1939-1945.json');
assert.equal(germanBroad.monthlySnapshots.length, 23);
assert.equal(germanBroad.arithmeticIssues.length, 0);
assert.equal(germanBroad.monthlySnapshots.find(x => x.month === '1940-06').onHand.singleEngineFighter, 1107);
assert.equal(germanBroad.monthlySnapshots.find(x => x.month === '1940-06').serviceable.singleEngineFighter, 856);
assert.ok(germanBroad.monthlySnapshots.find(x => x.month === '1945-04').sourceReportingException.includes('February'));

const usaafMtoPlanes = load('usaaf-mediterranean-aircraft-on-hand-by-type-1942-1945.json');
assert.equal(usaafMtoPlanes.dateKeys.length, 13);
assert.equal(usaafMtoPlanes.typeOrCategoryRecords.length, 36);
assert.equal(usaafMtoPlanes.typeOrCategoryRecords.find(r => r.aircraftTypeOrCategory === 'TOTAL').onHand['1945-04'], 4809);

const rafCommand = load('raf-command-sorties-tonnage-losses-by-year-1939-1945.json');
assert.equal(rafCommand.commands.length, 6);
assert.equal(rafCommand.reportedGrandTotal.sorties, 2336303);
assert.equal(rafCommand.parseIssues.length, 0);

const claimsVsLosses = load('battle-of-britain-1940-raf-german-losses-vs-raf-claims-weekly.json');
assert.equal(claimsVsLosses.weekly.length, 18);
assert.equal(claimsVsLosses.monthly.length, 5);
assert.equal(claimsVsLosses.weekly.at(-1).rafClaimsAgainstLuftwaffe, 2698);
assert.equal(claimsVsLosses.weekly.at(-1).luftwaffeAircraftLostAsReported, 1733);
assert.equal(claimsVsLosses.reconciliationIssues.length, 0);

const engaged = load('usaaf-raf-allied-aircraft-engaged-europe-monthly-1942-1945.json');
assert.equal(engaged.monthlyObservations.length, 34);
assert.equal(engaged.arithmeticIssues.length, 0);

const dday = load('allied-dday-1944-air-unit-types-and-historical-station-names.json');
assert.equal(dday.records.length, 615);
assert.deepEqual(dday.counts, {
  printedRecords: 615, recordsWithStations: 422, recordsWithAircraftType: 413,
  distinctReportedStationStrings: 261,
});
assert.ok(dday.records.every(r => r.date === '1944-06-06'));
assert.ok(dday.records.every(r => !('latitude' in r) && !('longitude' in r)));

console.log('Grand Air War research transcription integrity checks passed (21 normalized groups plus source-table bundles).');
