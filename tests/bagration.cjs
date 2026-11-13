"use strict";

const assert = require("node:assert/strict");
const { sources, units, cases, observations, balances, stations } = require("../research/transcriptions/bagration-air-campaign-1944.json");
const fs = require("node:fs");
const unitIds = new Set(units.map(row => row.id));
const byCase = new Map(cases.map(row => [row.id, row]));
const obs = Object.fromEntries(observations.map(row => [row.id, row]));
assert.equal(byCase.size, 15);
assert.equal(unitIds.size, units.length);
assert.equal(Object.keys(obs).length, observations.length);
assert.ok(cases.every((row, i) => i === 0 || row.start >= cases[i - 1].start));
for (const source of Object.values(sources)) {
  assert.equal(new URL(source.url).protocol, "https:");
  assert.ok(source.title && source.type);
}
for (const row of [...units, ...cases, ...observations, ...balances, ...stations]) {
  assert.ok(sources[row.source] && row.locator, row.id);
  assert.ok((row.related || []).every(id => sources[id]), row.id);
  if (row.case) {
    const operation = byCase.get(row.case);
    assert.ok(operation, row.id);
    if (row.unit) assert.ok(operation.units.includes(row.unit), row.id || row.place);
  }
}
for (const row of cases) {
  assert.ok(row.lat > 50 && row.lat < 57 && row.lng > 21 && row.lng < 32, row.id);
  assert.ok(row.start <= row.end && row.units.every(id => unitIds.has(id)));
}
for (const row of observations) {
  assert.ok(row.date <= row.end);
  assert.ok(row.value === null || Number.isInteger(row.value) && row.value >= 0);
  assert.ok(row.measure && row.note && row.kind);
}
for (const row of balances) {
  const incoming = row.newBuild + row.repair + row.transferIn;
  const outgoing = row.enemy + row.nonEnemy + row.overhaul + row.transferOut;
  assert.equal(row.open + incoming - outgoing, row.close, row.id);
}
assert.equal(obs["bob-26-claim"].kind, "Claims");
assert.equal(obs["bob-26-loss"].value, 19);
assert.equal(obs["pocket-own"].value, 0);
assert.equal(obs["mogilev-missing"].value, null);
assert.equal(obs["brest-german-observed"].measure, "passages");
assert.equal(obs["aug-all-loss"].value, 822);
assert.equal(obs["german-opening"].kind, "Readiness");
assert.equal(obs["german-combat-775"].kind, "Inventory");
assert.equal(obs["minsk-loss"].value, 119);
assert.equal(obs["minsk-loss-sum"].value, 179);
assert.equal([0, 1, 2].reduce((sum, i) => sum + obs["minsk-loss-component-" + i].value, 0), 179);
assert.equal([0, 1, 2].reduce((sum, i) => sum + obs["pocket-part-" + i].value, 0), obs["pocket-total"].value);
assert.equal(balances.filter(row => row.case === "bobruisk").reduce((sum, row) => sum + row.enemy, 0), obs["bob-june-ceiling"].value);
assert.match(fs.readFileSync(require.resolve("../bagration.html"), "utf8"), /bagration-air-campaign-1944\.json/);
console.log("PASS Bagration: 15 dated cases, scoped observations, formation links and 10 reconciled movement returns.");
