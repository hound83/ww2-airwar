#!/usr/bin/env node
"use strict";
/* Grand Air War v7.6 research experience: historic chronology and website smoke checks. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const g={window:{}};
vm.runInNewContext(read("dist/grand-air-war-v76-data.js"),g,{filename:"grand-air-war-v76-data.js"});
const D=g.window.GrandAirWarV76Data;
assert.equal(D.version,"7.6-preview");
assert.equal(D.airfields.length,8);
assert.equal(D.airfields.reduce((n,a)=>n+a.units.length,0),9);
assert.ok(D.story.length>=15,"need a meaningful dated narrative");
assert.equal(new Set(D.story.map(e=>e.id)).size,D.story.length,"duplicate narrative identifiers");
assert.ok(D.story.every((e,i)=>i===0||D.story[i-1].date<=e.date),"history out of sequence");
assert.equal(D.story[0].date,"1944-06-06");
assert.ok(D.story.some(e=>e.id==="b1"&&e.date==="1944-06-07"),"RAF B-1 Asnelles must not be omitted");
assert.ok(D.story.some(e=>e.id==="366"&&e.date==="1944-06-17"),"dated 366th move missing");
assert.ok(D.story.some(e=>e.id==="366july"&&e.date==="1944-07-11"),"366th local operation missing");
assert.ok(D.story.some(e=>e.id==="cobra"&&e.date==="1944-07-25"));
assert.ok(D.story.some(e=>e.id==="falaise"&&e.date==="1944-08-17"));
const a1=D.airfields.find(a=>a.code==="A-1");
assert.ok(a1.sector.includes("Omaha"),"A-1 must not be mislocated in Cotentin");
assert.ok(a1.lon>-.99&&a1.lon<-.9,"A-1 plotted in the wrong geographic region");
assert.equal(a1.groupArrival,"1944-06-17");
const a2=D.airfields.find(a=>a.code==="A-2");assert.equal(a2.opened,"1944-06-19");assert.equal(a2.declaredOperational,"1944-06-22");
const a7=D.airfields.find(a=>a.code==="A-7");assert.equal(a7.opened,"1944-06-24");assert.equal(a7.declaredOperational,"1944-07-02");
const a10=D.airfields.find(a=>a.code==="A-10");assert.equal(a10.opened,"1944-06-19");assert.equal(a10.declaredOperational,"1944-06-26");
const a6=D.airfields.find(a=>a.code==="A-6");assert.ok(a6.lon< -1.2&&a6.lon> -1.4,"A-6 geolocation error");
for(const f of D.airfields){
 assert.match(f.code,/^A-\d+$/);
 assert.ok(Number.isFinite(f.lat)&&Number.isFinite(f.lon));
 assert.ok(f.lat>48.8&&f.lat<49.8&&f.lon<-.1&&f.lon>-1.8,"field outside Normandy: "+f.code);
 assert.ok(f.constructionStart<=f.declaredOperational,"construction after readiness: "+f.code);
 assert.ok(D.sources[f.siteSourceKey]?.url.startsWith("https://"),"field source missing: "+f.code);
 for(const u of f.units)assert.match(u.sourceRowId,/^usaf1988-p\d+-l\d+$/);
}
for(const e of D.story){
 assert.match(e.date,/^1944-(06|07|08)-\d{2}$/);
 assert.ok(Number.isFinite(e.lat)&&Number.isFinite(e.lon));
 if(e.airfieldCode)assert.ok(D.airfields.some(x=>x.code===e.airfieldCode),"unknown event field "+e.airfieldCode);
 assert.ok(Array.isArray(e.sourceKeys)&&e.sourceKeys.length,"missing citations for "+e.id);
 for(const k of e.sourceKeys)assert.ok(D.sources[k]?.url.startsWith("https://"),"invalid source key "+k);
 assert.ok(e.headline&&e.detail&&e.effect,"non-substantive story event: "+e.id);
}
assert.ok(D.story.find(e=>e.id==="overlord").detail.includes("14,674"),"dated sortie evidence lost");
assert.ok(D.reviewFlags.some(x=>x.includes("First aircraft use")&&x.includes("distinct")));
assert.ok(D.reviewFlags.some(x=>x.includes("coordinates")||x.includes("Coordinates")));
const html=read("grand-air-war-v76.html"),js=read("dist/grand-air-war-v76.js"),css=read("dist/grand-air-war-v76.css");
for(const asset of ["./dist/grand-air-war-v76-data.js","./dist/grand-air-war-v76.js","./dist/grand-air-war-v76.css"]){
 assert.ok(html.includes(asset),"page missing "+asset);assert.ok(fs.existsSync(path.join(root,asset)),"asset missing "+asset);
}
assert.ok(html.includes("leaflet@1.9.4")&&html.includes("integrity="),"detailed mapping library must be pinned and integrity checked");
assert.ok(js.includes("tile.openstreetmap.org/{z}/{x}/{y}.png"),"missing real detailed map tiles");
assert.ok(js.includes("latLngToContainerPoint"),"missing pixel-based clustering");
assert.ok(js.includes("zoomend moveend"),"markers do not update on pan/zoom");
assert.ok(js.includes("sourceKeys")&&js.includes("inspect-consequence"),"narrative lost");
for(const id of ["map-surface","layer-airfields","layer-events","scene-range","scene-prev","scene-next","scene-play","story-list","airfield-list","inspect-consequence","inspect-sources","field-progress-value"]){
 assert.ok(html.includes('id="'+id+'"'),"missing interactive control "+id);
}
assert.ok(css.includes(".gaw-cluster")&&css.includes(".gaw-pin"),"missing differentiated marker styling");
assert.ok(css.includes("@media(max-width:560px)"),"mobile layout missing");
assert.ok(!html.includes("metric-losses")&&!html.includes("metric-groups"),"whole theater values must not be presented as Normandy metrics");
new vm.Script(js,{filename:"grand-air-war-v76.js"});
console.log("PASS Grand Air War v7.6: correct Normandy geography, airfield chronologies, dated narrative, Leaflet map, markers and source controls");
