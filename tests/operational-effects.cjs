"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const {sources, topics} = JSON.parse(read("research/transcriptions/v11-operational-effects.json"));
const audit = JSON.parse(read("research/transcriptions/v11-dossier-audit.json"));
const rosters = {window:{}};
require("node:vm").runInNewContext(read("dist/force-rosters-data.js"), rosters);
const {campaigns} = rosters.window.AtlasForceRosters;
const studies = topics.flatMap(topic => topic.cases);
const evidence = read("operational-effects.html");
const assessments = read("dossier-audit.html");

// The generator quotes every field, including empty cells and multiline witness lists.
function records(file) {
  const csv = read("research/exports/"+file).trimEnd();
  const pattern = /"((?:[^"]|"")*)"([,\n]|$)/gy;
  const rows = [];
  let row = [];
  while (pattern.lastIndex < csv.length) {
    const cell = pattern.exec(csv);
    assert.ok(cell, "Malformed quoted field in "+file);
    row.push(cell[1].replaceAll('""','"'));
    if (cell[2] !== ",") { rows.push(row); row = []; }
  }
  const header = rows.shift();
  return rows.map(fields => {
    assert.equal(fields.length, header.length);
    return Object.fromEntries(header.map((label,i)=>[label,fields[i]]));
  });
}
const observations = records("operational-effects.csv");
assert.equal(studies.length,7);
assert.equal(new Set(studies.map(study=>study.id)).size,studies.length);
let expected = 0;
for (const study of studies) {
  assert.ok(evidence.includes('id="'+study.id+'"'));
  assert.ok(study.beneficiary && study.window && study.finding && study.alternative && study.limit);
  for (const id of study.sources) assert.ok(sources[id].locator && evidence.includes(sources[id].url));
  for (const t of study.tables) for (const row of t.rows) for (const [i,col] of t.columns.entries()) {
    const matches=observations.filter(o=>o.study===study.id && o.series===t.title && o.period===row.period && o.measure===col.label);
    assert.equal(matches.length,1);
    const [cell] = matches;
    assert.equal(cell.value, String(row.values[i] ?? ""));
    assert.equal(cell.url,sources[col.source].url);
    assert.equal(cell.calculation,row.derived?.[i] || "");
    assert.equal(cell.evidence_status,row.values[i]===null?"unreported in this series":cell.calculation?"calculated":"reported");
    expected++;
  }
}
assert.equal(expected, observations.length);
const arnhem = studies.find(s=>s.id==="arnhem").tables;
const sums = arnhem[0].rows.reduce((a,r)=>a.map((v,i)=>v+r.values[i+2]),[0,0]);
assert.deepEqual(sums,[1431,92]);
assert.equal(arnhem[1].rows[0].values[1]-14,sums[1]);
assert.equal(Number((100*sums[1]/sums[0]).toFixed(1)),arnhem[1].rows[1].values[2]);
const decisions=records("dossier-audit.csv");
assert.equal(decisions.length,40);
assert.deepEqual(Object.keys(audit).sort(),Object.keys(campaigns).sort());
for(const [id,c] of Object.entries(campaigns)) {
  assert.ok(assessments.includes('id="'+id+'"'));
  for(const [side,coverage] of Object.entries(c.coverage)) {
    const decision=audit[id].sides[side];
    const matches=decisions.filter(r=>r.campaign===id && r.side===side);
    assert.equal(matches.length,1);
    const [row]=matches, witness=c.cases[decision.case-1];
    assert.equal(row.mission_case,witness.title);
    for(const src of witness.sources) assert.ok(row.case_sources_and_locators.includes(src.url) && row.case_sources_and_locators.includes(src.locator));
    for (const [metric,count] of Object.entries(coverage.before)) {
      if (!Object.hasOwn(row,"v10_1_"+metric)) continue;
      assert.equal(Number(row["v10_1_"+metric]),count);
      assert.equal(Number(row["v11_"+metric]),coverage.after[metric]);
    }
    assert.equal(row.remaining_gap,decision.open);
    assert.ok(row.effort && row.losses && row.effect);
  }
}
console.log("PASS v11.0: "+studies.length+" studies, "+expected+" evidence cells and "+decisions.length+" side assessments.");
