#!/usr/bin/env node
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const data = require("../research/transcriptions/operations-january-june-1944.json");

assert.equal(data.schema, 1);
assert.deepEqual(data.period, ["1944-01-01", "1944-07-31"]);
const ids = new Set();
const byId = new Map();
let previous = data.period[0];
function validDate(day, last = data.period[1]) {
  assert.match(day, /^1944-0[1-7]-\d{2}$/);
  assert.equal(new Date(day + "T00:00:00Z").toISOString().slice(0, 10), day);
  assert.ok(day >= data.period[0] && day <= last);
}
for (const record of data.records) {
  assert.ok(!ids.has(record.id), "Duplicate record " + record.id);
  ids.add(record.id);
  byId.set(record.id, record);
  validDate(record.date);
  if (record.endDate) {
    validDate(record.endDate);
    assert.ok(record.endDate > record.date, "End date must follow start " + record.id);
    assert.equal(Date.parse(record.endDate) - Date.parse(record.date), 86400000, record.id);
  }
  assert.ok(record.date >= previous);
  previous = record.date;
  assert.ok(data.forces[record.force] && data.kinds[record.kind]);
  assert.ok(data.sources[record.source] && record.locator && record.name);
  for (const [key, count] of Object.entries(record.metrics)) {
    const validCount = key === "shortTons" ? Number.isFinite(count) : Number.isInteger(count);
    assert.ok(data.metrics[key] && validCount && count >= 0, record.id + " invalid " + key);
  }
  for (const [key, mark] of Object.entries(record.qualifiers || {})) {
    assert.ok(Object.hasOwn(record.metrics, key) && ["≈", "≥", ">"].includes(mark));
  }
  assert.ok(!(record.metrics.attacked > record.metrics.dispatched), record.id);
  assert.ok(!(record.metrics.missing > record.metrics.dispatched), record.id);
  for (const ref of record.references || []) assert.ok(data.sources[ref.source] && ref.locator);
  if (record.sourcePage) assert.ok(Number.isInteger(record.sourcePage) && record.sourcePage > 1);
  for (const key of record.derivedMetrics || []) assert.ok(Object.hasOwn(record.metrics, key));
}
for (const [id, source] of Object.entries(data.sources)) {
  assert.equal(new URL(source.url).protocol, "https:", id);
  assert.ok(source.title && source.type);
}
for (const edge of data.links) {
  assert.equal(edge.records.length, 2);
  assert.notEqual(edge.records[0], edge.records[1]);
  assert.ok(edge.records.every(id => ids.has(id)) && data.sources[edge.source] && edge.locator);
}
for (const force of ["us8", "us15", "rafbc", "reich", "west"]) {
  assert.equal(data.reconciliation.filter(row => row.force === force && row.month < "1944-07").length, 6);
}
for (const row of data.reconciliation) {
  assert.ok(data.forces[row.force] && data.sources[row.source] && row.locator);
  assert.ok(row.captured == null || Number.isInteger(row.captured));
  assert.ok(row.published == null || Number.isInteger(row.published));
}
assert.deepEqual(byId.get("us8-1944-02-20-226").metrics.dispatched, 1003);
assert.equal(byId.get("us8-1944-02-20-226").metrics.attacked, 880);
assert.equal(byId.get("us8-1944-02-24-233").metrics.lost, 49);
assert.ok(!byId.has("us8-1944-02-24-237") && byId.has("us8-1944-02-28-237"));
assert.deepEqual(byId.get("raf-5-28419").metrics, {dispatched: 823, attacked: 650, missing: 78});
assert.equal(byId.get("raf-6-17567").date, "1944-04-01");
assert.equal(byId.get("raf-6-19922").date, "1944-06-01");
assert.equal(byId.get("us8-1944-06-06-394-a").metrics.attacked, 1077);
assert.equal(byId.get("zg26-1944-02-24").metrics.sorties, 4);

const reichBigWeek = data.records.filter(r => r.force === "reich" && r.kind === "loss-return" &&
  r.date >= "1944-02-20" && r.date <= "1944-02-25");
assert.equal(reichBigWeek.length, 6);
assert.equal(reichBigWeek.reduce((sum, r) => sum + r.metrics.enemyDestroyed, 0), 260);
assert.equal(reichBigWeek.reduce((sum, r) => sum + r.metrics.enemyDamaged, 0), 71);
const juneKeys = ["enemyDestroyed", "enemyDamaged", "opsDestroyed", "opsDamaged", "nonOpsDestroyed", "nonOpsDamaged", "enemyMissing"];
const juneValues = {
  west: {daily: [818, 220, 113, 219, 67, 160, 313], printed: [818, 220, 113, 219, 67, 160, 313], types: 99},
  reich: {daily: [208, 88, 44, 44, 183, 415, 18], printed: [208, 90, 42, 44, 183, 405, 18], types: 90}
};
for (const [force, expected] of Object.entries(juneValues)) {
  const returns = data.records.filter(row => row.force === force && row.source === force + "Jun");
  const daily = returns.filter(row => row.kind === "loss-return");
  const types = returns.filter(row => row.kind === "loss-type");
  const summary = data.reconciliation.find(row => row.force === force && row.month === "1944-06");
  assert.deepEqual(daily.map(row => Number(row.date.slice(-2))), Array.from({length: 30}, (_, i) => i + 1));
  assert.equal(types.length, expected.types);
  assert.deepEqual(juneKeys.map(key => daily.reduce((sum, row) => sum + row.metrics[key], 0)), expected.daily);
  assert.deepEqual(juneKeys.map(key => summary.capturedByCause[key]), expected.daily);
  assert.deepEqual(juneKeys.map(key => summary.publishedByCause[key]), expected.printed);
  for (const day of daily) {
    const subsets = types.filter(row => row.date === day.date);
    for (const key of juneKeys) assert.ok(subsets.reduce((sum, row) => sum + row.metrics[key], 0) <= day.metrics[key], day.id + " " + key);
    assert.ok(day.metrics.enemyMissing <= day.metrics.enemyDestroyed, day.id);
  }
}
assert.deepEqual(byId.get("west-1944-06-02-ahb").derivedMetrics, ["nonOpsDamaged"]);
assert.equal(byId.get("west-1944-06-02-ahb").metrics.nonOpsDamaged, 7);
assert.equal(byId.get("west-1944-06-06-ahb").metrics.airCombatDestroyed, 14);
assert.equal(byId.get("west-1944-06-27-ahb-s109").metrics.airCombatDestroyed, 17);
assert.ok(data.links.some(link => link.label === "Possible night-fighter attribution" &&
  link.records.includes("rafbc-1944-06-12-hk545")));

const july = data.records.filter(row => row.source === "westJuly" && row.kind === "loss-return");
const julySummary = data.reconciliation.find(row => row.force === "west" && row.month === "1944-07");
assert.deepEqual(july.map(row => Number(row.date.slice(-2))), Array.from({length: 31}, (_, i) => i + 1));
assert.equal(julySummary.sourcePage, 28);
assert.equal(julySummary.totalDays, 31);
assert.equal(julySummary.captured, 602);
assert.equal(julySummary.published, 602);
for (const [key, published] of Object.entries(julySummary.publishedByCause)) {
  const covered = july.filter(row => Object.hasOwn(row.metrics, key));
  const sum = covered.reduce((total, row) => total + row.metrics[key], 0);
  assert.equal(sum, julySummary.capturedByCause[key], key);
  assert.equal(covered.length, julySummary.capturedDaysByCause[key], key);
  assert.equal(covered.length, 31, key);
  assert.equal(sum - published, {airCombatDestroyed: 1, airCombatDamaged: -1}[key] ?? 0, key);
}
for (const [force, page, published] of [["west", 15, 228], ["reich", 22, 556]]) {
  const may = data.reconciliation.find(row => row.force === force && row.month === "1944-05");
  assert.equal(may.sourcePage, page);
  assert.equal(may.captured, null);
  assert.equal(may.published, published);
}
for (const row of july) {
  const {enemyDestroyed, enemyMissing, airCombatDestroyed} = row.metrics;
  assert.ok(row.sourcePage >= 2 && row.sourcePage <= 28);
  assert.ok((enemyMissing ?? 0) + (airCombatDestroyed ?? 0) <= enemyDestroyed, row.id);
  const subsets = data.records.filter(other => other.kind === "loss-type" &&
    other.source === row.source && other.date === row.date);
  for (const key of Object.keys(row.metrics)) {
    assert.ok(subsets.reduce((sum, subset) => sum + (subset.metrics[key] ?? 0), 0) <= row.metrics[key], row.id + " " + key);
  }
}
assert.deepEqual(byId.get("west-1944-07-10-ahb").derivedMetrics, ["opsDamaged"]);
assert.equal(byId.get("west-1944-07-10-ahb").metrics.opsDamaged, 7);
assert.equal(byId.get("west-1944-07-24-ahb").metrics.enemyDestroyed, 29);
assert.equal(byId.get("west-1944-07-24-ahb").metrics.airCombatDestroyed, 7);
assert.equal(byId.get("west-1944-07-24-ahb-s109").metrics.airCombatDestroyed, 7);
assert.equal(byId.get("west-1944-07-25-ahb").metrics.airCombatDestroyed, 22);
assert.equal(byId.get("raf2taf-1944-07-17-night").endDate, "1944-07-18");
assert.deepEqual(byId.get("raf2taf-1944-07-17-night").metrics, {assigned: 50});
assert.equal(byId.get("us9-416bg-104").metrics.dispatched, 37);
assert.equal(byId.get("us9-416bg-105").metrics.dispatched, 36);
assert.equal(byId.get("us9-416bg-106").metrics.attacked, 0);
assert.deepEqual(byId.get("us9-1944-07-25-cobra-medium").qualifiers, {attacked: ">"});
assert.equal(byId.get("us9-1944-07-25-cobra-fighter-bombers").metrics.lost, 0);
assert.deepEqual(byId.get("us9-1944-07-25-406fg-lisieux").metrics, {claimed: 4, missing: 1});
assert.equal(byId.get("us9-1944-07-25-cobra-ninth-study").metrics.lost, 1);

const targetFile = path.join(__dirname, "../research/transcriptions/davis-western-targets-may-july-1944.csv");
const targetLines = fs.readFileSync(targetFile, "utf8").trimEnd().split("\n");
const targetRows = targetLines.slice(1).map(line => [...line.matchAll(/"((?:[^"]|"")*)"(?:,|$)/g)]
  .map(match => match[1].replaceAll('""', '"')));
assert.equal(targetRows.length, 635);
assert.equal(new Set(targetRows.map(row => row[0] + "/" + row[1])).size, targetRows.length);
const mayTargets = targetRows.filter(row => row[5].startsWith("1944-05"));
assert.equal(mayTargets.length, 254);
assert.equal(mayTargets.filter(row => row[2] === "Ge").length, 132);
assert.equal(mayTargets.filter(row => row[2] === "NL").length, 6);
assert.equal(targetRows.filter(row => row[5].startsWith("1944-07")).length, 381);
const targetGroups = new Map();
for (const row of targetRows) {
  assert.equal(row.length, 16);
  assert.ok(row[3] === "8" && Number(row[8]) >= Number(row[9]) && Number(row[13]) > 0);
  const key = row[5] + "/" + row[14];
  if (!targetGroups.has(key)) targetGroups.set(key, []);
  targetGroups.get(key).push(row);
}
assert.equal(targetGroups.size, data.records.filter(row => row.kind === "target-summary").length);
for (const [key, rows] of targetGroups) {
  const [date, mission] = key.split("/");
  const record = byId.get("us8-" + date + "-davis-" + mission);
  const sum = column => rows.reduce((total, row) => total + Number(row[column]), 0);
  assert.deepEqual(record.metrics, {
    targetAttacks: sum(8), targetLosses: sum(9), shortTons: Math.round(sum(13) * 10) / 10
  });
}
assert.deepEqual(byId.get("us8-1944-05-12-davis-353").metrics, {
  targetAttacks: 660, targetLosses: 37, shortTons: 1407.4
});
assert.equal(byId.get("us8-1944-07-25-davis-494").metrics.targetAttacks, 1495);
console.log("PASS January–July 1944 ledger: " + data.records.length +
  " dated records, 635 workbook targets, overnight dates, mission scopes and monthly returns.");
