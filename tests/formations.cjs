"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const read = p => fs.readFileSync(path.join(root,p), "utf8");
const {campaigns, units, sources} = JSON.parse(read("research/transcriptions/formation-histories.json"));
const html = read("formations.html");
const ids = [...html.matchAll(/ id="([^"]+)"/g)].map(m => m[1]);
assert.equal(new Set(ids).size, ids.length, "each public fragment must be unique");
for (const [,id] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(id), id);
assert.equal(new Set(units.map(u => u.id)).size, units.length);
assert.ok(units.length >= 20);
for (const key of ["sicily","malta","britain","normandy","reichdefense","bagration"]) {
  const members = units.filter(u => u.campaigns.includes(key));
  assert.ok(members.length >= 4, key);
  assert.ok(members.some(u => u.stations.length), key + " needs a station journey");
}
for (const unit of units) {
  assert.ok(ids.includes("unit-" + unit.id));
  assert.ok(unit.events.length >= 2 && unit.limit && unit.contribution && unit.role);
  assert.ok(fs.existsSync(path.join(root,unit.href.split(/[?#]/)[0])));
  for (const id of unit.campaigns) assert.ok(campaigns[id]);
  for (const row of [...unit.events,...unit.stations]) {
    assert.ok(row.locator && row.place && (row.period || row.date));
    assert.equal(new URL(sources[row.source].url).protocol,"https:");
    assert.ok(row.period || (row.text && /^\d{4}/.test(row.date)));
  }
}
const byId = Object.fromEntries(units.map(u => [u.id,u]));
assert.deepEqual(byId["raf-601"].campaigns, ["britain","malta","sicily"]);
assert.match(byId["raf-92"].events.at(-1).text,/differ on the sequence/);
assert.match(byId["su-1va"].events[1].text,/119.*179/);
assert.match(byId["us-416bg"].events.at(-1).text,/zero attacks/);
assert.equal(byId["su-16va"].stations.length,0);
const sicily = JSON.parse(read("research/transcriptions/sicily-air-campaign-1943.json"));
assert.deepEqual(sicily.cases.find(c => c.id === "pachino-shipping").evidence.map(e=>e.source),["orb92","nelson"]);
console.log("PASS formation source links, dated campaign memberships, station routes and contested records");
