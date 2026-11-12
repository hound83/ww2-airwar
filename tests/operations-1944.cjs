#!/usr/bin/env node
"use strict";
const assert = require("node:assert/strict");
const data = require("../research/transcriptions/operations-january-june-1944.json");

assert.equal(data.schema, 1);
assert.deepEqual(data.period, ["1944-01-01", "1944-06-30"]);
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
    validDate(record.endDate, "1944-07-01");
    assert.ok(record.endDate > record.date, "End date must follow start " + record.id);
    assert.equal(Date.parse(record.endDate) - Date.parse(record.date), 86400000, record.id);
  }
  assert.ok(record.date >= previous);
  previous = record.date;
  assert.ok(data.forces[record.force] && data.kinds[record.kind]);
  assert.ok(data.sources[record.source] && record.locator && record.name);
  for (const [key, count] of Object.entries(record.metrics)) {
    assert.ok(data.metrics[key] && Number.isInteger(count) && count >= 0, record.id + " invalid " + key);
  }
  for (const [key, mark] of Object.entries(record.qualifiers || {})) {
    assert.ok(Object.hasOwn(record.metrics, key) && ["≈", "≥", ">"].includes(mark));
  }
  assert.ok(!(record.metrics.attacked > record.metrics.dispatched), record.id);
  assert.ok(!(record.metrics.missing > record.metrics.dispatched), record.id);
  for (const ref of record.references || []) assert.ok(data.sources[ref.source] && ref.locator);
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
  assert.equal(data.reconciliation.filter(row => row.force === force).length, 6);
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
console.log("PASS January–June 1944 ledger: " + data.records.length +
  " dated records, source references, overnight dates, Big Week, D-Day and monthly returns.");
