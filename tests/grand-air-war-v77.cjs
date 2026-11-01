#!/usr/bin/env node
"use strict";
/* Grand Air War v7.7 data, source and functional-regression checks. */
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=x=>fs.readFileSync(path.join(root,x),"utf8");
const w={},doc={readyState:"loading",addEventListener(type,cb){if(type==="DOMContentLoaded")this.ready=cb;}};
const ctx=vm.createContext({window:w,document:doc,console});
const scripts=["dist/model-v3-data.js","dist/atlas-v7-data.js","dist/atlas-v71-data.js","dist/atlas-v72-data.js","dist/atlas-v73-data.js","dist/atlas-v74-data.js","dist/grand-air-war-v77-groups.js","dist/grand-air-war-v77-campaigns.js","dist/grand-air-war-v77.js"];
for(const f of scripts){assert.ok(fs.existsSync(path.join(root,f)),"missing "+f);vm.runInContext(read(f),ctx,{filename:f,timeout:10000});}
const D=w.GrandAirWarV77Campaigns,G=w.GrandAirWarV77Groups,app=w.GrandAirWarV77;
assert.ok(D&&G&&app,"modules not loaded");
assert.equal(D.version,"7.7");
assert.equal(D.campaigns.length,19);
assert.equal(new Set(D.campaigns.map(x=>x.id)).size,19);
assert.ok(D.campaigns.some(c=>c.theater==="east"&&c.id==="bagration"));
assert.ok(D.campaigns.some(c=>c.theater==="med"&&c.id==="malta"));
assert.ok(D.campaigns.some(c=>c.theater==="north"&&c.id==="norway"));
assert.ok(D.campaigns.some(c=>c.id==="reichdefense"));
assert.ok(D.campaigns.every(x=>x.start<=x.end&&x.focus.lat&&Number.isFinite(x.focus.lng)));
assert.ok(D.campaigns.some(c=>c.id==="britain"&&c.facts.some(f=>f.type==="claim")&&c.facts.some(f=>f.value===1733)));
assert.ok(D.campaigns.some(c=>c.id==="malta"&&c.facts.some(f=>f.value===9599&&f.unit==="sorties")));
assert.ok(D.campaigns.some(c=>c.id==="normandy"&&c.facts.some(f=>f.value===14674)));
assert.ok(D.campaigns.some(c=>c.id==="bodenplatte"&&c.facts.some(f=>f.value===224)));
assert.ok(D.campaigns.some(c=>c.id==="marketgarden"&&c.facts.some(f=>f.value===57)));
for(const c of D.campaigns){
 assert.ok(c.participants.length&&c.objective&&c.turningPoint&&c.consequence,"not substantive "+c.id);
 for(const id of c.sources)assert.ok(D.sources[id]?.url,"source missing "+id);
 for(const fact of c.facts){
  assert.ok(D.sources[fact.sourceId]?.url,"fact source missing "+fact.sourceId);
  assert.ok(fact.label&&fact.scope&&fact.date&&fact.unit,"missing quantity denominator "+c.id);
 }
 for(const moment of c.moments)assert.match(moment.date,/^\d{4}-\d\d-\d\d$/);
}
assert.equal(w.AirWarV71Data.monthlyReturns.length,4);
assert.equal(w.AirWarV72Data.monthlyReturns.length,26);
assert.equal(app.lossRows.length,30);
assert.equal(app.lossRows.filter(x=>x.theater==="Reich").length,15);
assert.equal(app.lossRows.filter(x=>x.theater==="Western Front").length,15);
assert.equal(app.lossRows.find(x=>x.theater==="Western Front"&&x.period==="1944-06").destroyed,998);
assert.equal(app.lossRows.find(x=>x.theater==="Reich"&&x.period==="1944-03").nonOperationalDamaged,202);
for(const r of app.lossRows){
 assert.equal(r.destroyed,r.enemyDestroyed+r.otherOperationalDestroyed+r.nonOperationalDestroyed);
 assert.equal(r.damaged,r.enemyDamaged+r.otherOperationalDamaged+r.nonOperationalDamaged);
 assert.ok(r.missing<=r.enemyDestroyed);
}
assert.equal(G.rows.length,80);
assert.equal(app.groupRows.length,80);
assert.equal(app.groupRows.find(x=>x.month==="1944-06"&&x.theater==="ETO").totalCombatGroups,102);
assert.equal(app.groupRows.find(x=>x.month==="1944-06"&&x.theater==="ETO").fighterGroups,33);
assert.equal(w.AirWarV73Data.soviet.length,5);
assert.equal(w.AirWarV74Data.usaFactory.length,68);
assert.equal(app.monthIdx("1944-06"),95);
assert.equal(app.atIdx(0),"1936-07");
assert.equal(app.atIdx(106),"1945-05");
const html=read("grand-air-war-v77.html"),style=read("dist/grand-air-war-v77.css"),js=read("dist/grand-air-war-v77.js");
for(const f of scripts)assert.ok(html.includes("./"+f),"script order/asset missing "+f);
assert.ok(html.includes("leaflet@1.9.4")&&html.includes("integrity="));
assert.ok(js.includes("latLngToContainerPoint"),"map cluster logic missing");
assert.ok(js.includes("L.tileLayer"),"true map tiles missing");
assert.ok(js.includes("getLossData")&&js.includes("forcePoints"),"analysis engines missing");
for(const id of ["campaign-map","campaign-list","moment-list","dossier-facts","loss-command","loss-outcome","loss-window","loss-chart","loss-detail","force-series","force-area","force-metric","force-chart","force-detail","download-losses","download-force","source-catalogue"]){
 assert.ok(html.includes('id="'+id+'"'),"missing UI control: "+id);
}
assert.ok(!html.includes('metric-groups')&&!html.includes('metric-losses'),"misleading Normandy dashboard values returned");
assert.ok(style.includes("@media(max-width:540px)"));
console.log("PASS v7.7: 19 campaign dossiers and 20 sourced facts, 30 German command-loss rows, 80 ETO/MTO group records, 5 VVS snapshots, 68 production months; UI assets and controls.");
