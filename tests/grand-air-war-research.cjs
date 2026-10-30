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
const eighthAf = load('usaaf-eighth-air-force-combat-sortie-loss-rates-monthly-1942-1944.json');
assert.equal(eighthAf.monthly.length, 29);
assert.deepEqual(eighthAf.reported1943GrandHeavyBomber, {
  creditSorties: 22099, missingAndCategoryEAircraft: 1128, printedLossRatePercent: 5.1,
});
assert.equal(eighthAf.monthly.filter(r => r.creditSortiesHeavyBomber !== null).length, 12);
assert.equal(eighthAf.crossSourceRateDiscrepancies.length, 0);

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

const part06Dir = path.join(__dirname, '../research/transcriptions/rkka-operations-06');
const part06Files = fs.readdirSync(part06Dir).filter(f => /^rkka-operations-06-\d{2}\.json$/.test(f));
assert.equal(part06Files.length, 36);
const part06Sources = part06Files.map(f => JSON.parse(fs.readFileSync(path.join(part06Dir, f), 'utf8')));
assert.equal(part06Sources.reduce((n, x) => n + x.tables.length, 0), 39);
assert.equal(part06Sources.reduce((n, x) => n + x.tables.reduce((m, t) => m + t.sourceRowCount, 0), 0), 1064);
const sovietAllServices = load('rkka-combined-vmf-pvo-add-missions-losses-claims-1941-1945.json');
assert.deepEqual(Object.fromEntries(Object.entries(sovietAllServices.vmfWideFleetTables).map(([k, v]) => [k, v.records.length])), {
  '14': 9, '25': 33, '30': 11, '31': 20,
});
assert.ok(Object.values(sovietAllServices.vmfWideFleetTables).every(v => v.sourceArithmeticDiscrepancies.length === 0));
const vmfRow = n => sovietAllServices.vmfWideFleetTables[n].records.at(-1);
assert.deepEqual([vmfRow('14').printedAllWarTotalIncludingPacific, vmfRow('14').derivedEuropeanSubtotalExcludingPacific], [350759,346035]);
assert.deepEqual([vmfRow('25').printedAllWarTotalIncludingPacific, vmfRow('25').derivedEuropeanSubtotalExcludingPacific], [4040,4006]);
assert.deepEqual([vmfRow('30').printedAllWarTotalIncludingPacific, vmfRow('30').derivedEuropeanSubtotalExcludingPacific], [5521,5513]);
assert.equal(sovietAllServices.pvoFighterOperationsByUnit.records.length, 29);
assert.equal(sovietAllServices.pvoFighterOperationsByUnit.printedOverall.combatSorties, 269565);
assert.equal(sovietAllServices.pvoFighterOperationsByUnit.printedOverall.claimedEnemyAircraftShotDown, 3930);
assert.equal(sovietAllServices.pvoFighterOperationsByUnit.printedOverall.ownAircraftLost, 1588);
assert.equal(sovietAllServices.pvoIndependentTableTotalDiscrepancy, 100);
assert.equal(sovietAllServices.longRangeADDCombatSortiesByMissionAndYear.records.at(-1).publishedGrandTotal, 219788);
assert.equal(sovietAllServices.longRangeADDCombatAircraftLossesByTypeAndYear.records.at(-1).publishedGrandTotal, 2776);
const sovietAnnualSorties = load('rkka-vvs-ka-combat-sorties-by-year-period-and-mission-1941-1945.json');
assert.equal(sovietAnnualSorties.calendarYearMissionRows.length, 14);
assert.equal(sovietAnnualSorties.strategicPeriodMissionRows.length, 14);
assert.equal(sovietAnnualSorties.independentOriginalSourceDiscrepancies.overallPart06_02Minus06_03, 1);
assert.equal(sovietAnnualSorties.independentOriginalSourceDiscrepancies.calendar1944Part06_03MinusPart06_07AirArmy, 17);
assert.equal(sovietAnnualSorties.ordinalAlignedMissionComparisonWarnings.length, 2);
const germanResearchAudit = load('luftwaffe-third-party-unit-loss-station-data-audit-1942-1944.json');
assert.equal(germanResearchAudit.inputCensus.lossSourceRows, 33028);
assert.equal(germanResearchAudit.inputCensus.exactDuplicateLossRows, 788);
assert.equal(germanResearchAudit.inputCensus.stationDistinctFreeTextLabels, 1616);
assert.equal(germanResearchAudit.strictAuditedRows, 14154);
assert.equal(germanResearchAudit.sourceRoleByMonthAggregate.length, 357);
assert.equal(germanResearchAudit.unitGroupAggregateAcrossReportedMonths.length, 726);

const sovietPeople = load('rkka-vvs-human-casualty-distinct-populations-1941-1945.json');
assert.equal(sovietPeople.commandStaffKilledMissingAllCauses.personnelCategories.length, 14);
assert.equal(sovietPeople.commandStaffKilledMissingAllCauses.publishedKilledPlusMissing, 36166);
assert.equal(sovietPeople.separatelyReportedCombatAviatorLosses.categories.reduce((n,r)=>n+r.reportedCombatCasualties,0),27600);

const boBritain = load('battle-of-britain-raf-luftwaffe-strength-pilot-losses-victory-claims-1938-1940.json');
assert.equal(boBritain.rafFighterCommandWeeklyAircraftAvailability.records.length, 20);
assert.equal(boBritain.rafFighterCommandPilotEstablishmentAndOnHand.records.length, 20);
assert.equal(boBritain.rafFighterCommandMonthlyPilotCasualties.records.reduce((n,r)=>n+r.killedCapturedOrMissing,0),481);
assert.equal(boBritain.germanBattleOfBritainAircraftLossesVersusRafClaims.publishedTotals.germanActuallyDestroyed,1733);
assert.equal(boBritain.luftwaffeFourStrengthServiceabilitySnapshots['1938-09-19_all_flying_units'].printedTotalMinusCategorySum[1],66);
assert.equal(boBritain.luftwaffeFourStrengthServiceabilitySnapshots['1940-08-10_operating_against_Britain_ONLY'].publishedTotal[2],2550);

const france1940 = load('french-air-force-metropole-campaign-strength-replenishment-losses-1940.json');
assert.equal(france1940.countsAt1940May10.inTheFieldWithFrenchArmiesMetropolitanFrance,2176);
assert.equal(france1940.losses1940May10ToJune09.irreplaceableOwnFrenchAircraftLosses,852);
assert.equal(france1940.frenchReportedGermanAircraftVictoryClaims.authorCombinedCredits,853);
assert.equal(france1940.crewCasualties.pilotsOutOfActionByJune25Approximate,500);

const widerForces = load('raf-coastal-romanian-hungarian-polish-service-quantitative-1939-1945.json');
const coastalTotals = widerForces.rafCoastalCommand1939ToMay1945.publishedAllRoles;
assert.equal(coastalTotals.sorties,238313);
assert.equal(widerForces.rafCoastalCommand1939ToMay1945.byMissionRole.reduce((n,r)=>n+r.aircraftLostEnemyActionOrMissing,0),1511);
assert.equal(widerForces.royalRomanianAirForce.campaign1941OfficialAirForce.aircraftSorties,12108);
assert.equal(widerForces.royalRomanianAirForce.followingAug23_1944ChangeOfSides.reportWindow.through,'1945-05-12');
assert.equal(widerForces.hungarian101PumaFighterGroupMayToOct1944.claimsOfEnemyAircraftDestroyed.derivedClaimsTotal,107);
assert.equal(widerForces.polishAirForceSeptember1939.stockStartSeptember1939ByAircraftType.reduce((n,r)=>n+r.operationalUnits,0),397);

const finnishFrench = load('free-french-units-and-finnish-winter-war-strength-losses-1939-1945.json');
assert.equal(finnishFrench.freeFrenchFighterGroups.groupRecords.length,3);
assert.equal(finnishFrench.freeFrenchFighterGroups.groupDerivedSumOfClaimedDestroyed,409);
assert.equal(finnishFrench.freeFrenchFighterGroups.separateFAFLCollectiveSourceObservations.frenchMinistryOfDefenceFoundationNarrativeReportedClaims,353);
assert.equal(finnishFrench.finnishWinterWar.datedCombatAircraftUnitReadiness.length,5);
assert.equal(finnishFrench.finnishWinterWar.reportedWinterWarCombatAircraftWrittenOffAllCauses,58);
assert.equal(finnishFrench.finnishWinterWar.contradictingSecondaryReportedAllAircraftLosses,62);

const usWartimeStations = load('usaaf-maurer-public-domain-european-group-station-candidates-1940-1945.json');
assert.equal(usWartimeStations.counts.groupHeadingsDetectedInBothVolumes,292);
assert.equal(usWartimeStations.counts.groupsWithEuropeanOrMediterraneanStationCandidates,144);
assert.equal(usWartimeStations.counts.namedStationCandidates,741);
assert.equal(usWartimeStations.counts.candidatesWithPotentiallyWartimeStart,544);
assert.equal(usWartimeStations.groups.reduce((n,g)=>n+g.candidateStationCount,0),741);
assert.equal(usWartimeStations.groups.some(g=>g.unitName==='317 Troop Carrier Group' &&
  g.europeMediterraneanStationCandidates.every(r=>!r.withinAtlasDateScopeCandidate)),true);
assert.equal(usWartimeStations.groups.flatMap(g=>g.europeMediterraneanStationCandidates)
  .filter(r=>r.withinAtlasDateScopeCandidate).every(r=>r.startDateCandidate && r.startDateCandidate <= '1945-05-31'),true);

const usaafClaimsVsLosses = load('usaaf-official-eto-mto-actual-combat-mission-aircraft-losses-and-reported-victories-1942-1945.json');
const sumFields = (rows,k)=>rows.reduce((n,r)=>n+(r[k]||0),0);
for(const theater of ['ETO','MTO']) {
  const own=usaafClaimsVsLosses.ownAircraftCombatMissionLosses[theater];
  const credited=usaafClaimsVsLosses.reportedEnemyAircraftDestroyed[theater];
  for(const category of ['totalByCause', 'byAircraftRole']) {
    if(category==='totalByCause') {
      assert.equal(own.totalByCause.all,own.totalByCause.enemyAircraft+own.totalByCause.antiAircraftFire+own.totalByCause.otherCauses);
    } else {
      assert.equal(Object.values(own.byAircraftRole).reduce((n,r)=>n+r.all,0),own.totalByCause.all);
      for(const reason of ['enemyAircraft','antiAircraftFire','otherCauses'])
        assert.equal(Object.values(own.byAircraftRole).reduce((n,r)=>n+r[reason],0),own.totalByCause[reason]);
    }
  }
  for(const metric of ['all','enemyAircraft','antiAircraftFire','otherCauses'])
    assert.equal(sumFields(own.annualByCause,metric),own.totalByCause[metric]);
  assert.equal(sumFields(credited.annual,'all')+(theater==='MTO'?69:0),credited.grandTotal.all);
  assert.equal(sumFields(credited.annual,'inAir')+(theater==='MTO'?15:0),credited.grandTotal.inAir);
  assert.equal(sumFields(credited.annual,'onGround')+(theater==='MTO'?54:0),credited.grandTotal.onGround);
  for(const r of credited.annual) {
    assert.equal(r.all,r.heavyBombers+r.mediumLightBombers+r.fighters);
    assert.equal(r.all,r.inAir+r.onGround);
  }
}
assert.equal(usaafClaimsVsLosses.crossTheaterPublishedTotals.ownAircraftCombatMissionLossesETOplusMTO,18418);
assert.equal(usaafClaimsVsLosses.crossTheaterPublishedTotals.reportedEnemyAircraftDestroyedETOplusMTO,29916);

const rafAnnual = load('raf-all-commands-secondary-annual-sorties-and-aircraft-losses-1939-1945.json');
assert.equal(rafAnnual.sourcePrintedGrandTotal.sorties,2336303);
assert.equal(rafAnnual.sourcePrintedGrandTotal.aircraftLost,22220);
assert.equal(rafAnnual.commands.length,6);
assert.equal(rafAnnual.commands.reduce((n,c)=>n+c.reportedTotals.sorties,0),2336303);
assert.equal(rafAnnual.commands.reduce((n,c)=>n+c.reportedTotals.aircraftLost,0),22220);
for(const command of rafAnnual.commands) {
  if(!command.annual.length) continue;
  assert.equal(command.annual.reduce((n,r)=>n+r.sorties,0),command.reportedTotals.sorties);
  const printedAnnualLosses=command.annual.reduce((n,r)=>n+r.aircraftLost,0);
  if(command.name==='RAF Coastal Command') {
    assert.equal(printedAnnualLosses,1539);
    assert.equal(command.reportedTotals.aircraftLost-printedAnnualLosses,40);
  } else assert.equal(printedAnnualLosses,command.reportedTotals.aircraftLost);
}
assert.equal(rafAnnual.sourceAnnualArithmeticExceptions.length,2);

const balkans = load('balkan-greek-finnish-yugoslav-bulgarian-air-forces-unit-research-1940-1945.json');
assert.equal(balkans.forces.length,4);
const greek=balkans.forces[0].observations[0];
assert.equal(greek.fighter.types.reduce((n,r)=>n+r.count,0),greek.fighter.total);
assert.equal(greek.bomber.types.reduce((n,r)=>n+r.count,0),greek.bomber.total);
assert.equal(greek.fighter.total+greek.bomber.total,greek.aircraftTotal);
const yugoslav=balkans.forces.find(f=>f.force.startsWith('Yugoslav Partisan'));
assert.equal(yugoslav.observations.find(r=>r.unit?.startsWith('351 RAF')).combatAircraftSorties,978);
assert.equal(yugoslav.observations.find(r=>r.unit?.startsWith('352 RAF')).combatAircraftSortiesApproximate,1208);
assert.deepEqual(yugoslav.datedOrdersOfBattle.map(d=>d.records.length),[9,9]);

const canadianClaims=load('rcaf-association-derived-annual-squadron-claims-entry-counts-1939-1945.json');
assert.equal(canadianClaims.quality.all_dated_rows,4238);
assert.equal(canadianClaims.quality.wartime_dated_claim_entry_rows,4211);
assert.equal(canadianClaims.quality.outside_european_cutoff_or_wwii,27);
assert.equal(canadianClaims.annualObservedClaimEntryRows.reduce((n,r)=>n+r.entries,0),4211);
assert.equal(canadianClaims.quality.uniqueSquadronDesignationsWithResolvedEntries,131);
const countResolved=canadianClaims.squadronAnnualObservedClaimEntryRows
  .reduce((n,u)=>n+Object.values(u.entriesByYear).reduce((a,b)=>a+b,0),0);
assert.equal(countResolved+canadianClaims.quality.unresolved_squadron,4211);
assert.ok(canadianClaims.importantCautions.some(c=>c.includes('NOT an Atlas-ready European total')));

const italianGeneralStaff=load('regia-aeronautica-1940-1942-original-general-staff-strength-losses-personnel.json');
assert.equal(italianGeneralStaff.reportedFrontLineAircraftSnapshots.length,4);
assert.deepEqual(italianGeneralStaff.reportedFrontLineAircraftSnapshots.map(r=>r.frontlineFightersCombatReadyAsWording),[632,719,880,901]);
assert.deepEqual(italianGeneralStaff.reportedFrontLineAircraftSnapshots.map(r=>r.bombersAvailable),[759,423,422,398]);
const italianAircraftLosses=italianGeneralStaff.ownAircraftLossesThrough1942August21;
assert.equal(italianAircraftLosses.combatLossesAsLabelled+
  italianAircraftLosses.destroyedOnGroundOrIrreparableOrMissingUnknownCause+
  italianAircraftLosses.flightAccidentWriteoffs,italianAircraftLosses.reportedTotalWriteoffsByCause);
assert.equal(italianAircraftLosses.reportedTotalWriteoffsByCause,3395);
const italianPeople=italianGeneralStaff.cumulativePilotAndFlyingTechnicianCasualtyCategoriesToSeptember1942;
assert.equal(italianPeople.pilotOfficersKilledMissingOrPrisonerCombined+
  italianPeople.pilotNcosKilledMissingOrPrisonerCombined,italianPeople.allPilotsKilledMissingOrPrisonerCombined);
assert.equal(italianPeople.allPilotsKilledMissingOrPrisonerCombined+
  italianPeople.flyingTechniciansKilledMissingOrPrisonerCombined,
  italianPeople.combinedFlyingPeopleReportedMissingKilledOrCaptured);

const commonwealth=load('commonwealth-raaf-rnzaf-saaf-europe-unit-and-national-statistics-1939-1945.json');
assert.equal(commonwealth.forces.length,3);
const raaf=commonwealth.forces[0];
assert.equal(raaf.observations[0].sortiesOfSquadronsBasedInUKAtWarEndCumulative,65341);
assert.equal(raaf.observations[2].peopleDied,5397);
const nz=commonwealth.forces[1];
assert.equal(nz.personnelObservations[0].europeanRNZAFAndRAFAttachedPersonnelDied+
  nz.personnelObservations[0].pacificDied,nz.personnelObservations[0].totalRNZAFDiedOnActiveService);
assert.deepEqual(nz.rafHostedNationalSquadronLifetimeRecords.map(r=>r.combatSorties),[8150,10717,11019,3112,2899,2380,463]);
assert.equal(nz.rafHostedNationalSquadronLifetimeRecords.at(-1).includeInEuropeanOperationsTotals,false);
const saaf=commonwealth.forces[2];
assert.equal(saaf.observations[0].aircraftSorties,181);
assert.equal(saaf.observations[0].ownAircraftLost,11);
assert.equal(saaf.observations[0].crewKilled,38);

const fifteenth=load('usaaf-fifteenth-air-force-four-fighter-groups-missions-claims-escort-losses-1944-1945.json');
assert.equal(fifteenth.units.length,4);
assert.deepEqual(fifteenth.units.map(r=>r.groupMissionsFlown),[379,349,359,312]);
assert.deepEqual(fifteenth.units.map(r=>r.bomberEscortGroupMissionsFlown),[184,193,192,179]);
assert.deepEqual(fifteenth.units.map(r=>r.bomberLossObservationsDuringThisGroupsEscorts),[49,88,68,27]);
assert.equal(fifteenth.units[1].escortGroupMissionsEncounteringEnemyAircraft,66);
assert.equal(fifteenth.units[1].sourceProseEncounteredEnemyAircraftGroupMissionsAlternative,55);
assert.ok(fifteenth.globalCautions.some(c=>c.includes('NOT mutually exclusive')));

const belgium1940=load('belgian-air-force-squadron-order-of-battle-aircraft-and-conflicting-bases-1940-05-10.json');
assert.equal(belgium1940.records.length,16);
assert.equal(belgium1940.records.reduce((n,r)=>n+r.aircraft,0),182);
for(const regiment of [1,2,3]){
  const sourceRows=belgium1940.records.filter(r=>r.regiment===regiment);
  assert.equal(sourceRows.length,belgium1940.derivedSourceCounts[`regiment${regiment}`].squadrons);
  assert.equal(sourceRows.reduce((n,r)=>n+r.aircraft,0),belgium1940.derivedSourceCounts[`regiment${regiment}`].aircraft);
}
assert.equal(belgium1940.records.filter(r=>r.alternativeAircraft!==undefined).length,5);
assert.ok(belgium1940.records.every(r=>r.basePrintedCGSC && r.alternativeReportedWartimeBase));

const rafNational=load('polish-czechoslovak-raf-hosted-air-forces-squadrons-personnel-claims-1940-1945.json');
assert.equal(rafNational.polishRAFHosted.museumObservations.polishDesignatedSquadronsAtWarEnd,15);
assert.equal(rafNational.polishRAFHosted.polishInstituteAlternateObservations.polishFighterCombatMissionsAsLabelled,73524);
assert.equal(rafNational.polishRAFHosted.museumVsInstituteCreditedDestroyedDifference,15);
const czech=rafNational.czechoslovakRAFHosted;
assert.equal(czech.units.length,5);
assert.equal(czech.units.reduce((n,r)=>n+(r.combatSorties??r.combatSortiesAsMuseumAndCzechMOD??r.czechoslovakMembersCombatSorties),0),40488);
assert.equal(czech.units.find(r=>r.unit.startsWith('312 ')).alternateCombatSortiesFromRajlichSecondary,17427);
assert.equal(czech.units.find(r=>r.unit.startsWith('312 ')).creditedEnemyAircraftDamagedEnglishMuseumTranslation,1);
assert.equal(czech.units.find(r=>r.unit.startsWith('312 ')).creditedEnemyAircraftDamagedCzechOriginalAndCzechMOD,16);
assert.ok(czech.units.find(r=>r.unit.startsWith('68 ')).warning.includes('Czech participation'));

const luftwaffeOriginal=load('luftwaffe-ahb-original-strength-serviceability-dated-snapshots-1938-1945.json');
assert.equal(luftwaffeOriginal.rows.length,50);
assert.deepEqual(luftwaffeOriginal.rows[0].slice(0,3),['1938-08-01',2928,1669]);
assert.deepEqual(luftwaffeOriginal.rows.at(-1).slice(0,5),['1945-04-13',null,null,5072,3842]);
assert.equal(new Set(luftwaffeOriginal.rows.map(r=>r[0])).size,50);
for (const [date,total,serviceable,exTransport,exTransportServiceable,transport,transportServiceable] of luftwaffeOriginal.rows){
  assert.ok(exTransport >= exTransportServiceable, date);
  if (total === null){assert.equal(serviceable,null);assert.equal(transport,null);continue;}
  assert.equal(total,exTransport+transport,`${date} whole aircraft total`);
  assert.equal(serviceable,exTransportServiceable+transportServiceable,`${date} whole serviceability total`);
  assert.ok(total>=serviceable,`${date} whole aircraft serviceability <= on hand`);
}
const novemberOriginalError=luftwaffeOriginal.quality_flags.find(f=>f.date==='1944-11-20');
assert.equal(novemberOriginalError.reported_nontransport_on_hand-novemberOriginalError.role_level_calculated_nontransport_on_hand,900);
assert.equal(novemberOriginalError.reported_whole_force_on_hand-novemberOriginalError.role_level_calculated_whole_force_on_hand,900);

const eastGermanLosses=load('luftwaffe-ahb92-eastern-front-aircraft-destroyed-damaged-by-role-cause-1941-june-december.json');
assert.equal(eastGermanLosses.months.length,7);
assert.equal(eastGermanLosses.role_column_order.length,11);
const eastSum=(threshold,metric)=>eastGermanLosses.months.reduce((s,m)=>s+m[threshold][metric].reduce((a,b)=>a+b,0),0);
assert.equal(eastSum('destroyed','due_to_enemy_action'),1631);
assert.equal(eastSum('destroyed','on_operations_but_not_due_to_enemy_action'),571);
assert.equal(eastSum('damaged','due_to_enemy_action'),756);
const eastLossTableIssues=[];
for(const month of eastGermanLosses.months){
  for(const [threshold,observations] of Object.entries({destroyed:month.destroyed,damaged:month.damaged})){
    for(const values of Object.values(observations)) assert.equal(values.length,11);
    for(let i=0;i<11;i++){
      const difference=observations.printed_total_on_operations[i]-observations.due_to_enemy_action[i]-observations.on_operations_but_not_due_to_enemy_action[i];
      if(difference) eastLossTableIssues.push({month:month.period_start,threshold,role:eastGermanLosses.role_column_order[i],difference});
    }
  }
}
assert.deepEqual(eastLossTableIssues,[{month:'1941-07-01',threshold:'destroyed',role:'close_reconnaissance',difference:10}]);
assert.equal(eastLossTableIssues[0].difference,eastGermanLosses.arithmetic_issues[0].printed_minus_sum);

const coastalOriginalCasualties=load('raf-coastal-command-aircrew-groundcrew-casualties-original-air15-162-1939-1945.json');
assert.equal(coastalOriginalCasualties.rows.length,8);
for(const metric of ['killed','missing','missing_later_reported_safe','prisoner_of_war','pow_later_reported_safe','wounded']){
  assert.equal(coastalOriginalCasualties.rows.reduce((n,r)=>n+r[metric],0),coastalOriginalCasualties.printed_totals[metric]);
}
for(const personnel of ['aircrew','groundcrew']){
  assert.equal(coastalOriginalCasualties.rows.filter(r=>r.personnel===personnel).reduce((n,r)=>n+r.killed,0),coastalOriginalCasualties.printed_totals[`killed_${personnel}`]);
}
const fleetAirArm=load('royal-navy-fleet-air-arm-1939-1945-strength-and-original-record-leads.json');
assert.equal(fleetAirArm.strength_endpoints.length,2);
assert.deepEqual(fleetAirArm.strength_endpoints.map(r=>r.aircraft??r.frontline_aircraft_available_for_operations),[232,1336]);
assert.deepEqual(fleetAirArm.strength_endpoints.map(r=>r.pilots??r.pilots_available_for_operations),[406,3243]);

const thor = load('thor-usaf-original-ww2-eto-mto-record-and-map-coverage-audit.json');
assert.equal(thor.allOriginalRecords, 178742);
assert.equal(thor.globalSourceCountsByTheater.ETO, 95827);
assert.equal(thor.globalSourceCountsByTheater.MTO, 30870);
assert.equal(thor.invalidDatesByTheater.ETO, 36);
assert.equal(thor.invalidDatesByTheater.MTO, 338);
assert.equal(thor.selectedRecordFieldCounts.ETO_MTO_1936_to_1945_05_09_records, 126322);
assert.equal(thor.selectedETO_MTORecordsByYearAndTheater.reduce((n, r) => n + r.records, 0), 126322);
assert.equal(thor.selectedRecordsByFlyingForce.reduce((n, r) => n + r.records, 0), 126322);
assert.equal(thor.selectedTargetCountriesByTheater.reduce((n, r) => n + r.records, 0), 126322);
assert.equal(thor.selectedRecordFieldCounts.ETO_MTO_validTargetLatLon_records, 120271);
assert.equal(thor.targetLocationCandidates.length, 4903);
assert.equal(thor.takeoffBaseCandidates.length, 66);
assert.equal(thor.takeoffBaseCandidates.reduce((n, r) => n + r.sourceRecordCountNotSorties, 0), 1853);
assert.equal(thor.targetLocationCandidates.reduce((n, r) => n + r.sourceRecordCountNotSorties, 0), 120271);
assert.equal(thor.sortieDupeFlags.unmarked + thor.sortieDupeFlags['1'], 126322);
assert.ok(thor.takeoffBaseCandidates.every(r => r.status === 'research_candidate_needs_station_identity_and_date_validation'));
assert.ok(thor.criticalSemantics.some(s => s.includes('not necessarily a unique sortie')));
const maurerCoords = load('usaaf-maurer-ourairports-conservative-station-geocoding-candidates-1940-1945.json');
assert.equal(maurerCoords.counts.OurAirportsRawWorldRows, 86311);
assert.equal(maurerCoords.counts.MaurerCandidateSourceStationOccurrences, 544);
assert.equal(maurerCoords.counts.MaurerUniqueNormalizedPlaceAndRegionKeys, 356);
assert.equal(maurerCoords.provisionalCandidates.length, 90);
assert.equal(maurerCoords.ambiguousNamesOrCoordinates.length, 1);
assert.equal(maurerCoords.unmatchedHistoricSiteNames.length, 265);
assert.equal(maurerCoords.provisionalCandidates.length + maurerCoords.ambiguousNamesOrCoordinates.length + maurerCoords.unmatchedHistoricSiteNames.length, 356);
assert.equal(maurerCoords.ambiguousNamesOrCoordinates[0].stationNameAsPrinted[0], 'Chilbolton');
assert.ok(maurerCoords.provisionalCandidates.every(r => r.status.includes('NOT_VERIFIED')));

const rceNL = JSON.parse(fs.readFileSync(path.join(__dirname, '../research/transcriptions/nl-rce-historic-airfield-footprint-phases-1936-1945.geojson'), 'utf8'));
assert.equal(rceNL.type, 'FeatureCollection');
assert.equal(rceNL.source.rawFeaturesAllEras, 191);
assert.equal(rceNL.features.length, 101);
assert.equal(rceNL.audit.historicalFootprintPhases, 101);
assert.equal(rceNL.audit.distinctNamesAsPublished, 64);
assert.deepEqual(rceNL.audit.geometryTypes, { MultiPolygon: 12, Polygon: 89 });
assert.equal(rceNL.audit.nimhIndependentWartimeAirfieldList.listedSites, 33);
assert.equal(rceNL.audit.nimhIndependentWartimeAirfieldList.exactOrExplicitAliasNameMatches.length, 33);
assert.deepEqual(rceNL.audit.nimhIndependentWartimeAirfieldList.unmatchedListNames, []);
for (const phase of rceNL.features) {
  assert.ok(phase.properties.activeYearFromAsPublished <= 1945);
  assert.ok(phase.properties.activeYearThroughAsPublished >= 1936);
  assert.ok(phase.properties.activeYearFromAsPublished <= phase.properties.activeYearThroughAsPublished);
  assert.equal(phase.properties.mapStatus, 'historical_footprint_phase_unvalidated_for_exact_dates_and_units');
  const [lon, lat] = phase.properties.approximateBoundingBoxCenterLonLat;
  assert.ok(lon >= 3 && lon <= 8);
  assert.ok(lat >= 50 && lat <= 54);
  assert.ok(['Polygon', 'MultiPolygon'].includes(phase.geometry.type));
}

const germanUnitMonthLead = load('luftwaffe-secondary-unit-months-source-coverage-audit-1938-1945.json');
assert.equal(germanUnitMonthLead.counts.allLocationRows, 13456);
assert.equal(germanUnitMonthLead.counts.allModelStrengthLossRows, 33028);
assert.equal(germanUnitMonthLead.counts.distinctLocationUnitMonthKeys, 13187);
assert.equal(germanUnitMonthLead.counts.distinctStrengthUnitMonthKeys, 12246);
assert.equal(germanUnitMonthLead.counts.strengthUnitMonthKeysFoundInLocationKeys, 5968);
assert.equal(germanUnitMonthLead.counts.strengthRowsWithAtLeastOneMatchingLocationKey, 16957);
assert.equal(Object.values(germanUnitMonthLead.locationRowsByYear).reduce((n, count) => n + count, 0), 13456);
assert.equal(Object.values(germanUnitMonthLead.modelStrengthLossRowsByYear).reduce((n, count) => n + count, 0), 33028);
assert.equal(germanUnitMonthLead.rights.includes('NOT published'), true);

const britishBCodes = load('usaaf-official-1988-british-b-code-continental-airfield-index-1945.json');
assert.equal(britishBCodes.records.length, 174);
assert.equal(britishBCodes.audit.uniqueCodes, 174);
assert.equal(britishBCodes.audit.unmatchedCodes.length, 0);
assert.equal(britishBCodes.audit.duplicateCodes.length, 0);
assert.equal(britishBCodes.audit.statuses.historical_code_site_candidate, 127);
assert.equal(britishBCodes.audit.statuses.unassigned, 40);
assert.equal(britishBCodes.audit.statuses.renumbered_not_a_distinct_b_airfield, 5);
assert.equal(britishBCodes.audit.statuses.construction_cancelled, 2);
assert.equal(britishBCodes.audit.countriesForNamedCandidateRows.Netherlands, 15);
assert.equal(britishBCodes.records.find(r => r.code === 'B-121').status, 'unassigned');
assert.equal(britishBCodes.records.find(r => r.code === 'B-149').status, 'unassigned');
const bCodeNL = load('usaaf-british-1945-b-codes-to-rce-dutch-airfield-historical-phases-crosswalk.json');
assert.equal(bCodeNL.count, 15);
assert.equal(bCodeNL.records.length, 15);
assert.equal(bCodeNL.records.find(r => r.britishAirfieldCode === 'B-79').candidateRceHistoricSiteName, 'Woensdrecht');
assert.equal(bCodeNL.records.find(r => r.britishAirfieldCode === 'B-82').candidateRceHistoricSiteName, 'Keent / Grave');
assert.equal(bCodeNL.records.find(r => r.britishAirfieldCode === 'B-91').candidateRceHistoricSiteName, "Malden / 'De Kluis'");
assert.ok(bCodeNL.records.every(r => r.rceHistoricalPhaseIds.length > 0));
const validRceIDs = new Set(rceNL.features.map(r => r.id));
assert.ok(bCodeNL.records.every(r => r.rceHistoricalPhaseIds.every(id => validRceIDs.has(id))));

console.log('Grand Air War research transcription integrity checks passed (THOR, German unit-month source audit, RCE Dutch polygons, official British B-code index, and Dutch historical-name crosswalk).');
