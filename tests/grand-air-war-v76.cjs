#!/usr/bin/env node
/* Grand Air War v7.6 source/scope regression checks. */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const text=name=>fs.readFileSync(path.join(root,name),"utf8");
const context={window:{}};
vm.runInNewContext(text("dist/grand-air-war-v76-data.js"),context,{filename:"grand-air-war-v76-data.js"});
const d=context.window.GrandAirWarV76Data;
assert.equal(d.version,"7.6-preview");
assert.equal(d.bounds.first,"1936-07");
assert.equal(d.bounds.last,"1945-05");
assert.equal(d.focus.initial,"1944-06");
assert.deepEqual(Array.from(d.monthly,x=>x.month),["1944-05","1944-06","1944-07","1944-08"]);
assert.deepEqual(Array.from(d.monthly,x=>x.etoCombatGroups),[102,102,103,103]);
assert.deepEqual(Array.from(d.monthly,x=>x.germanWestDestroyed),[343,998,783,868]);
assert.equal(d.airfields.length,8);
assert.equal(d.airfields.reduce((sum,f)=>sum+f.units.length,0),9);
assert.equal(d.airfields[0].code,"A-1");
assert.equal(d.airfields[0].opened,"1944-06-13");
assert.equal(d.events.length,8);
assert.ok(d.events.some(e=>e.id==="overlord"&&e.date==="6 Jun 1944"));
assert.equal(d.events.find(e=>e.id==="overlord").dayMetric.quantity,14674);
assert.equal(d.events.find(e=>e.id==="overlord").dayMetric.RAFSorties,5656);
assert.equal(d.events.find(e=>e.id==="cherbourg").date,"27 Jun 1944");
assert.ok(d.events.find(e=>e.id==="cobra").sourceKeys.includes("armyCobra"));
assert.ok(d.events.find(e=>e.id==="falaise").sourceKeys.includes("armyCobra"));
assert.ok(d.sources.rafmuseum.url.includes("rafmuseum.org.uk"));
assert.ok(d.events.some(e=>e.id==="cobra"&&e.month==="1944-07"));
assert.ok(d.events.some(e=>e.id==="falaise"&&e.month==="1944-08"));
assert.ok(d.sources.johnson.url.startsWith("https:"));
assert.ok(d.sources.digest.url.includes("StatDigest"));
assert.ok(d.sources.westJun.url.includes("western-front"));
assert.ok(d.limitations.some(t=>t.includes("not exact")));
assert.ok(d.limitations.some(t=>t.includes("different denominators")));
for(const f of d.airfields){
 assert.match(f.code,/^A-\d+$/);
 assert.ok(f.opened>="1944-06-01"&&f.opened<="1944-06-30");
 for(const u of f.units){
  assert.match(u.sourceRowId,/^usaf1988-p\d+-l\d+$/);
  assert.ok(u.first<="1944-08"&&u.last>="1944-06");
 }
}
for(const e of d.events){
 assert.ok(e.month>="1944-05"&&e.month<="1944-09");
 assert.ok(Number.isFinite(e.lat)&&Number.isFinite(e.lon));
 for(const k of e.sourceKeys)assert.ok(d.sources[k],`missing source ${k}`);
}
const html=text("grand-air-war-v76.html"),css=text("dist/grand-air-war-v76.css");
for(const file of ["./dist/grand-air-war-v76.css","./dist/atlas-v75-map.js","./dist/grand-air-war-v76-data.js","./dist/grand-air-war-v76.js"]){
 assert.ok(html.includes(file),"missing asset in page: "+file);
 assert.ok(fs.existsSync(path.join(root,file)),"missing asset file: "+file);
}
for(const id of ["map-surface","time-range","inspector","metric-groups","metric-losses","metric-fields","airfield-list","source-register"]){
 assert.ok(html.includes('id="'+id+'"'),"missing UI element "+id);
}
assert.ok(html.includes("not a complete"));
assert.ok(html.includes('id="inspect-impact"'));
assert.ok(css.includes("@media(max-width:560px)"),"missing mobile layout");
new vm.Script(text("dist/grand-air-war-v76.js"),{filename:"grand-air-war-v76.js"});
console.log("PASS Grand Air War v7.6: source-population boundaries, events, airfields, asset graph and JS parsing");
