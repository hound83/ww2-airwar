#!/usr/bin/env node
"use strict";
/* End-to-end source-population, aggregation, date, geometry and output audit.
   This checks *internal* consistency, not independent archival transcription. */
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=f=>fs.readFileSync(path.join(root,f),"utf8");
const elements=new Map();
function el(id){
 if(!elements.has(id))elements.set(id,{
  id,innerHTML:"",textContent:"",value:"",checked:false,disabled:false,hidden:false,
  addEventListener(){},querySelectorAll(){return[]},setAttribute(){},scrollIntoView(){}
 });
 return elements.get(id);
}
const document={readyState:"complete",hidden:false,getElementById:el,addEventListener(){},querySelectorAll(){return[]},createElement(){return el("dynamic")},body:{appendChild(){}}};
const window={},ctx=vm.createContext({window,document,console,setInterval,clearInterval});
for(const f of ["dist/model-v3-data.js","dist/atlas-v7-data.js","dist/atlas-v71-data.js","dist/atlas-v72-data.js","dist/atlas-v73-data.js","dist/atlas-v74-data.js","dist/grand-air-war-v77-groups.js","dist/grand-air-war-v77-campaigns.js","dist/grand-air-war-v80-core.js","dist/grand-air-war-v80-german.js","dist/grand-air-war-v80-lab.js"]){vm.runInContext(read(f),ctx,{filename:f,timeout:10000});}
const D=window.GrandAirWarV77Campaigns,A=window.GrandAirWarV77,G=window.GrandAirWarV80German,L=window.GrandAirWarV80Lab;
const allFacts=D.campaigns.flatMap(c=>c.facts.map(f=>({...f,campaign:c.id})));
const allEvents=D.campaigns.flatMap(c=>c.moments.map(e=>({...e,campaign:c.id})));
const isMonth=x=>/^\d{4}-(0[1-9]|1[0-2])$/.test(x);
assert.equal(D.campaigns.length,20);
assert.equal(allFacts.length,25,"campaign quantities need an updated source-count explanation");
assert.equal(new Set(D.campaigns.map(c=>c.id)).size,D.campaigns.length);
for(const c of D.campaigns){
 assert.ok(isMonth(c.start)&&isMonth(c.end)&&c.start<=c.end,c.id+" invalid period");
 assert.ok(c.focus.lat>=30&&c.focus.lat<=76&&c.focus.lng>=-24&&c.focus.lng<=62,c.id+" off Europe chart");
 assert.ok(c.objective&&c.turningPoint&&c.consequence&&c.participants.length,c.id+" incomplete dossier");
 assert.ok(c.sources.length,c.id+" lacks source links");
 for(const id of c.sources)assert.match(D.sources[id]?.url||"",/^https?:\/\/|^\.\//,c.id+" unavailable research link");
 for(const e of c.moments){
  assert.match(e.date,/^\d{4}-\d\d-\d\d$/,c.id+" invalid event day");
  assert.ok(e.date.slice(0,7)>=c.start&&e.date.slice(0,7)<=c.end,c.id+" out-of-period event: "+e.date);
  assert.ok(Number.isFinite(e.lat)&&Number.isFinite(e.lng)&&e.title&&e.place);
 }
 for(const f of c.facts){
  assert.ok(Number.isFinite(f.value)&&f.value>=0,c.id+" invalid historical number");
  assert.ok(f.unit&&f.label&&f.scope&&f.date&&f.type,c.id+" missing comparison boundaries");
  assert.match(D.sources[f.sourceId]?.url||"",/^https?:\/\//,c.id+" fact without an external source");
  assert.ok(f.date.slice(0,7)>=c.start&&f.date.slice(0,7)<=c.end,c.id+" out-of-period fact: "+f.date);
 }
}
assert.equal(new Set(allEvents.map(e=>e.campaign+e.date+e.title)).size,allEvents.length,"duplicated dated event");
assert.equal(D.campaigns.find(c=>c.id==="spain").facts[0].value,7350);
const france=D.campaigns.find(c=>c.id==="france1940");
assert.deepEqual([...france.facts.map(f=>f.value)],[71,40,2739,651],"France observations from two distinct source populations");
assert.ok(france.facts.every(f=>f.scope.includes("RAF")),"France cannot imply all-belligerent returns");
assert.equal(A.visibleOnMap().length,20,"overview must NOT hide other campaigns in June 1944");
assert.equal(el("all-campaigns").checked,true,"all campaign centres shown by default");
const chronology=el("campaign-list").innerHTML;
assert.ok(chronology.indexOf('data-campaign="spain"')<chronology.indexOf('data-campaign="france1940"'));
assert.ok(chronology.indexOf('data-campaign="france1940"')<chronology.indexOf('data-campaign="normandy"'));
A.choose("spain");
assert.ok(el("dossier-facts").innerHTML.includes("7,350"),"Condor Legion source metric is visible");
assert.ok(el("dossier-research-context").textContent.includes("September 1943"),"avoid false 1936 Western command report");
assert.equal(el("dossier-analyze").hidden,true,"no useless disabled actions over Spain");
assert.equal(el("dossier-german-analysis").hidden,true);
A.choose("france1940");
assert.ok(el("dossier-facts").innerHTML.includes("2,739")&&el("dossier-facts").innerHTML.includes("40"));
assert.equal(el("dossier-analyze").hidden,true,"1940 source card must not route to 1943 West losses");
const before=A.selected();A.setMonth("1944-06");assert.equal(A.selected(),before,"time scrub changed dossier without consent");
const raw={type:"Feature",geometry:{type:"MultiPolygon",coordinates:[[[[-30,20],[70,20],[70,80],[-30,80],[-30,20]]],[[[-10,40],[0,40],[0,50],[-10,50],[-10,40]]]]}};
const cropped=A.clipEuropeanLand(raw);
assert.ok(cropped.geometry.coordinates.length);
const collection=A.clipEuropeanLand({type:"FeatureCollection",features:[raw]});
assert.equal(collection.geometry.coordinates.length,cropped.geometry.coordinates.length,"world-atlas GeometryCollection conversion");
for(const poly of cropped.geometry.coordinates)for(const ring of poly)for(const [lon,lat] of ring){assert.ok(lon>=-24&&lon<=62&&lat>=30&&lat<=76,"world-land edge extends outside Europe chart");}
assert.ok(cropped.geometry.coordinates.some(poly=>poly.some(r=>r.some(pt=>pt[0]===-24))),"global-ring boundary was not clipped");
const seam={type:"Feature",geometry:{type:"Polygon",coordinates:[[
 [-180,65],[179.8,65],[20,40],[-10,40],[20,50],[100,60],[179.8,69],[-180,69],[-180,65]
]]}};
const withoutStripe=A.clipEuropeanLand(seam);
for(const poly of withoutStripe.geometry.coordinates)for(const ring of poly)for(let i=1;i<ring.length;i++){
 const a=ring[i-1],b=ring[i];
 assert.ok(!(Math.abs(a[0]-b[0])>80&&a[1]>60&&b[1]>60),"dateline creates a false cross-Europe land stripe");
}
const losses=A.lossRows;
assert.equal(losses.length,30);
assert.equal(new Set(losses.map(r=>r.theater+r.period)).size,30,"duplicate command-month");
for(const r of losses){
 assert.equal(r.destroyed,r.enemyDestroyed+r.otherOperationalDestroyed+r.nonOperationalDestroyed,"destroyed aggregation for "+r.period);
 assert.equal(r.damaged,r.enemyDamaged+r.otherOperationalDamaged+r.nonOperationalDamaged,"damaged aggregation for "+r.period);
 assert.ok(r.missing<=r.enemyDestroyed,"missing is already included in enemy destroyed");
 assert.ok(!Object.values(r).some(v=>typeof v==="number"&&!Number.isFinite(v)));
}
const groups=A.groupRows;
assert.equal(groups.length,80);
assert.equal(groups.filter(r=>r.totalCombatGroups===null).length,4,"unreported theater-months should remain null");
for(const r of groups){
 if(r.totalCombatGroups===null)continue;
 const keys=["heavyBombardmentGroups","mediumAndLightBombardmentGroups","fighterGroups","troopCarrierGroups","reconnaissanceGroups"];
 const sum=keys.reduce((s,k)=>s+(r[k]??0),0);
 assert.ok(Math.abs(r.totalCombatGroups-sum-r.reportedMinusRoleSum)<1e-9,"reported organization subtotal disagreement must remain visible: "+r.month+" "+r.theater);
}
assert.equal(window.AirWarV73Data.soviet.length,5);
for(const r of window.AirWarV73Data.soviet)assert.ok(r.fighters>=r.unserviceableFighters&&r.total>=r.fighters);
assert.equal(window.AirWarV74Data.usaFactory.length,68);
for(const r of window.AirWarV74Data.usaFactory)assert.ok(isMonth(r.period)&&r.all>=0&&r.fighters<=r.all);
assert.equal(G.pilotCasualties.length,9);assert.equal(G.reichFighters.length,3);
assert.equal(G.production.length,27);assert.equal(G.fuelCapacity.length,7);assert.equal(G.unitStudies.length,2);
assert.equal(new Set(G.reichFighters.map(r=>r.date)).size,3,"27 July and 1 July are distinct observations");
for(const r of G.reichFighters)assert.ok(r.singleReady<=r.singleOnHand&&r.twinReady<=r.twinOnHand);
for(const r of G.fuelCapacity)assert.ok(r.aviationPercent>=0&&r.aviationPercent<=100&&r.overallPercent>=0&&r.overallPercent<=100);
for(const r of G.unitStudies)assert.ok(r.avgServiceable<=r.avgAircraft,"unit stock and serviceability denominator");
const may=G.unitStudies.find(r=>r.lostOrDamaged!==undefined);
assert.ok(may.completelyDestroyed<=may.lostOrDamaged,"destroyed aircraft are a subset of lost-or-damaged");
assert.equal(G.production.filter(r=>r.period.startsWith("1944-")).reduce((s,r)=>s+r.value,0),39807);
assert.equal(G.productionConflict.alternate-G.productionConflict.selected,27,"September 1944 archival discrepancy");
L.setMode("readiness");assert.ok(el("german-chart").innerHTML.includes("07-01")&&el("german-chart").innerHTML.includes("07-27"),"both July readiness dates must be identifiable");
const html=read("grand-air-war-v80.html"),css=read("dist/grand-air-war-v80.css");
for(const id of ["overview","campaigns","loss-lab","german-war-lab","air-forces","research-sources"])assert.ok(html.includes('id="'+id+'"'));
assert.ok(css.includes(".dossier-research-jump button[hidden]"),"source jumps should not overlap or show nonfunctional options");
assert.ok(read("dist/index.html").includes('href="grand-air-war-v80.html"'),"Atlas review entrypoint not discoverable");
console.log("PASS v8 data/display audit: 20 mapped dossiers, "+allFacts.length+" sourced facts, "+allEvents.length+" dated events, scoped losses, groups, fuel, readiness, production, labels and links");
