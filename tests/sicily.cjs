"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const data = JSON.parse(fs.readFileSync(path.join(root, "research/transcriptions/sicily-air-campaign-1943.json"), "utf8"));
const index = list => {
  const map = new Map(list.map(item => [item.id, item]));
  assert.equal(map.size, list.length);
  return map;
};
const sites = index(data.sites);
const cases = index(data.cases);
const formations = index(data.formations);
const phases = index(data.phases);
assert.deepEqual([...phases.keys()], ["prepare", "land", "advance", "strait"]);
assert.equal(cases.get(data.initial).phase, "land");
assert.deepEqual(data.cases.map(item => item.date), data.cases.map(item => item.date).sort());
for (const site of sites.values()) {
  assert.ok(site.lat > 35 && site.lat < 39 && site.lng > 11 && site.lng < 16 && site.precision);
}
for (const item of cases.values()) {
  assert.ok(phases.has(item.phase) && sites.has(item.site) && item.evidence.length, item.id);
  assert.ok(item.date >= "1943-06-11" && (item.end || item.date) <= "1943-08-17", item.id);
  if (item.end) assert.ok(item.end > item.date, item.id);
  for (const group of item.formations) assert.ok(formations.has(group), group);
  for (const row of item.evidence) {
    assert.match(data.sources[row.source][1], /^https:\/\//);
    assert.ok(row.locator && row.note);
    for (const value of Object.values(row.figures)) assert.ok(Number.isInteger(value) && value >= 0);
  }
}
for (const station of data.stations) {
  assert.ok(sites.has(station.site) && cases.get(station.caseId).site === station.site);
}
for (const [origin, sector] of data.cover) assert.ok(sites.has(origin) && sites.has(sector));
assert.equal(cases.get("gela-friendly-fire").evidence[0].figures["Failed to return"], 23);
assert.equal(cases.get("axis-readiness").evidence[0].figures["Gerbini serviceable"], 0);
assert.deepEqual(data.stations.filter(row => row.site === "pachino").map(row => row.date), ["1943-07-10", "1943-07-12", "1943-07-13", "1943-07-14", "1943-07-16"]);
assert.deepEqual(data.stations.filter(row => row.site === "biscari").map(row => row.date), ["1943-07-12", "1943-07-14", "1943-07-16", "1943-07-19"]);
assert.equal(cases.get("messina").evidence.find(row => row.title === "German evacuation return").figures["German personnel evacuated"], 39569);
assert.deepEqual(data.stations.filter(row => row.site === "ponteolivo").map(row => row.date), ["1943-07-12", "1943-07-13", "1943-07-15", "1943-07-16"]);
assert.equal(cases.get("pachino-operational").evidence.find(r => r.source === "orb92").figures["Squadron sorties that day, all origins"], 41);
assert.ok(cases.get("pachino-patrols").formations.includes("sq92"));
assert.ok(fs.existsSync(path.join(root, "research/sources/atlas-sicily-air-campaign-2026-11-14.md")));
console.log("PASS Sicily: cases, locations, formations, capture dates, readiness and source scope");

