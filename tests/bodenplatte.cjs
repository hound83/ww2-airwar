"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const ledger = require("../research/transcriptions/bodenplatte-1945-01-01.json");
const { date, fields, sources, observations } = ledger;
const get = id => observations.find(row => row.id === id);
const fieldIds = ["eindhoven", "asch", "evere", "melsbroek", "metz"];

assert.equal(date, "1945-01-01");
assert.deepEqual(fields.map(field => field.id), fieldIds);
assert.equal(new Set(observations.map(row => row.id)).size, observations.length);
for (const field of fields) {
  assert.ok(field.lat > 48 && field.lat < 52 && field.lng > 4 && field.lng < 7);
  assert.ok(field.allied && field.german && field.gap);
  assert.ok(field.sources.every(id => sources[id]));
  assert.deepEqual([...new Set(observations.filter(row => row.place === field.id).map(row => row.side))].sort(),
    ["Allied", "German"]);
}
for (const row of observations) {
  assert.ok([...fieldIds, "operation"].includes(row.place), row.id);
  assert.ok(row.population && row.setting && row.locator && row.note && row.quality, row.id);
  assert.equal(new URL(sources[row.source].url).protocol, "https:", row.id);
  if (row.quality === "unquantified") assert.equal(row.value, null);
  else assert.ok([row.value].flat().every(value => Number.isInteger(value) && value >= 0), row.id);
  if (Array.isArray(row.value)) assert.ok(row.value.length === 2 && row.value[0] < row.value[1]);
  if (row.quality === "claim") assert.equal(row.metric, "Claimed destroyed");
}
assert.equal(get("eindhoven-air").value + get("eindhoven-ground").value, get("eindhoven-takeoff").value);
assert.equal(get("asch-487th-lost").value, 0);
assert.equal(get("metz-368-loss").value, null);
assert.equal(get("metz-jg53-loss").setting, "Metz sector");
assert.equal(get("evere-grimbergen-ff").setting, "Grimbergen route");
assert.equal(get("melsbroek-jg27-lost").value + get("melsbroek-jg54-lost").value, 20);
assert.equal(get("melsbroek-combined-lost").value, 21);
assert.equal(get("operation-recon-ground-loss").value + get("operation-recon-air-loss").value, 305);
assert.equal(get("operation-recon-ground-damage").value + get("operation-recon-air-damage").value, 190);
assert.equal(get("operation-mp-allied-conflict-destroyed").setting, "Air coverage disputed");
assert.match(fs.readFileSync(require.resolve("../bodenplatte.html"), "utf8"), /bodenplatte-1945-01-01\.json/);
console.log("PASS Bodenplatte: " + fields.length + " bilateral airfield accounts and " + observations.length +
  " scoped observations, source locators, attribution boundaries and published discrepancies.");
