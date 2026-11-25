"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname,"..");
const ctx = vm.createContext({window:{}});
vm.runInContext(fs.readFileSync(path.join(root,"dist/force-rosters-data.js"),"utf8"),ctx);
const d = ctx.window.AtlasForceRosters;
const before = {spain:0,poland:5,norway:2,france1940:3,britain:52,dieppe:0,malta:3,sicily:44,italy:1,
  barbarossa:4,stalingrad:0,kursk:59,bagration:83,berlin:4,reichdefense:6,schweinfurt:16,bigweek:4,normandy:0,marketgarden:0,bodenplatte:11};
function url(s) { assert.ok(["http:","https:"].includes(new URL(s).protocol)); }
assert.equal(d.version,"10.2");assert.deepEqual(Object.keys(d.campaigns).sort(),Object.keys(before).sort());
let missions=0,returns=0,named=0;
for(const [id,c] of Object.entries(d.campaigns)) {
  const sides=Object.entries(c.coverage);
  assert.equal(sides.length,2,id);
  assert.equal(sides.reduce((sum,[,s])=>sum+s.before.named,0),before[id],id+" v10.1");
  for(const [side,s] of sides) {
    const lists=c.populations.filter(p=>p.side===side), members=lists.flatMap(p=>p.members);
    assert.equal(s.after.named,members.length,id+" "+side);
    assert.equal(s.after.lists,lists.length);
    assert.ok(s.effort && s.losses && s.effect);
    assert.equal(s.after.mapped,members.filter(m=>m.stations.length).length);
    assert.equal(s.after.ready,members.filter(m=>m.serviceable!=null).length);
    named+=members.length; returns+=lists.length;
  }
  for(const k of c.cases) {
    assert.ok(k.date && k.title && k.mission && k.effect && k.limit && k.sources.length,id);
    for(const src of k.sources) { url(src.url);assert.ok(src.name && src.kind && src.locator,id+" "+k.title); }
    for(const key of k.rosterIds || [])assert.ok(c.populations.some(p=>p.id===key));
  }
  assert.ok(c.cases.length,id);
  missions+=c.cases.length;
}
const dieppe=d.campaigns.dieppe;
assert.equal(dieppe.allocations.length,9);
assert.equal(dieppe.allocations.reduce((a,x)=>a+x.total,0),74);
const allocated=dieppe.populations.find(p=>p.id==="dieppe-allied");
assert.equal(dieppe.allocations.reduce((a,x)=>a+x.named,0),allocated.members.length);
for (const a of dieppe.allocations) {
  assert.equal(allocated.members.filter(m => m.role === a.role).length, a.total, a.role);
}
assert.equal(allocated.members.filter(m => m.stations.length).length,74);
for(const [id,s] of Object.entries(d.stations)){
  assert.ok(Number.isFinite(s.lat) && Number.isFinite(s.lon) && s.locator,id);url(s.source);
}
const read=name=>fs.readFileSync(path.join(root,"research/exports",name),"utf8").replace(/\r\n/g,"\n");
assert.equal(read("campaign-coverage.csv").trimEnd().split("\n").length,41);
assert.match(read("campaign-missions.csv"),/source_type/);
console.log("PASS v10.2: 20 campaigns, 40 force-side comparisons, "+returns+" dated rosters, "+named+" named memberships, "+missions+" historical cases.");
