"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const context = { window: {} };
for (const file of ["dist/grand-air-war-v77-campaigns.js", "dist/normandy-1944-story.js", "dist/grand-air-war-v80-studies.js"]) {
  vm.runInNewContext(read(file), context, { filename: file });
}
const studies = context.window.AtlasCampaignStudies;
const campaigns = context.window.GrandAirWarV77Campaigns.campaigns;
assert.deepEqual(Object.keys(studies).sort(), Array.from(campaigns, campaign => campaign.id).sort());
assert.equal(new Set(Object.values(studies).map(study => study.question)).size, 20);
for (const campaign of campaigns) {
  const study = studies[campaign.id];
  for (const key of ["question", "answer", "label", "locator", "gap"]) assert.ok(study[key]?.trim(), campaign.id + " " + key);
  assert.match(study.date, /^\d{4}-\d\d-\d\d$/);
  assert.equal(new URL(study.source).protocol, "https:");
  if (study.href) {
    assert.match(study.href, /^\.\/[\w-]+\.html[?#]/);
    assert.ok(fs.existsSync(path.join(root, study.href.split(/[?#]/)[0])));
  } else {
    const matches = campaign.moments.filter(item => item.date === study.date && (!study.episode || item.title === study.episode));
    assert.equal(matches.length, 1, campaign.id + " needs one dated case");
  }
}
const rows = JSON.parse(read("research/transcriptions/narvik-daily-1940.json")).rows;
assert.equal(rows.length, 18);
const dateAt = index => new Date(Date.UTC(1940, 4, 21 + index)).toISOString().slice(0, 10);
rows.forEach((row, i) => assert.equal(row.date, dateAt(i)));
assert.equal(rows.reduce((sum, row) => sum + (row.areaApproximate ? 0 : row.areaSorties ?? 0), 0), 594);
assert.deepEqual(rows.filter(row => row.areaSorties === null).map(row => row.date), ["1940-05-21", "1940-06-01"]);
const narvik = read("narvik.html");
assert.equal((narvik.match(/<tr id="day-/g) || []).length, 18);
for (const [date, text] of [
  ["1940-05-25", /<td>Over 40<\/td>/], ["1940-05-26", /<td>Over 50<\/td>/],
  ["1940-06-02", /<td>75<\/td><td>24<\/td><td>3<\/td><td>55<\/td>/],
  ["1940-06-03", /<td>6<\/td><td>0<\/td><td>0<\/td><td>0<\/td>/],
  ["1940-06-04", /<td>11<\/td><td>Blank<\/td><td>Blank<\/td><td>0<\/td>/],
  ["1940-06-07", /About 50/]
]) assert.match(narvik.split('<tr id="day-' + date + '">')[1].split("</tr>")[0], text);
const ledger = read("research/transcriptions/campaign-candidate-reconciliation.csv").trimEnd().split(/\r?\n/);
assert.equal(ledger.length, 321);
const dispositions = {};
for (const line of ledger.slice(1)) {
  const columns = Array.from(line.matchAll(/"((?:[^"]|"")*)"(?=,|$)/g), match => match[1].replace(/""/g, '"'));
  assert.equal(columns.length, 12);
  assert.ok(columns[11], columns[3] + " lacks a decision reason");
  dispositions[columns[10]] = (dispositions[columns[10]] || 0) + 1;
}
assert.deepEqual(dispositions, { accepted: 38, duplicate: 272, "differently scoped": 9, unverified: 1 });
console.log("PASS all 20 campaign leads, 18 Narvik reporting days, and all 320 proposal decisions");
