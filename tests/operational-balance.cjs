"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname,"..");
const read = p => fs.readFileSync(path.join(root,p),"utf8").replace(/\r\n/g,"\n");
const {version} = JSON.parse(read("research/transcriptions/europe-chapters.json"));
const {studies,sources} = JSON.parse(read("research/transcriptions/operational-balance.json"));
const html = read("operational-balance.html");
const ids = [...html.matchAll(/ id="([^"]+)"/g)].map(m=>m[1]);
assert.equal(new Set(ids).size,ids.length);
for (const [,id] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(id),id);
assert.equal(studies.length,6);
assert.match(read("grand-air-war-v80.html"),new RegExp("Live Atlas v"+version.replace(".","\\.")));
assert.ok(html.includes("Grand Air War Atlas v"+version));
const csvRows = p => read(p).trimEnd().split("\n").map(line=>[...line.matchAll(/"((?:[^"]|"")*)"(?=,|$)/g)].map(m=>m[1].replace(/""/g,'"')));
const [header,...all] = csvRows("research/exports/operational-balance.csv");
const col = name=>header.indexOf(name);
const compiled = new Map();
for (const study of studies) {
  const csv=csvRows("research/exports/operational-balance-"+study.id+".csv").slice(1);
  assert.deepEqual(csv,all.filter(row=>row[0]===study.id));
  assert.equal(csv.length,study.rows.length+study.calculations.length);
  for (const r of csv) {
    assert.equal(r.length,header.length);
    assert.ok(r[col("date_or_period")] && r[col("formation_geography_population")] && r[col("locators")] && r[col("source_classes")]);
    for (const url of r[col("source_urls")].split(" | ")) assert.equal(new URL(url).protocol,"https:");
    compiled.set(study.id+"/"+r[1],Number(r[col("value")]));
  }
  for(const entry of [...study.rows,...study.points]) assert.ok(sources[entry.source]?.kind && entry.locator,study.id);
  for(const row of study.rows) assert.ok(Number.isFinite(row.value));
  for (const unit of study.units) assert.ok(read("formations.html").includes('id="unit-'+unit+'"'));
  const [file,fragment] = study.record[0].split("#");
  const target=read(file.split("?")[0]);
  if(fragment && !file.includes("?")) assert.ok(target.includes('id="'+fragment+'"'),study.record[0]);
}
assert.equal(all.length,96);
for (const [id,value] of Object.entries({
 "normandy/attack-share":95.1,"normandy/marigny-share":0,"britain/aug-total":289,"britain/sep-total":125,"britain/reserve-draw":164,
 "reich/group-loss":52,"reich/force-loss":6.1,"reich/next-share":70.6,"bagration/strike-check":526,"bagration/minsk-sum":179,
 "bagration/minsk-headline":119,"mediterranean/bow-flown":64,"mediterranean/bow-arrival":93.8,"mediterranean/pachino":5,
 "germany/pilots-gap":93,"germany/ready-jun":59.9,"germany/ready-jul":62.4,"germany/fuel-share":2.9,"germany/quarter":7367
})) assert.equal(compiled.get(id),value,id);
const ops=JSON.parse(read("research/transcriptions/operations-january-june-1944.json")).records;
const group=ops.find(r=>r.id==="us8-445-1944-02-24").metrics;
assert.equal(compiled.get("reich/445-sent"),group.dispatched);
assert.equal(compiled.get("reich/445-lost"),group.lost);
const sov=JSON.parse(read("research/transcriptions/bagration-air-campaign-1944.json")).observations;
assert.equal(compiled.get("bagration/minsk-headline"),sov.find(r=>r.id==="minsk-loss").value);
console.log("PASS six operational balance studies, 77 evidence figures, 19 worked calculations, source lineage and seven CSVs");
