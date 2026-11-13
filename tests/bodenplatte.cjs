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
  for (const reference of row.relatedSources || []) {
    assert.ok(reference.locator && sources[reference.source], row.id);
  }
  if (row.quality === "unquantified") assert.equal(row.value, null);
  else assert.ok([row.value].flat().every(value => Number.isInteger(value) && value >= 0), row.id);
  if (Array.isArray(row.value)) assert.ok(row.value.length === 2 && row.value[0] < row.value[1]);
  if (row.quality === "claim") assert.equal(row.metric, "Claimed destroyed");
}
assert.equal(get("eindhoven-air").value + get("eindhoven-ground").value, get("eindhoven-takeoff").value);
assert.equal(get("asch-487th-lost").value, 0);
assert.equal(get("metz-368-loss").value, null);
assert.equal(get("metz-jg53-loss").setting, "Metz sector");
assert.equal(get("operation-typhoon-ff").serial, "EK497");
assert.equal(get("operation-typhoon-ff").place, "operation");
assert.equal(get("evere-grimbergen-ff").setting, "Grimbergen route");
assert.equal(get("melsbroek-jg27-lost").value + get("melsbroek-jg54-lost").value, 20);
assert.equal(get("melsbroek-combined-lost").value, 21);
assert.equal(get("operation-recon-ground-loss").value + get("operation-recon-air-loss").value, 305);
assert.equal(get("operation-recon-ground-damage").value + get("operation-recon-air-damage").value, 190);
assert.equal(get("operation-mp-allied-conflict-destroyed").setting, "Air coverage disputed");
assert.match(fs.readFileSync(require.resolve("../bodenplatte.html"), "utf8"), /bodenplatte-1945-01-01\.json/);
console.log("PASS Bodenplatte: " + fields.length + " bilateral airfield accounts and " + observations.length +
  " scoped observations, source locators, attribution boundaries and published discrepancies.");

const { compile, inputFiles } = require("../dist/bodenplatte-data.js");
const data = compile(Object.fromEntries(Object.entries(inputFiles).map(([key, name]) => {
  const content = fs.readFileSync(require.resolve("../research/transcriptions/" + name), "utf8");
  return [key, key === "units" ? content : JSON.parse(content)];
})));
assert.equal(data.fields.length, 20);
assert.equal(data.fields[0].id, "eindhoven");
assert.equal(data.timeline.length, 16);
assert.equal(data.formations.rows.length, 37);
assert.equal(data.airframes.length, 175);
assert.equal(new Set(data.airframes.map(row => row.serial)).size, 175);
assert.equal(data.records.filter(row => row.category === "defence").length, 11);
assert.equal(new Set(data.records.map(row => row.id)).size, data.records.length);
const validSites = new Set(data.fields.map(field => field.id));
for (const field of data.fields) {
  assert.ok(field.lat > 48 && field.lat < 52 && field.lng > 3 && field.lng < 7);
  assert.ok(field.positionSources[0].locator);
}
for (const row of [...data.records, ...data.airframes]) {
  assert.ok((row.places || [row.place]).every(site => site === "operation" || validSites.has(site)), row.id);
  assert.ok(row.sources[0].locator, row.id);
  assert.match(row.sources[0].url, /^https:\/\//, row.id);
}
const record = id => data.records.find(row => row.id === id);
assert.deepEqual(["a92-allied-destroyed", "a92-allied-damaged", "trond-destroyed", "trond-damaged"]
  .map(id => record(id).value), [10, 31, 6, 33]);
assert.equal(record("evere-grimbergen-ff").place, "grimbergen");
assert.equal(record("jg53-iii").place, "etain");
assert.equal(record("jg53-iii").value, 10);
assert.equal(record("op-german-estimate-d").category, "outcomes");
assert.equal(record("op-german-estimate-d").quality, "opponent estimate");
assert.equal(record("dec25-auster").date, "1944-12-25");
assert.deepEqual(record("defence-antwerp").value, [16, 14, 3]);
assert.equal(record("defence-antwerp").quality, "wave counts");
assert.match(data.airframes.find(row => row.serial === "NS746").metric, /initially AC; later CE/);
assert.deepEqual(data.formations.rows.find(row => row.formation === "III./JG 53").sites.map(site => site.id), ["etain"]);
console.log("PASS Bodenplatte v9.5: 20 locations, 16 chronology entries, 175 named airframes, 37 formations and 11 defence reports.");
