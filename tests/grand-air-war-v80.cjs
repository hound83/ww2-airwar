#!/usr/bin/env node
"use strict";
/* Grand Air War v8.0 source, historical map, German analysis and interaction checks. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),read=file=>fs.readFileSync(path.join(root,file),"utf8");
const elements=new Map();
function el(id){
 if(!elements.has(id)){
  const handles={};
  elements.set(id,{id,value:"",textContent:"",innerHTML:"",hidden:false,checked:false,disabled:false,classList:{toggle(){},add(){},remove(){}},dataset:{},
   addEventListener(type,fn){handles[type]=fn;},querySelectorAll(){return [];},scrollIntoView(){},setAttribute(){},
   dispatch(type,value){if(value!==undefined)this.value=value;assert.ok(handles[type],id+"."+type+" not wired");handles[type]({target:this});}
  });
 }
 return elements.get(id);
}
const buttons=["pilots","readiness","production","fuel","unit"].map(x=>({dataset:{germanMode:x},classList:{toggle(){}},setAttribute(){},addEventListener(){}}));
const document={readyState:"complete",hidden:false,getElementById:el,addEventListener(){},querySelectorAll(selector){return selector==="[data-german-mode]"?buttons:[]},createElement(){return el("dynamic")},body:{appendChild(){}}};
const window={},context=vm.createContext({window,document,console,setInterval,clearInterval});
const files=["dist/model-v3-data.js","dist/atlas-v7-data.js","dist/atlas-v71-data.js","dist/atlas-v72-data.js","dist/atlas-v73-data.js","dist/atlas-v74-data.js","dist/grand-air-war-v77-groups.js","dist/grand-air-war-v77-campaigns.js","dist/grand-air-war-v80-core.js","dist/grand-air-war-v80-german.js","dist/grand-air-war-v80-lab.js"];
for(const file of files){assert.ok(fs.existsSync(path.join(root,file)),"missing "+file);vm.runInContext(read(file),context,{filename:file,timeout:8000});}
const G=window.GrandAirWarV80German,L=window.GrandAirWarV80Lab,A=window.GrandAirWarV77;
assert.ok(G&&L&&A,"one or more research engines did not load");
assert.equal(G.pilotCasualties.length,9);
assert.equal(G.reichFighters.length,3);
assert.equal(G.fuelCapacity.length,7);
assert.equal(G.unitStudies.length,2);
assert.equal(G.production.length,27);
assert.equal(G.production.filter(x=>x.period.startsWith("1944")).reduce((sum,x)=>sum+x.value,0),39807);
assert.equal(G.productionConflict.selected,4103);
assert.equal(G.productionConflict.alternate,4130);
assert.equal(G.pilotCasualties.find(x=>x.period==="1944-05").losses,578);
assert.equal(G.dec43Pilots.all,2395);
assert.equal(G.dec43Pilots.fullyCombatReady,1491);
assert.equal(G.gallandApril.lost,489);
assert.equal(G.gallandApril.replacements,396);
assert.equal(G.gallandApril.delta,-93);
assert.equal(G.reichFighters[0].singleOnHand,788);
assert.equal(G.reichFighters[0].singleReady,472);
assert.equal(G.fuelCapacity.find(x=>x.period==="1945-02").aviationPercent,5);
assert.equal(G.unitStudies[0].sorties,431);
assert.equal(G.unitStudies[1].lostOrDamaged,53);
for(const r of G.reichFighters){assert.ok(r.singleReady<=r.singleOnHand&&r.twinReady<=r.twinOnHand);}
for(const x of G.production)assert.ok(G.sources[x.source]?.url.startsWith("https://"));
const html=read("grand-air-war-v80.html"),js=read("dist/grand-air-war-v80-core.js"),labjs=read("dist/grand-air-war-v80-lab.js"),css=read("dist/grand-air-war-v80.css");
for(const f of files)assert.ok(html.includes("./"+f),"page missing "+f);
assert.ok(html.includes("./dist/grand-air-war-v80.css"));
assert.ok(html.includes("topojson-client@3.1.0"));
assert.equal((html.match(/RESEARCH LABORATORY 03/g)||[]).length,1,"Allied laboratory must have exactly one heading");
assert.ok(js.includes("land-50m.json")&&js.includes("world.objects.land")&&js.includes("window.topojson.feature"));
assert.ok(!js.includes("tile.openstreetmap.org"),"no current-state border road tiles allowed");
assert.ok(!js.includes("world.objects.countries"),"current national outlines prohibited");
assert.ok(js.includes('const threshold=state.map.getZoom()')&&js.includes("war-cluster"),"numbered collision avoidance missing");
assert.ok(js.includes("D.campaigns.findIndex")&&css.includes(".war-pin"),"campaign indices not linked to numbered map markers");
assert.ok(css.includes("[hidden]{display:none!important}")||css.includes(" [hidden]{display:none!important}"),"inactive controls must disappear");
for(const id of ["german-war-lab","german-chart","german-observation","german-series-title","german-caution","german-export","air-forces","loss-lab","campaign-map","dossier-facts"]){assert.ok(html.includes('id="'+id+'"'),"missing interface element "+id);}
assert.equal(el("dossier-title").textContent,"Normandy: Operation Overlord");
assert.ok(el("german-observation").innerHTML.includes("578"));
assert.ok(el("german-chart").innerHTML.includes("data-german-index"));
L.setMode("readiness");assert.ok(el("german-observation").innerHTML.includes("472"));assert.ok(el("german-chart").innerHTML.includes("Not serviceable"));
L.setMode("production");assert.ok(el("german-observation").innerHTML.includes("3,626"));assert.ok(el("german-caution").textContent.includes("4,103"));
L.selectRow("1944-09");assert.ok(el("german-observation").innerHTML.includes("transcription conflict"));
L.setMode("fuel");assert.ok(el("german-observation").innerHTML.includes("5%"));
L.setMode("unit");assert.ok(el("german-observation").innerHTML.includes("lost or damaged")||el("german-observation").innerHTML.includes("Lost or damaged"));
L.setMode("pilots");
A.setMonth("1944-05");assert.equal(L.current().month,"1944-06","independent laboratory date must not silently follow a campaign selection");
assert.ok(el("german-observation").innerHTML.includes("578"));
A.choose("reichdefense");assert.ok(el("dossier-title").textContent.includes("Defence of the Reich"));
console.log("PASS v8.0: 48 German series observations, physical no-border map, five working German study modes, campaign links and historical source constraints");
